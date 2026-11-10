import assert from "node:assert/strict";
import test from "node:test";
import { confirmDeployedArticles } from "./release-confirmation.ts";

const queued = {
  notionPageId: "page-a",
  slug: "accessibility",
  contentHash: "abc123",
  publicationStatus: "Queued Publish",
};

test("confirms unchanged queued content after successful deployment", () => {
  assert.deepEqual(confirmDeployedArticles(true, [queued], [queued]), {
    confirmed: ["page-a"],
    skipped: [],
  });
});

test("does not confirm content when deployment failed", () => {
  const result = confirmDeployedArticles(false, [queued], [queued]);
  assert.deepEqual(result.confirmed, []);
  assert.match(result.skipped[0].reason, /not confirmed/);
});

test("does not confirm content edited during deployment", () => {
  const result = confirmDeployedArticles(true, [queued], [{ ...queued, contentHash: "new" }]);
  assert.deepEqual(result.confirmed, []);
  assert.match(result.skipped[0].reason, /changed/);
});

test("does not confirm content whose slug changed", () => {
  const result = confirmDeployedArticles(true, [queued], [{ ...queued, slug: "new-slug" }]);
  assert.deepEqual(result.confirmed, []);
});

test("does not override a status changed by an editor", () => {
  const result = confirmDeployedArticles(true, [queued], [{ ...queued, publicationStatus: "Published" }]);
  assert.deepEqual(result.confirmed, []);
  assert.match(result.skipped[0].reason, /no longer queued/);
});

test("rejects missing or duplicated release records", () => {
  assert.deepEqual(confirmDeployedArticles(true, [queued], []).confirmed, []);
  assert.throws(() => confirmDeployedArticles(true, [queued, queued], [queued]), /Duplicate/);
});
