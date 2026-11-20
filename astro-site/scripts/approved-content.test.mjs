import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { applyEditorialOperations, assertApprovedContent } from "./approved-content.mjs";

const article = (id, slug, title = slug) => ({
  notionPageId: id, slug, title, summary: "A published summary",
  domains: ["Design"], types: ["Principle"], blocks: [{ id: "block", type: "paragraph" }],
});
const baseline = {
  schemaVersion: 1, releaseId: "approved-1",
  domains: [{ name: "Design", description: "Design concepts" }],
  articles: [article("a", "existing")],
};

test("approved content is validated without Notion credentials", () => {
  assert.equal(assertApprovedContent(baseline), baseline);
  assert.throws(() => assertApprovedContent({ ...baseline, articles: [article("a", "same"), article("b", "same")] }), /Duplicate article slug/);
});

test("queued revisions only replace explicitly selected articles", () => {
  const result = applyEditorialOperations(baseline,
    [{ id: "a", status: "Queued Publish" }],
    [article("a", "existing", "Revised"), article("b", "unapproved")]);
  assert.deepEqual(result.articles.map((entry) => entry.title), ["Revised"]);
  assert.equal(baseline.articles[0].title, "existing");
});

test("queued unpublishing removes the route from the approved set", () => {
  const result = applyEditorialOperations(baseline,
    [{ id: "a", status: "Queued Unpublish" }], []);
  assert.deepEqual(result.articles, []);
});

test("missing candidate article fails closed", () => {
  assert.throws(() => applyEditorialOperations(baseline,
    [{ id: "b", status: "Queued Publish" }], []), /Missing queued article data/);
});

test("unexpected operations fail closed", () => {
  assert.throws(() => applyEditorialOperations(baseline,
    [{ id: "a", status: "Published" }], []), /Unsupported editorial operation/);
});

test("snapshot rejects expiring notion-hosted images", () => {
  const withImage = article("a", "existing");
  withImage.blocks.push({ type: "image", image: { type: "file", file: { url: "https://example.com/temporary" } } });
  assert.throws(() => assertApprovedContent({ ...baseline, articles: [withImage] }), /Expiring notion image/);
});

test("snapshot rejects classifications outside approved domains", () => {
  const withUnknownDomain = { ...article("a", "existing"), domains: ["Unapproved"] };
  assert.throws(() => assertApprovedContent({ ...baseline, articles: [withUnknownDomain] }), /Unknown domain/);
});

test("duplicate operations fail rather than silently overriding a release", () => {
  assert.throws(() => applyEditorialOperations(baseline,
    [{ id: "a", status: "Queued Publish" }, { id: "a", status: "Queued Unpublish" }],
    [article("a", "existing", "Revised")]), /Duplicate editorial operation/);
});

test("committed baseline contains the eight approved articles and seven domains", async () => {
  const snapshot = JSON.parse(await readFile(new URL("../src/content/field-guide-approved.json", import.meta.url), "utf8"));
  assert.equal(assertApprovedContent(snapshot), snapshot);
  assert.equal(snapshot.articles.length, 8);
  assert.equal(snapshot.domains.length, 7);
});

test("unrelated editorial operations cannot alter a published article", () => {
  const original = article("a", "existing", "Approved text");
  const saved = { ...baseline, articles: [original] };
  const result = applyEditorialOperations(saved,
    [{ id: "b", status: "Queued Publish" }],
    [article("b", "new-article", "New article"), article("a", "existing", "Unqueued draft")]);
  assert.equal(result.articles.find((entry) => entry.notionPageId === "a").title, "Approved text");
  assert.equal(result.articles.find((entry) => entry.notionPageId === "b").title, "New article");
});

test("unpublishing an article absent from the approved baseline fails closed", () => {
  assert.throws(() => applyEditorialOperations(baseline,
    [{ id: "missing", status: "Queued Unpublish" }], []), /absent from approved snapshot/);
});
