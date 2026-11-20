/** Identify a newly deployed editorial snapshot without relying on squash commit titles. */
import { readFile, appendFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { assertApprovedContent } from "./approved-content.mjs";

export function shouldAcknowledge(previous, current, recoveryId = "") {
  assertApprovedContent(current);
  if (recoveryId) {
    if (current.releaseId !== recoveryId || !current.releaseOperations?.length) {
      throw new Error("Recovery release ID does not match a deployed editorial snapshot");
    }
    return { acknowledge: true, reason: "Explicit recovery of deployed editorial release" };
  }
  if (!previous) throw new Error("Previous deployed snapshot is required for automatic classification");
  assertApprovedContent(previous);
  if (previous.releaseId === current.releaseId) {
    return { acknowledge: false, reason: "Snapshot release ID unchanged" };
  }
  if (!current.releaseOperations?.length) {
    throw new Error("Snapshot release ID changed without editorial operations");
  }
  return { acknowledge: true, reason: "New editorial snapshot release ID" };
}

async function main() {
  const current = JSON.parse(await readFile("src/content/field-guide-approved.json", "utf8"));
  const recoveryId = process.env.RECOVERY_RELEASE_ID ?? "";
  let previous = null;
  if (!recoveryId) {
    const raw = execFileSync("git", [
      "show", "HEAD^:astro-site/src/content/field-guide-approved.json",
    ], { encoding: "utf8" });
    previous = JSON.parse(raw);
  }
  const result = shouldAcknowledge(previous, current, recoveryId);
  console.log(`${result.acknowledge ? "EDITORIAL ACKNOWLEDGEMENT REQUIRED" : "EDITORIAL ACKNOWLEDGEMENT SKIPPED"}: ${result.reason}; release ${current.releaseId}`);
  if (!process.env.GITHUB_OUTPUT) throw new Error("GITHUB_OUTPUT is required");
  await appendFile(process.env.GITHUB_OUTPUT, `acknowledge=${result.acknowledge}\n`);
}

if (process.argv[1]?.endsWith("release-trigger.mjs")) await main();
