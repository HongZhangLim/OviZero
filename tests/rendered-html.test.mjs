import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const output = new URL("../dist/client/index.html", import.meta.url);

test("exports the interactive OviZero operations dashboard", async () => {
  const html = await readFile(output, "utf8");

  assert.match(html, /<title>OviZero \| Vector-climate intelligence<\/title>/i);
  assert.match(html, /Command center/i);
  assert.match(html, /North residential block/i);
  assert.match(html, /91/);
  assert.match(html, /Critical/i);
  assert.match(html, /Targeted fogging/i);
  assert.match(html, /10 simulated pilot nodes/i);
  assert.match(html, /simulated pilot scenario/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|PPR Seri Anggerik|public health alert/i);
});
