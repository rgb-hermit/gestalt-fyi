import assert from "node:assert/strict";
import test from "node:test";
import { fingerprintArticle, parseReleaseManifest } from "./release-manifest.ts";

test("fingerprints are stable across object key ordering", () => {
  const first = fingerprintArticle({ title: "Accessibility", sections: [{ text: "Hello", level: 2 }] });
  const second = fingerprintArticle({ sections: [{ level: 2, text: "Hello" }], title: "Accessibility" });
  assert.equal(first, second);
  assert.match(first, /^[a-f0-9]{64}$/);
});

test("content changes create a different fingerprint", () => {
  assert.notEqual(
    fingerprintArticle({ title: "Accessibility" }),
    fingerprintArticle({ title: "Accessibility revised" }),
  );
});

test("a valid manifest is normalised", () => {
  const contentHash = fingerprintArticle({ title: "Accessibility" });
  assert.deepEqual(
    parseReleaseManifest({
      schemaVersion: 1,
      articles: [{ slug: "accessibility", contentHash, notionPageId: "page-a", extra: "ignored" }],
    }),
    { schemaVersion: 1, articles: [{ notionPageId: "page-a", slug: "accessibility", contentHash }] },
  );
});

test("malformed and duplicate manifests fail closed", () => {
  const article = {
    notionPageId: "page-a",
    slug: "accessibility",
    contentHash: fingerprintArticle("article"),
  };
  assert.throws(() => parseReleaseManifest({ schemaVersion: 2, articles: [] }), /Unsupported/);
  assert.throws(() => parseReleaseManifest({ schemaVersion: 1, articles: [{ ...article, contentHash: "bad" }] }), /Invalid/);
  assert.throws(() => parseReleaseManifest({ schemaVersion: 1, articles: [article, article] }), /Duplicate/);
});
