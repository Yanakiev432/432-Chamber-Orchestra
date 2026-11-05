import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const watchedFrontendDirs = ["src", "public"];
const docsDirs = ["docs", "scripts"];
const sensitivePatterns = [
  "BREVO_API_KEY",
  "BREVO_SMTP_PASSWORD",
  "smtp-relay",
  "b02727001",
  "client_secret",
  "password"
];

async function loadEnvFile(filePath) {
  const env = {};
  if (!existsSync(filePath)) return env;
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
    env[key] = value;
  }
  return env;
}

async function walkFiles(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
    if (entry.isDirectory()) {
      files.push(...await walkFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function scanFiles(dirs) {
  const findings = [];
  for (const dir of dirs) {
    const files = await walkFiles(path.join(root, dir));
    for (const file of files) {
      const text = await readFile(file, "utf8").catch(() => "");
      for (const pattern of sensitivePatterns) {
        if (text.toLowerCase().includes(pattern.toLowerCase())) {
          findings.push({ file: path.relative(root, file), pattern });
        }
      }
    }
  }
  return findings;
}

function present(value) {
  return value ? "present" : "missing";
}

function isTrackedByGit(filePath) {
  const result = spawnSync("git", ["ls-files", "--error-unmatch", filePath], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe"
  });
  return result.status === 0;
}

const env = await loadEnvFile(envPath);
const warnings = [];

const publicSecretKeys = Object.keys(env).filter(
  (key) => key.startsWith("PUBLIC_") && /(BREVO_API_KEY|SMTP|PASSWORD|SECRET|CLIENT_SECRET)/i.test(key)
);

if (publicSecretKeys.length > 0) {
  warnings.push(`Server-side secret-like keys exposed as PUBLIC_: ${publicSecretKeys.join(", ")}`);
}

const frontendFindings = await scanFiles(watchedFrontendDirs);
const docsFindings = await scanFiles(docsDirs);

if (frontendFindings.length > 0) {
  warnings.push(
    `Sensitive CRM terms found in frontend/public code: ${frontendFindings
      .map((finding) => `${finding.file} (${finding.pattern})`)
      .join("; ")}`
  );
}

if (existsSync(envPath) && isTrackedByGit(".env.local")) {
  warnings.push(".env.local is tracked by git. Remove it from git and keep it local only.");
}

console.log("CRM configuration check");
console.log(`.env.local: ${existsSync(envPath) ? "present" : "missing"}`);
console.log(`PUBLIC_BREVO_LISTENING_FORM_URL: ${present(env.PUBLIC_BREVO_LISTENING_FORM_URL)}`);
console.log(`PUBLIC_BREVO_LISTENING_FORM_ACTION: ${present(env.PUBLIC_BREVO_LISTENING_FORM_ACTION)}`);
console.log(`PUBLIC_TALLY_EXPERTISE_URL: ${present(env.PUBLIC_TALLY_EXPERTISE_URL)}`);
console.log(`PUBLIC_TALLY_HOST_SUGGESTION_URL: ${present(env.PUBLIC_TALLY_HOST_SUGGESTION_URL)}`);
console.log(`PUBLIC_TALLY_SPONSOR_REFERRAL_URL: ${present(env.PUBLIC_TALLY_SPONSOR_REFERRAL_URL)}`);
console.log(`BREVO_API_KEY: ${present(env.BREVO_API_KEY)}`);
console.log(`BREVO_SMTP_HOST: ${present(env.BREVO_SMTP_HOST)}`);
console.log(`BREVO_SMTP_PORT: ${present(env.BREVO_SMTP_PORT)}`);
console.log(`BREVO_SMTP_LOGIN: ${present(env.BREVO_SMTP_LOGIN)}`);
console.log(`BREVO_SMTP_PASSWORD: ${present(env.BREVO_SMTP_PASSWORD)}`);

if (docsFindings.length > 0) {
  console.log(`Documentation/script references checked separately: ${docsFindings.length} explanatory occurrence(s).`);
}

if (warnings.length > 0) {
  console.warn("Warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
  process.exitCode = 1;
} else {
  console.log("No unsafe frontend/public CRM secret exposure detected.");
}
