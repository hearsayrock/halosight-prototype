/** Pull an immutable official token tag, record its lock, then build consumer CSS. */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const officialRepo = "git@github.com:halosight/design-system.git";
const refIndex = process.argv.indexOf("--ref");
const repoIndex = process.argv.indexOf("--repo");
const ref = refIndex === -1 ? undefined : process.argv[refIndex + 1];
const repo = repoIndex === -1 ? officialRepo : process.argv[repoIndex + 1];

if (!ref || !/^v\d+\.\d+\.\d+$/.test(ref)) {
  throw new Error("Usage: npm run sync:tokens -- --ref vX.Y.Z [--repo <repo-url-or-local-path>]");
}

const temp = mkdtempSync(join(tmpdir(), "halosight-token-sync-"));
try {
  run("git", ["clone", "--depth", "1", "--branch", ref, repo, temp]);
  const sourcePath = join(temp, "tokens", "tokens.json");
  const bytes = readFileSync(sourcePath);
  const commit = run("git", ["-C", temp, "rev-parse", "HEAD"]).trim();
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const canonicalRepo = "halosight/design-system";

  writeFileSync("tokens/tokens.json", bytes);
  writeFileSync(
    "tokens/release.json",
    `${JSON.stringify({ repo: canonicalRepo, ref, commit, sha256 }, null, 2)}\n`,
  );
  run(process.execPath, ["tokens/sd.config.mjs"]);
  console.log(`Pinned and generated from ${canonicalRepo} ${ref} (${commit}).`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.status !== 0) {
    if (result.stderr) process.stderr.write(result.stderr);
    throw new Error(`${command} failed with status ${result.status}.`);
  }
  return result.stdout ?? "";
}
