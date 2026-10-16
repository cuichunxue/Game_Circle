import { JSDOM } from "jsdom";
import { indexedDB } from "fake-indexeddb";
import fs from "node:fs";
import assert from "node:assert/strict";
// v1.2 regression tests: stage variety, clear card flow, live closeness chip, stickers and old-save migration.
const stages = JSON.parse(fs.readFileSync("src/stages.json"));
const wait = (n = 35) => new Promise((r) => setTimeout(r, n));

// Every non-budget stage must be a different puzzle (v1.1 repeated one puzzle 30 times).
const signature = (s) =>
  JSON.stringify(
    s.initial.map((c, i) =>
      ["radius", "frequency", "phase"].filter((p) => c[p] !== s.target[i][p]).map((p) => [i, p, c[p], s.target[i][p]]),
    ),
  );
const puzzles = stages.filter((s) => s.type !== "budget").map(signature);
assert.equal(new Set(puzzles).size, puzzles.length, "duplicate puzzles");
assert.equal(new Set(stages.map((s) => s.mission)).size >= 30, true, "missions should be mostly unique");
for (const w of [3, 4])
  assert.ok(
    stages.filter((s) => s.world === w && s.type !== "budget").every((s) => s.mistakes >= 1),
    `W${w} states mistakes`,
  );
assert.ok(stages[39].mistakes >= 4, "final stage is the hardest");

async function seed(data) {
  await new Promise((resolve, reject) => {
    const q = indexedDB.open("fourier-quest", 1);
    q.onupgradeneeded = () => q.result.createObjectStore("data");
    q.onsuccess = () => {
      const db = q.result,
        t = db.transaction("data", "readwrite");
      data ? t.objectStore("data").put(data, "save") : t.objectStore("data").delete("save");
      t.oncomplete = () => (db.close(), resolve());
    };
    q.onerror = reject;
  });
}
let dom, w;
async function boot(data) {
  if (dom) dom.window.close();
  await seed(data);
  dom = new JSDOM('<div id="root"></div>', { url: "https://fourier.test/", runScripts: "outside-only", pretendToBeVisual: true });
  w = dom.window;
  w.indexedDB = indexedDB;
  w.matchMedia = () => ({ matches: false });
  w.HTMLCanvasElement.prototype.getContext = () => ({});
  w.requestAnimationFrame = () => 1;
  w.cancelAnimationFrame = () => {};
  w.eval(fs.readFileSync("dist/app.js", "utf8"));
  await wait(100);
}
const q = (sel) => w.document.querySelector(sel);
async function click(txt) {
  const b = [...w.document.querySelectorAll("button")].find((b) => b.textContent.trim() === txt || b.getAttribute("aria-label") === txt);
  assert.ok(b, `button not found ${txt}`);
  assert.ok(!b.disabled, `disabled ${txt}`);
  b.click();
  await wait();
}

await boot(null);
assert.match(q(".live-score").textContent, /ぴったり度/);
assert.equal(q(".result-card"), null);
await click("大きさを増やす");
assert.match(q(".live-score").className, /warm/, "closer shape is warm");
for (let i = 0; i < 33; i++) await click("大きさを増やす"); // radius 59 → 73% on ST1
assert.ok(q(".result-card"), "clear card appears on first star");
assert.match(q(".result-card").textContent, /★をねらう/);
assert.ok(q(".badge-toast"), "first-clear sticker toast");
assert.match(q(".badge-toast").textContent, /はじめの一歩/);
await click("★をねらう");
assert.equal(q(".result-card"), null);
for (let i = 0; i < 14; i++) await click("大きさを増やす");
assert.match(q(".result-card").textContent, /ぴったり/);
await click("つぎへ");
assert.match(q(".stage-bar").textContent, /大きな月/);
assert.equal(q(".result-card"), null, "card closes on next stage");
await click("冒険マップ");
assert.match([...w.document.querySelectorAll(".stage-grid button.next")].map((b) => b.textContent).join(), /大きな月/);
await click("閉じる");
await click("発見図鑑");
assert.equal(w.document.querySelectorAll(".sticker.got").length, 2, "first clear + no-hint three stars");
await click("閉じる");

// An old v1.1 save with progress but no sticker record: stickers count as earned, but no toast flood.
await boot({
  stageId: 12,
  mode: "quest",
  progress: Object.fromEntries(Array.from({ length: 11 }, (_, i) => [i + 1, { cleared: true, stars: 3 }])),
});
assert.equal(q(".badge-toast"), null, "no toast for stickers earned before v1.2");
await click("発見図鑑");
assert.ok(w.document.querySelectorAll(".sticker.got").length >= 3, "first, W1 and star stickers");
await click("閉じる");
await click("設定");
assert.equal([...w.document.querySelectorAll(".skins button")].filter((b) => !b.disabled).length, 4, "33 stars unlock 4 colours");

// Studio has no score chip or clear card.
await click("閉じる");
await click("自由にあそぶ");
assert.equal(q(".live-score"), null);
dom.window.close();
console.log(
  "PASS: 40 distinct puzzles, W3/W4 mistake counts, warm/cold chip, clear card and next-stage flow, NEW stage on map, stickers and toast, old-save sticker migration, colour unlocks, studio without score.",
);
