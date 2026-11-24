// Loading Screen Gold — a single loading-screen tip, written to entry.txt.
// Node 22, stdlib only, no network, no input files, deterministic.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TIP =
  "Tip: the loading bar is not stuck. You and your agent are both waiting for the other one to admit nobody understands this code.";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

// Count by code points, so astral characters count as one each.
const length = [...TIP].length;
if (typeof TIP !== "string") fail("tip is not a string");
if (length < 1 || length > 200) {
  fail(`tip must be 1-200 characters, got ${length}`);
}
if (TIP.includes("\n") || TIP.includes("\r")) {
  fail("tip must be exactly one line");
}
// Reject control characters (other than none allowed here at all).
for (const ch of TIP) {
  if (ch.codePointAt(0)! < 0x20 || ch.codePointAt(0) === 0x7f) {
    fail("tip contains a control character");
  }
}

// Second validation pass: re-derive everything from the written file's
// own rules, so a tip that slips past the first check cannot ship.
// A tip that is only whitespace after trimming reads as an empty line on
// a loading screen, so it must be rejected even though it passes the
// length and single-line checks above.
if (TIP.trim().length === 0) {
  fail("tip must not be only whitespace");
}
if ([...TIP.trim()].length !== length) {
  fail("tip must not start or end with whitespace");
}

const outDir = process.env.OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, TIP, "utf8");

// Round-trip check: what we wrote must be exactly what is on disk.
const back = readFileSync(outPath, "utf8");
if (back !== TIP) fail("round-trip mismatch: entry.txt differs from the tip");
console.log(`wrote ${outPath} (${length} characters)`);
