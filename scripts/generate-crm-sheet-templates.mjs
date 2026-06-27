import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDir = path.join(process.cwd(), "generated", "crm-sheets");

const templates = {
  "01-prospects.csv": [
    "Company / Person",
    "Sector",
    "Website",
    "Contact person",
    "Role",
    "Email",
    "Phone",
    "LinkedIn",
    "Warm intro via",
    "Cultural fit",
    "Decision access",
    "Financial capacity",
    "Reputational safety",
    "Useful beyond money",
    "Fit score",
    "Pathway",
    "First ask",
    "Status",
    "Next action",
    "Next action date",
    "Last contact date",
    "Source",
    "Notes",
    "Do not contact?"
  ],
  "02-listening-circle-export.csv": [
    "First name",
    "Last name",
    "Email",
    "Language",
    "Help type",
    "Source",
    "Consent source",
    "Consent date",
    "Message",
    "Brevo contact ID",
    "Notes"
  ],
  "03-sponsor-pipeline.csv": [
    "Organisation",
    "Contact person",
    "Email",
    "Deal value EUR",
    "Pathway",
    "Stage",
    "Next action",
    "Next action date",
    "Last contact date",
    "Risk",
    "Proposal sent?",
    "Sponsor brief sent?",
    "Donation policy sent?",
    "Notes"
  ],
  "04-expertise-offers.csv": [
    "Name",
    "Email",
    "Expertise type",
    "Portfolio / website",
    "Availability",
    "Message",
    "Consent date",
    "Status",
    "Next action",
    "Notes"
  ],
  "05-host-suggestions.csv": [
    "Suggested company / host / person",
    "Suggested by",
    "Suggested by email",
    "Why they fit",
    "Contact person",
    "Can introduce?",
    "Status",
    "Next action",
    "Notes"
  ],
  "06-media-list.csv": [
    "Media outlet",
    "Journalist / editor",
    "Role",
    "Email",
    "Phone",
    "Topic",
    "Relationship",
    "Last contact date",
    "Next action",
    "Notes"
  ],
  "07-donors.csv": [
    "Donor name",
    "Email",
    "Donation date",
    "Amount",
    "Currency",
    "Method",
    "Payment reference",
    "Donation purpose",
    "Certificate requested?",
    "Certificate issued?",
    "Verification status",
    "Notes"
  ],
  "08-follow-up-calendar.csv": [
    "Date",
    "Person / Organisation",
    "Channel",
    "Action",
    "Priority",
    "Status",
    "Notes"
  ],
  "09-do-not-contact.csv": [
    "Name / Organisation",
    "Email",
    "Reason",
    "Date added",
    "Source",
    "Notes"
  ]
};

function csvEscape(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

await mkdir(outputDir, { recursive: true });

for (const [fileName, columns] of Object.entries(templates)) {
  const csv = `${columns.map(csvEscape).join(",")}\n`;
  await writeFile(path.join(outputDir, fileName), csv, "utf8");
}

console.log(`Generated ${Object.keys(templates).length} CRM sheet templates in generated/crm-sheets/.`);
