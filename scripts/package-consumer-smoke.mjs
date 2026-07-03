import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = new URL("..", import.meta.url).pathname;
const workspace = await mkdtemp(join(tmpdir(), "persistly-phaser-consumer-"));
const npmEnv = createNestedNpmEnv();
const packOutput = await execFileAsync("npm", ["pack", "--ignore-scripts", "--pack-destination", workspace], {
  cwd: repoRoot,
  env: npmEnv,
});
const tarball = resolvePackedTarball(packOutput.stdout);

if (!tarball) {
  throw new Error("npm pack did not produce a tarball.");
}

await writeFile(join(workspace, "package.json"), JSON.stringify({ type: "module", private: true }, null, 2));
await execFileAsync("npm", ["install", join(workspace, tarball), "typescript@latest", "phaser@^3.80.0"], {
  cwd: workspace,
  env: npmEnv,
});
await writeFile(
  join(workspace, "smoke.ts"),
`import {
  PersistlyGameSaveStatus,
  PersistlyPhaserStatus,
  PersistlyPhaserPlugin,
  bindPersistlyPhaserLifecycle,
  createPersistlyPhaserSaves,
  isPersistlyAccountAuthConflict,
} from "@persistlyapp/phaser";
import type {
  PersistlyPhaserConfig,
  PersistlyPhaserLifecycleOptions,
} from "@persistlyapp/phaser";

const config: PersistlyPhaserConfig = {
  runtimeKey: "ps_test_replace_me",
  accountMode: "anonymousFirst",
  deviceLabel: "Browser",
};
const lifecycle: PersistlyPhaserLifecycleOptions<{ coins: number }> = {
  getState: () => ({ coins: 1 }),
  syncOnPause: true,
};

void config;
void lifecycle;
void PersistlyPhaserPlugin;
void bindPersistlyPhaserLifecycle;
void createPersistlyPhaserSaves;
void isPersistlyAccountAuthConflict;
void PersistlyGameSaveStatus.Synced;
void PersistlyPhaserStatus.Synced;
`,
);
await execFileAsync(
  join(workspace, "node_modules", ".bin", "tsc"),
  ["smoke.ts", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--target", "ES2022", "--noEmit", "--strict"],
  { cwd: workspace },
);
await execFileAsync("node", ["--input-type=module", "-e", "import('@persistlyapp/phaser').then((sdk) => console.log(typeof sdk.createPersistlyPhaserSaves === 'function' ? 'package consumer smoke ok' : 'missing export'))"], {
  cwd: workspace,
  encoding: "utf8",
});

console.log("Package consumer smoke passed.");

function createNestedNpmEnv() {
  const env = { ...process.env };
  delete env.npm_config_dry_run;
  delete env.npm_config_json;
  delete env.npm_config_ignore_scripts;
  return env;
}

function resolvePackedTarball(stdout) {
  const trimmed = stdout.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed) && typeof parsed[0]?.filename === "string") {
      return parsed[0].filename;
    }
  } catch {
    // npm usually prints the tarball path as plain text. JSON mode is inherited in some npm lifecycle contexts.
  }

  return trimmed.split(/\s+/).at(-1);
}
