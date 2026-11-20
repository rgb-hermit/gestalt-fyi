import assert from "node:assert/strict";
import test from "node:test";
import { shouldAcknowledge } from "./release-trigger.mjs";

const operation = { id: "page-a", status: "Queued Publish", slug: "affordance", lastEdited: "2026-11-20" };
const base = { schemaVersion: 1, releaseId: "previous", domains: [], articles: [] };
const released = { ...base, releaseId: "44656063636", releaseOperations: [operation],
  articles: [{ notionPageId: "page-a", title: "Affordance", slug: "affordance", summary: "Summary",
    domains: [], types: [], blocks: [] }] };

test("new editorial snapshot is acknowledged regardless of commit subject", () => {
  assert.equal(shouldAcknowledge(base, released).acknowledge, true);
});
test("ordinary site changes never re-acknowledge a retained release", () => {
  assert.equal(shouldAcknowledge(released, released).acknowledge, false);
});
test("recovery can acknowledge an already deployed release", () => {
  assert.equal(shouldAcknowledge(released, released, "44656063636").acknowledge, true);
});
test("recovery rejects an incorrect release ID", () => {
  assert.throws(() => shouldAcknowledge(released, released, "wrong"), /Recovery release ID/);
});
test("changed release ID without queued operations fails closed", () => {
  assert.throws(() => shouldAcknowledge(base, { ...base, releaseId: "new" }), /without editorial operations/);
});
test("missing previous snapshot fails closed", () => {
  assert.throws(() => shouldAcknowledge(null, released), /Previous deployed snapshot/);
});
