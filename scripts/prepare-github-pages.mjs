import { cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "public");
const output = path.join(root, "dist-pages");
const textExtensions = new Set([".html", ".css", ".js", ".json", ".webmanifest", ".txt", ".svg"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true, force: true });
await cp(path.join(source, "ui.html"), path.join(output, "index.html"));

for (const file of await walk(output)) {
  if (!textExtensions.has(path.extname(file).toLowerCase())) continue;
  const original = await readFile(file, "utf8");
  // The local preview is served at /; GitHub Pages serves this project below
  // /hemiciclo-abierto/. Convert root-relative asset and data URLs to relative.
  const rewritten = original.replace(/(["'`])\/(?!\/)/g, "$1./");
  if (rewritten !== original) await writeFile(file, rewritten, "utf8");
}

console.log(`GitHub Pages prepared in ${path.relative(root, output)}`);
