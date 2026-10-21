// Builds dist/, then refreshes the release copies next to this folder: ../web (static hosting) and ../index.html
// (single file with CSS and JS inlined, for opening directly from a PC).
import { execSync } from "node:child_process";
import fs from "node:fs";
execSync("node build.mjs", { stdio: "inherit" });
for (const f of ["index.html", "app.js", "app.css", "sw.js", "icon.svg"]) fs.copyFileSync(`dist/${f}`, `../web/${f}`);
const css = fs.readFileSync("dist/app.css", "utf8"),
  js = fs.readFileSync("dist/app.js", "utf8").replace(/<\/script/gi, "<\\/script");
const html = fs
  .readFileSync("src/index.html", "utf8")
  .replace('<link rel="stylesheet" href="./app.css">', () => `<style>${css}</style>`)
  .replace('<script type="module" src="./app.js"></script>', () => `<script>${js}</script>`);
fs.writeFileSync("../index.html", html);
console.log("release: ../web and ../index.html updated");
