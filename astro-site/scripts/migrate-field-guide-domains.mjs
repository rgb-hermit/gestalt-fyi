#!/usr/bin/env node
/**
 * One-off, resumable migration: Field Guide Domains multi-select -> Domain relations.
 * Node.js 20+; no npm packages required.
 *
 * Default: dry run. Pass --apply to write changes.
 * Existing multi-select is NEVER modified or removed.
 */

const API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const FIELD_GUIDE_DATABASE_ID = "052459fcf9df4a0985d0a0e68375c93b";
const DOMAINS_DATABASE_ID = "10af85e3a37844569dfffe2db04c6400";
const SOURCE_PROPERTY = "Domains";
const TARGET_PROPERTY = "Domain relations";
const DOMAIN_TITLE_PROPERTY = "Name";
const TOKEN = process.env.NOTION_API_TOKEN;
const APPLY = process.argv.includes("--apply");
const MAX_RETRIES = 6;
const DELAY_BETWEEN_WRITES_MS = 400;

if (
  process.argv.some(
    (arg) => !["--apply", "--help"].includes(arg) && arg.startsWith("--"),
  )
) {
  console.error("Unknown option. Use --apply or --help.");
  process.exit(1);
}
if (process.argv.includes("--help")) {
  console.log(
    "Usage: node migrate-field-guide-domains.mjs [--apply]\nDefault: dry run. --apply writes and verifies Domain relations.",
  );
  process.exit(0);
}
if (!TOKEN) {
  console.error(
    "Missing NOTION_API_TOKEN environment variable. Configure it in Codespaces secrets first.",
  );
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normaliseId = (id) => id.replaceAll("-", "").toLowerCase();
const textOf = (items) =>
  (items ?? [])
    .map((item) => item.plain_text ?? item.text?.content ?? "")
    .join("");
const titleOf = (page, name) => textOf(page.properties?.[name]?.title);

async function notion(path, { method = "GET", body } = {}) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let response;
    try {
      response = await fetch(`${API}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error;
      await sleep(Math.min(1000 * 2 ** attempt, 15000));
      continue;
    }
    if (response.ok) return response.json();
    const details = await response.text();
    if (
      (response.status === 429 || response.status >= 500) &&
      attempt < MAX_RETRIES
    ) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const wait =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : Math.min(1000 * 2 ** attempt, 15000);
      console.warn(
        `Notion HTTP ${response.status}; retrying in ${Math.ceil(wait / 1000)}s`,
      );
      await sleep(wait);
      continue;
    }
    throw new Error(
      `Notion ${method} ${path}: HTTP ${response.status}: ${details.slice(0, 600)}`,
    );
  }
}

async function allPages(databaseId) {
  const pages = [];
  let cursor;
  do {
    const response = await notion(`/databases/${databaseId}/query`, {
      method: "POST",
      body: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
    });
    pages.push(...response.results);
    if (response.has_more && !response.next_cursor)
      throw new Error("Notion pagination returned no cursor.");
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return pages;
}

function sameIds(a, b) {
  const left = a.map(normaliseId).sort();
  const right = b.map(normaliseId).sort();
  return left.length === right.length && left.every((id, i) => id === right[i]);
}

async function main() {
  console.log(
    `Mode: ${APPLY ? "APPLY (writes enabled)" : "DRY RUN (no writes)"}`,
  );
  const [domains, entries] = await Promise.all([
    allPages(DOMAINS_DATABASE_ID),
    allPages(FIELD_GUIDE_DATABASE_ID),
  ]);
  console.log(
    `Fetched ${domains.length} Domain records and ${entries.length} Field Guide entries.`,
  );

  const byName = new Map();
  for (const domain of domains) {
    const name = titleOf(domain, DOMAIN_TITLE_PROPERTY).trim();
    if (!name || byName.has(name))
      throw new Error(
        `Empty or duplicate Domain name: ${JSON.stringify(name)}`,
      );
    byName.set(name, domain.id);
  }
  if (domains.length !== 7)
    throw new Error(
      `Expected seven Domain records; found ${domains.length}. Stopping.`,
    );

  const plan = [];
  const errors = [];
  let assignments = 0;
  for (const entry of entries) {
    const name = titleOf(entry, "Name") || entry.id;
    const source = entry.properties?.[SOURCE_PROPERTY];
    const target = entry.properties?.[TARGET_PROPERTY];
    if (source?.type !== "multi_select" || target?.type !== "relation") {
      errors.push(
        `${name}: missing or incorrectly typed source/target property`,
      );
      continue;
    }
    const labels = source.multi_select.map((item) => item.name);
    if (!labels.length) {
      errors.push(`${name}: no source Domains; manual review required`);
      continue;
    }
    const unknown = labels.filter((label) => !byName.has(label));
    if (unknown.length) {
      errors.push(`${name}: unknown Domain(s): ${unknown.join(", ")}`);
      continue;
    }
    const desired = [...new Set(labels.map((label) => byName.get(label)))];
    const existing = target.relation.map((item) => item.id);
    assignments += desired.length;
    plan.push({ id: entry.id, name, desired, existing, labels });
  }

  const pending = plan.filter((item) => !sameIds(item.desired, item.existing));
  console.log(
    `Source assignments: ${assignments}; already matching: ${plan.length - pending.length}; updates needed: ${pending.length}.`,
  );
  if (errors.length) {
    console.error(`Stopped: ${errors.length} validation issue(s):`);
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(`Validated ${plan.length} entries. First 10 proposed changes:`);
  pending
    .slice(0, 10)
    .forEach((item) =>
      console.log(`  ${item.name}: ${item.labels.join(" + ")}`),
    );
  if (!APPLY) {
    console.log(
      "Dry run complete. No Notion data changed. Run with --apply when ready.",
    );
    return;
  }

  let changed = 0;
  const failures = [];
  for (const [index, item] of pending.entries()) {
    try {
      await notion(`/pages/${item.id}`, {
        method: "PATCH",
        body: {
          properties: {
            [TARGET_PROPERTY]: { relation: item.desired.map((id) => ({ id })) },
          },
        },
      });
      const saved = await notion(`/pages/${item.id}`);
      const actual =
        saved.properties?.[TARGET_PROPERTY]?.relation?.map((x) => x.id) ?? [];
      if (!sameIds(actual, item.desired))
        throw new Error("Read-back does not match source assignments");
      changed++;
      if (changed % 20 === 0 || index === pending.length - 1) {
        console.log(`Verified ${changed}/${pending.length} updates`);
      }
    } catch (error) {
      failures.push(`${item.name}: ${error.message}`);
      console.error(`FAILED ${item.name}: ${error.message}`);
    }
    await sleep(DELAY_BETWEEN_WRITES_MS);
  }
  console.log(
    `Write pass: ${changed} verified updates; ${failures.length} failures.`,
  );
  if (failures.length) {
    console.error("Re-run with --apply to retry safely. Failures:");
    failures.forEach((failure) => console.error(`  - ${failure}`));
    process.exitCode = 1;
    return;
  }

  // Fresh complete scan, not merely relying on individual PATCH responses.
  const fresh = await allPages(FIELD_GUIDE_DATABASE_ID);
  const mismatches = [];
  let verifiedAssignments = 0;
  for (const entry of fresh) {
    const labels =
      entry.properties?.[SOURCE_PROPERTY]?.multi_select?.map((x) => x.name) ??
      [];
    const expected = labels.map((label) => byName.get(label));
    const actual =
      entry.properties?.[TARGET_PROPERTY]?.relation?.map((x) => x.id) ?? [];
    if (expected.some((id) => !id) || !sameIds(expected, actual)) {
      mismatches.push(titleOf(entry, "Name") || entry.id);
    } else {
      verifiedAssignments += expected.length;
    }
  }
  console.log(
    `Full audit: ${fresh.length} entries; ${verifiedAssignments} matching assignments; ${mismatches.length} mismatches.`,
  );
  if (
    mismatches.length ||
    fresh.length !== entries.length ||
    verifiedAssignments !== assignments
  ) {
    console.error(`Verification failed: ${mismatches.slice(0, 20).join(", ")}`);
    process.exitCode = 1;
  } else {
    console.log(
      "SUCCESS: all Domain relations match the original multi-select assignments.",
    );
    console.log(
      "Original Domains multi-select was preserved. Do NOT delete it until Astro migration is verified.",
    );
  }
}

main().catch((error) => {
  console.error(`Migration stopped: ${error.message}`);
  process.exitCode = 1;
});
