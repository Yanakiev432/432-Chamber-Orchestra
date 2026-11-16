// Staging-only CLI: read a local redacted evidence JSON and print a GO/NO-GO report.
// Never deploys anything and cannot query an account or website.
import { readFile } from "node:fs/promises";
import { evaluatePreflight } from "./consent-preflight.mjs";

const pathname = process.argv[2];
if (!pathname) {
  console.error("Usage: node consent-preflight-cli.mjs <evidence.json>");
  process.exitCode = 2;
} else {
  try {
    const evidence = JSON.parse(await readFile(pathname, "utf8"));
    const report = evaluatePreflight(evidence);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.status === "READY_FOR_MANUAL_GO_REVIEW" ? 0 : 1;
  } catch (_error) {
    console.error("NO_GO: evidence file unavailable or invalid JSON");
    process.exitCode = 2;
  }
}
