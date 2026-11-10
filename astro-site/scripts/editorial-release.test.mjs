import assert from "node:assert/strict";
import test from "node:test";
import { releaseChange } from "./editorial-release.mjs";

const queued = {
  id: "page-a", status: "Queued Publish", editorial: "Ready",
  slug: "accessibility", lastEdited: "2026-11-11T00:00:00Z",
  firstPublished: null,
};

test("unchanged queued publication can be acknowledged", () => {
  assert.equal(releaseChange(queued, { ...queued }), null);
});
test("revisions use the same queued publishing state", () => {
  assert.equal(releaseChange({ ...queued, firstPublished: "2026-01-01" },
    { ...queued, firstPublished: "2026-01-01" }), null);
});
test("unchanged queued unpublishing can be acknowledged", () => {
  const removing = { ...queued, status: "Queued Unpublish" };
  assert.equal(releaseChange(removing, { ...removing }), null);
});
test("status, slug and modification changes block acknowledgement", () => {
  for (const change of [
    { status: "Published" }, { slug: "other" }, { lastEdited: "later" },
  ]) {
    assert.match(releaseChange(queued, { ...queued, ...change }), /changed/);
  }
});
test("article no longer ready is not acknowledged", () => {
  assert.match(releaseChange(queued, { ...queued, editorial: "Writing" }), /Ready/);
});
test("missing current record is rejected", () => {
  assert.match(releaseChange(queued, null), /changed/);
});
