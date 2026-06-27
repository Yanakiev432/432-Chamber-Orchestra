import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const outputPath = path.join(root, "generated", "brevo-crm-setup-result.json");
const apiBase = "https://api.brevo.com/v3";
const folderName = "432 Chamber Orchestra CRM";
const smokeOnly = process.argv.includes("--smoke");

const listNames = [
  "01 Listening Circle",
  "02 Sponsor Prospects",
  "03 Donors / Patrons",
  "04 Time & Expertise",
  "05 Hosts / Venues",
  "06 Media",
  "07 Do Not Contact"
];

const attributes = [
  { name: "LANGUAGE", type: "text" },
  { name: "HELP_TYPE", type: "text" },
  { name: "SOURCE", type: "text" },
  { name: "LEAD_TYPE", type: "text" },
  { name: "SECTOR", type: "text" },
  { name: "FIT_SCORE", type: "float" },
  { name: "CONSENT_SOURCE", type: "text" },
  { name: "CONSENT_DATE", type: "date" },
  { name: "NEXT_ACTION", type: "text" },
  { name: "NOTES", type: "text" }
];

async function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const raw = await readFile(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function safeErrorMessage(errorBody) {
  if (!errorBody) return "No response body.";
  if (typeof errorBody === "string") return errorBody.slice(0, 500);
  return JSON.stringify(errorBody).slice(0, 500);
}

async function brevoRequest(pathname, options = {}) {
  const response = await fetch(`${apiBase}${pathname}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      ...options.headers
    }
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`Brevo API error ${response.status}: ${safeErrorMessage(body)}`);
  }

  return body;
}

async function getAllFolders() {
  const body = await brevoRequest("/contacts/folders?limit=50&offset=0");
  return body.folders || [];
}

async function getAllLists() {
  const body = await brevoRequest("/contacts/lists?limit=50&offset=0");
  return body.lists || [];
}

async function getAllAttributes() {
  const body = await brevoRequest("/contacts/attributes");
  return body.attributes || [];
}

async function ensureFolder(summary) {
  const folders = await getAllFolders();
  const existing = folders.find((folder) => folder.name === folderName);
  if (existing) {
    summary.skipped.folders.push(folderName);
    return existing;
  }

  const created = await brevoRequest("/contacts/folders", {
    method: "POST",
    body: JSON.stringify({ name: folderName })
  });
  summary.created.folders.push(folderName);
  return { id: created.id, name: folderName };
}

async function ensureLists(folderId, summary) {
  const lists = await getAllLists();
  const result = [];

  for (const name of listNames) {
    const existing = lists.find((list) => list.name === name);
    if (existing) {
      summary.skipped.lists.push(name);
      result.push({ id: existing.id, name });
      continue;
    }

    const created = await brevoRequest("/contacts/lists", {
      method: "POST",
      body: JSON.stringify({ name, folderId })
    });
    summary.created.lists.push(name);
    result.push({ id: created.id, name });
  }

  return result;
}

async function ensureAttributes(summary) {
  const existingAttributes = await getAllAttributes();
  const existingNames = new Set(existingAttributes.map((attribute) => attribute.name));
  const result = [];

  for (const attribute of attributes) {
    if (existingNames.has(attribute.name)) {
      summary.skipped.attributes.push(attribute.name);
      result.push(attribute);
      continue;
    }

    await brevoRequest(`/contacts/attributes/normal/${encodeURIComponent(attribute.name)}`, {
      method: "POST",
      body: JSON.stringify({ type: attribute.type })
    });
    summary.created.attributes.push(attribute.name);
    result.push(attribute);
  }

  return result;
}

await loadEnvFile(envPath);

if (!process.env.BREVO_API_KEY) {
  console.error("BREVO_API_KEY is missing. Add it to .env.local before running crm:brevo:setup.");
  process.exit(1);
}

const summary = {
  created: { folders: [], lists: [], attributes: [] },
  skipped: { folders: [], lists: [], attributes: [] }
};

try {
  if (smokeOnly) {
    await brevoRequest("/account");
    console.log("Brevo smoke test succeeded.");
    console.log("Account endpoint is reachable. No secrets were printed.");
    process.exit(0);
  }

  const folder = await ensureFolder(summary);
  const lists = await ensureLists(folder.id, summary);
  const ensuredAttributes = await ensureAttributes(summary);

  const output = {
    timestamp: new Date().toISOString(),
    folder: { id: folder.id, name: folderName },
    lists,
    attributes: ensuredAttributes.map((attribute) => attribute.name),
    summary
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log("Brevo CRM setup complete.");
  console.log(`Folder: ${summary.created.folders.length} created, ${summary.skipped.folders.length} reused.`);
  console.log(`Lists: ${summary.created.lists.length} created, ${summary.skipped.lists.length} reused.`);
  console.log(`Attributes: ${summary.created.attributes.length} created, ${summary.skipped.attributes.length} reused.`);
  console.log("Result written to generated/brevo-crm-setup-result.json.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Unknown Brevo setup error.");
  process.exit(1);
}
