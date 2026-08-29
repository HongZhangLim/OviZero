import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const output = new URL("../dist/client/index.html", import.meta.url);

test("exports the judge-facing OviZero risk map", async () => {
  const html = await readFile(output, "utf8");

  assert.match(html, /<title>OviZero \| Vector-climate intelligence<\/title>/i);
  assert.match(html, /Risk map/i);
  assert.match(html, /North residential block/i);
  assert.match(html, /91/);
  assert.match(html, /Critical/i);
  assert.match(html, /Inspect drainage/i);
  assert.match(html, /Risk drivers/i);
  assert.match(html, /not a public health alert/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|PPR Seri Anggerik/i);
});
