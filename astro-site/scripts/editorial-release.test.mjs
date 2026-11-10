import assert from "node:assert/strict";
import test from "node:test";
import { evaluateReleaseEntry } from "./editorial-release.mjs";

const entry = {
  id: "page-a",
  status: "Queued Publish",
  editorial: "Ready",
  slug: "accessibility",
  lastEdited: "2026-11-11T00:00:00Z",
  contentHash: "hash-a",
  firstPublished: null,
};

test("unchanged ready article is eligible for confirmation", () => {
  assert.equal(evaluateReleaseEntry(entry, { ...entry }, "built"), null);
  assert.equal(evaluateReleaseEntry(entry, { ...entry }, "deployed"), null);
});
test("edited blocks invalidate release even if page timestamp is unchanged", () => {
  assert.match(evaluateReleaseEntry(entry, { ...entry, contentHash: "hash-b" }, "built"), /changed/);
});
test("status, slug and page metadata edits invalidate release", () => {
  for (const change of [{ status: "Published" }, { slug: "changed" }, { lastEdited: "later" }]) {
    assert.match(evaluateReleaseEntry(entry, { ...entry, ...change }, "deployed"), /changed/);
  }
});
test("unready queued article is rejected", () => {
  assert.match(evaluateReleaseEntry(entry, { ...entry, editorial: "Draft" }, "deployed"), /Ready/);
});
test("queued removal remains eligible when unchanged", () => {
  const removed = { ...entry, status: "Queued Unpublish" };
  assert.equal(evaluateReleaseEntry(removed, { ...removed }, "built"), null);
});
