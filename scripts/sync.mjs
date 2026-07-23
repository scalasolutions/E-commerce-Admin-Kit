#!/usr/bin/env node
/**
 * Admin Kit sync — copy the kit payload into a consumer repo, or pull a
 * consumer's edits back for review.
 *
 * The payload is everything under ./admin-kit. In a consumer it maps to:
 *   admin-kit/components/*  → <target>/components/*
 *   admin-kit/lib/*         → <target>/lib/*
 *   admin-kit/styles/*      → <target>/admin-kit/styles/*
 *   admin-kit/config/*      → <target>/admin-kit/config/*   (example only)
 *   admin-kit/tailwind-preset.ts → <target>/admin-kit/tailwind-preset.ts
 *
 * Usage:
 *   node scripts/sync.mjs push <target-repo>     copy kit → consumer
 *   node scripts/sync.mjs pull <target-repo>     copy consumer components/lib → here (review with git diff)
 *   node scripts/sync.mjs diff <target-repo>     list files that differ, no writes
 *
 * Flags: --dry (print actions, write nothing)
 *
 * The kit's components import via the `@/*` alias, so components land in the
 * consumer's own components/ and lib/ trees — no import rewriting needed.
 */

import { readdirSync, statSync, mkdirSync, copyFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const KIT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "admin-kit");

// payload subdir (under admin-kit/) → destination subdir (under target repo/)
const MAP = [
  { from: "components", to: "components" },
  { from: "lib", to: "lib" },
  { from: "styles", to: "admin-kit/styles" },
  { from: "config", to: "admin-kit/config" },
  { from: "tailwind-preset.ts", to: "admin-kit/tailwind-preset.ts", file: true },
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function sameContent(a, b) {
  if (!existsSync(a) || !existsSync(b)) return false;
  return readFileSync(a).equals(readFileSync(b));
}

/** Build the list of {src, dst} pairs for a given direction. */
function pairs(target, direction) {
  const list = [];
  for (const m of MAP) {
    const kitPath = join(KIT_ROOT, m.from);
    const targetPath = join(target, m.to);
    if (m.file) {
      const [src, dst] = direction === "push" ? [kitPath, targetPath] : [targetPath, kitPath];
      list.push({ src, dst });
      continue;
    }
    // Directory: enumerate from the source side.
    const srcRoot = direction === "push" ? kitPath : targetPath;
    const dstRoot = direction === "push" ? targetPath : kitPath;
    if (!existsSync(srcRoot)) continue;
    for (const file of walk(srcRoot)) {
      const rel = relative(srcRoot, file);
      list.push({ src: file, dst: join(dstRoot, rel) });
    }
  }
  return list;
}

function main() {
  const [cmd, target, ...rest] = process.argv.slice(2);
  const dry = rest.includes("--dry");

  if (!cmd || !target || !["push", "pull", "diff"].includes(cmd)) {
    console.log("Usage: node scripts/sync.mjs <push|pull|diff> <target-repo> [--dry]");
    process.exit(1);
  }
  if (!existsSync(target)) {
    console.error(`Target repo not found: ${target}`);
    process.exit(1);
  }

  const direction = cmd === "pull" ? "pull" : "push";
  const list = pairs(target, direction);

  let changed = 0;
  let skipped = 0;
  for (const { src, dst } of list) {
    if (!existsSync(src)) continue;
    if (sameContent(src, dst)) {
      skipped++;
      continue;
    }
    changed++;
    if (cmd === "diff") {
      console.log(`  ~ ${existsSync(dst) ? "differs" : "new    "}  ${relative(process.cwd(), dst)}`);
      continue;
    }
    if (dry) {
      console.log(`  → ${relative(process.cwd(), dst)}`);
      continue;
    }
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
    console.log(`  ✓ ${relative(process.cwd(), dst)}`);
  }

  const verb = cmd === "diff" ? "differ" : dry ? "would change" : "written";
  console.log(`\n${changed} file(s) ${verb}, ${skipped} unchanged.`);
  if (cmd === "pull" && changed > 0 && !dry) {
    console.log("Review the incoming changes with `git diff` before committing.");
  }
}

main();
