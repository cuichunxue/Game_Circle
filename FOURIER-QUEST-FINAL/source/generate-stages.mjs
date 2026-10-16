import fs from "node:fs";
const c = (r, f = 1, p = 0) => ({ radius: r, frequency: f, phase: p });
const titles = [
  "まんまるの魔法",
  "大きな月、小さな月",
  "ふしぎな花",
  "花びらのひみつ",
  "逆回転の魔法",
  "ハートのたね",
  "くるりと模様を回そう",
  "星のひみつ",
  "円を節約しよう",
  "魔法学校の卒業試験",
  "三つ葉の入り口",
  "四つ葉の願い",
  "五枚の花びら",
  "ひまわりの時計",
  "花のかざぐるま",
  "夜に咲く花",
  "ふたつのリズム",
  "ちいさなつぼみ",
  "森の花火",
  "花びらの研究者",
  "星のコンパス",
  "きらめく衛星",
  "流れ星のリボン",
  "星雲のかけら",
  "銀河のうずまき",
  "月のレース",
  "天の川のしずく",
  "星座をつなごう",
  "星のオーケストラ",
  "星空の発明家",
  "城の魔法陣",
  "虹色のかぎ",
  "光の王冠",
  "秘密の紋章",
  "鏡の迷宮",
  "八つのリズム",
  "ひかりの万華鏡",
  "王国の花火",
  "最後のひらめき",
  "きみだけの魔法使い",
];
const rows = [];
for (let id = 1; id <= 40; id++) {
  let target,
    initial,
    editable = {},
    maxCircles,
    type = "shape";
  if (id === 1) {
    target = [c(75)];
    initial = [c(10)];
    editable = { 0: ["radius"] };
  } else if (id === 2) {
    target = [c(40)];
    initial = [c(120)];
    editable = { 0: ["radius"] };
  } else if (id === 3) {
    target = [c(65), c(35, -3)];
    initial = [c(65), c(140, -3)];
    editable = { 1: ["radius"] };
  } else if (id === 4) {
    target = [c(60), c(40, -4)];
    initial = [c(60), c(40, -1)];
    editable = { 1: ["frequency"] };
  } else if (id === 5) {
    target = [c(55), c(45, -2)];
    initial = [c(55), c(45, 2)];
    editable = { 1: ["direction"] };
  } else {
    const k = id === 6 ? 3 : id <= 10 ? 2 : id <= 20 ? 2 + (id % 3 === 0 ? 1 : 0) : id <= 30 ? 3 + (id % 3) : 4 + (id % 5);
    target = Array.from({ length: k }, (_, j) =>
      c(
        j === 0 ? 55 : Math.max(5, Math.round(40 / (j * 0.7 + 1))),
        j === 0 ? 1 : (j % 2 ? -1 : 1) * (2 + ((id + j) % 7)),
        (((id + j) % 4) * Math.PI) / 6,
      ),
    );
    if (id === 6) target = [c(60, 1, -Math.PI / 2), c(30, 2, Math.PI / 2), c(4, -1, Math.PI / 2)];
    initial = structuredClone(target);
    if (id === 7) {
      editable = { 0: ["phase"] };
      initial[0].phase += Math.PI;
    } else if (id === 9 || id % 10 === 9) {
      type = "budget";
      initial = target.map((x) => ({ ...x, radius: 0 }));
      for (let j = 0; j < k; j++) editable[j] = ["radius"];
    } else {
      for (let j = 0; j < k; j++) editable[j] = id <= 10 ? ["radius", "frequency"] : ["radius", "frequency", "phase"];
      initial[0].radius = 150;
      initial[1].radius = 100;
    }
  }
  if (id === 6) editable = { 0: ["radius"], 1: ["radius"], 2: ["radius"] };
  maxCircles = target.length;
  const D = (id <= 2 ? 0.8 : 1.8) * Math.sqrt(target.reduce((s, c) => s + c.radius ** 2, 0));
  const discovery =
    id <= 2
      ? "円が大きくなると、光の輪も大きくなるね。"
      : id === 3
        ? "小さな円も、模様の形を変えているんだ。"
        : id === 4
          ? "回る速さを変えると、模様のくり返し方が変わるね。"
          : id === 5
            ? "反対向きに回すと、描く形も変わるんだ。"
            : "一つずつ変えて比べると、円の役割が見えてくるね。";
  rows.push({
    id,
    world: Math.ceil(id / 10),
    title: titles[id - 1],
    mission:
      id <= 2
        ? "円のふちを動かして、お手本に重ねよう。"
        : id === 4
          ? "速さを変えると、花びらはどう変わる？"
          : id === 5
            ? "回る向きを、反対にしてみよう。"
            : type === "budget"
              ? "大きさ0の円を必要な分だけ使って、模様を作ろう。"
              : "ひとつ変えて、形のちがいを見つけよう。",
    discovery,
    target,
    initial,
    editable,
    maxCircles,
    D,
    type,
    ...(type === "budget" ? { budgetGoal: Math.max(1, target.length - 1) } : {}),
  });
}
fs.writeFileSync("src/stages.json", JSON.stringify(rows, null, 2));
