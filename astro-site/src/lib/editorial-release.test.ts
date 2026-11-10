import assert from "node:assert/strict";
import test from "node:test";
import { planEditorialRelease } from "./editorial-release.ts";

const live = {
  notionPageId: "page-a",
  slug: "accessibility",
  contentHash: "previous-version",
};

test("ordinary published articles retain their deployed version", () => {
  const plan = planEditorialRelease(
    [{
      ...live,
      contentHash: "unapproved-edit",
      editorialStatus: "Ready",
      publicationStatus: "Published",
    }],
    [live],
  );

  assert.deepEqual(plan.retain, [live]);
  assert.deepEqual(plan.publish, []);
  assert.deepEqual(plan.errors, []);
});

test("queued publication proposes the exact approved version", () => {
  const plan = planEditorialRelease(
    [{
      ...live,
      contentHash: "approved-version",
      editorialStatus: "Ready",
      publicationStatus: "Queued Publish",
    }],
    [live],
  );

  assert.deepEqual(plan.publish, [{ ...live, contentHash: "approved-version" }]);
  assert.deepEqual(plan.retain, []);
  assert.deepEqual(plan.errors, []);
});

test("unpublishing requires an explicit queued removal", () => {
  const plan = planEditorialRelease(
    [{ ...live, editorialStatus: "Ready", publicationStatus: "Queued Unpublish" }],
    [live],
  );

  assert.deepEqual(plan.remove, [live]);
  assert.deepEqual(plan.retain, []);
  assert.deepEqual(plan.errors, []);
});

test("missing Notion records do not silently remove deployed pages", () => {
  const plan = planEditorialRelease([], [live]);
  assert.deepEqual(plan.retain, [live]);
  assert.deepEqual(plan.remove, []);
});

test("unready queued articles fail release planning", () => {
  const plan = planEditorialRelease(
    [{ ...live, editorialStatus: "Writing", publicationStatus: "Queued Publish" }],
    [],
  );

  assert.equal(plan.publish.length, 0);
  assert.match(plan.errors.join(" "), /not editorially Ready/);
});

test("a deployed status without a deployment record is rejected", () => {
  const plan = planEditorialRelease(
    [{ ...live, editorialStatus: "Ready", publicationStatus: "Deployed" }],
    [],
  );

  assert.match(plan.errors.join(" "), /no deployed record/);
});

test("slug collisions between retained and queued articles are rejected", () => {
  const plan = planEditorialRelease(
    [
      { ...live, editorialStatus: "Ready", publicationStatus: "Published" },
      {
        notionPageId: "page-b",
        slug: "accessibility",
        contentHash: "new-version",
        editorialStatus: "Ready",
        publicationStatus: "Queued Publish",
      },
    ],
    [live],
  );

  assert.match(plan.errors.join(" "), /Duplicate slug/);
});
