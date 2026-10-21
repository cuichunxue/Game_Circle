import fs from "node:fs";
// Each stage: target circles as [radius, frequency, phaseDegrees], the "mistakes" applied to build the
// starting shape as [circle, property, wrongValue], which circles/properties are editable, and the copy.
// W1 teaches one idea at a time, W2 combines ideas on one flower, W3/W4 are spot-the-difference puzzles
// where every circle is editable and the mission tells how many circles are off.
const ALL = ["radius", "frequency", "phase"];
const S = [
  // ── WORLD 1 円の魔法学校 ──
  { title: "まんまるの魔法", t: [[75, 1, 0]], wrong: [[0, "radius", 25]], edit: { 0: ["radius"] },
    mission: "光る点をひっぱって、円を大きくしよう。点線のお手本に重ねてね。", discovery: "円が大きくなると、光の輪も大きくなるね。" },
  { title: "大きな月、小さな月", t: [[40, 1, 0]], wrong: [[0, "radius", 100]], edit: { 0: ["radius"] },
    mission: "こんどは大きすぎる！ 小さくして、お手本の月に重ねよう。", discovery: "大きくも小さくもできる。円の「大きさ」を使いこなせたね。" },
  { title: "ふしぎな花", t: [[65, 1, 0], [35, -3, 0]], wrong: [[1, "radius", 140]], edit: { 1: ["radius"] },
    mission: "円が2つになったよ。2番目の円の大きさを変えると、花が咲くかな？", discovery: "小さな円も、模様の形を変えているんだ。" },
  { title: "花びらのひみつ", t: [[60, 1, 0], [40, -4, 0]], wrong: [[1, "frequency", -1]], edit: { 1: ["frequency"] },
    mission: "速さを変えると、花びらはどう変わる？ お手本の花びらは何まいかな。", discovery: "回る速さを変えると、花びらの数が変わるね。" },
  { title: "逆回転の魔法", t: [[55, 1, 0], [45, -2, 0]], wrong: [[1, "frequency", 2]], edit: { 1: ["direction"] },
    mission: "回る向きを、反対にしてみよう。", discovery: "反対向きに回すと、描く形もがらっと変わるんだ。" },
  { title: "ハートのたね", t: [[60, 1, -90], [30, 2, 90], [4, -1, 90]], wrong: [[0, "radius", 150], [1, "radius", 100]], edit: { 0: ["radius"], 1: ["radius"], 2: ["radius"] },
    mission: "大きすぎる円が2つあるよ。ちょうどよくすると、ハートがあらわれる！", discovery: "円の大きさのバランスで、ハートだって描けるんだね。" },
  { title: "くるりと模様を回そう", t: [[55, 1, 0], [24, -3, 90]], wrong: [[1, "phase", 270]], edit: { 1: ["phase"] },
    mission: "形は同じなのに、向きがちがう！ 「スタート角度」で花をくるりと回そう。", discovery: "スタート角度を変えると、模様がくるりと回るね。" },
  { title: "星のひみつ", t: [[55, 1, 0], [35, -4, 0]], wrong: [[1, "frequency", -2]], edit: { 1: ["frequency"] },
    mission: "お手本の星のとがりは5つ。速さを変えて、とがりの数をそろえよう。", discovery: "反対向きに4倍速だと、とがりは5つ。速さ＋1が、とがりの数だ！" },
  { title: "円を節約しよう", t: [[55, 1, 0], [24, -3, 0], [6, 5, 0]], budget: true,
    mission: "大きさ0の円に光をともそう。少ない円で作れたら「節約！」", discovery: "小さな円がなくても、だいたいの形はできる。大事な円を見つけたね。" },
  { title: "魔法学校の卒業試験", t: [[55, 1, 0], [28, -3, 0]], wrong: [[1, "radius", 70], [1, "frequency", -1]], edit: { 0: ["radius", "frequency"], 1: ["radius", "frequency"] },
    mission: "卒業試験！ 2番目の円は、大きさも速さもちがうみたい。", discovery: "大きさと速さ、2つを組み合わせて形を作れた。卒業おめでとう！" },
  // ── WORLD 2 花びらの森 ──
  { title: "三つ葉の入り口", t: [[55, 1, 0], [30, -2, 0]], wrong: [[1, "frequency", -5]], edit: { 1: ALL },
    mission: "葉っぱが多すぎる！ 3まいにするには、速さをどうする？", discovery: "反対向きの2倍速で、葉っぱは3まい。" },
  { title: "四つ葉の願い", t: [[55, 1, 0], [30, -3, 0], [8, 5, 0]], wrong: [[1, "frequency", -1]], edit: { 1: ALL, 2: ALL },
    mission: "しあわせの四つ葉を咲かせよう。葉っぱの数を決めているのは、どの円かな？", discovery: "いちばん大きな円と2番目の円の速さで、葉っぱの数が決まるね。" },
  { title: "五枚の花びら", t: [[55, 1, 0], [30, -4, 0]], wrong: [[1, "radius", 90]], edit: { 0: ALL, 1: ALL },
    mission: "花びらがつぶれちゃった。どの円の、何を変えればいいかな？", discovery: "小さい円が大きすぎると、花びらが重なってしまうんだ。" },
  { title: "ひまわりの時計", t: [[50, 1, 0], [28, -7, 0], [8, 9, 60]], wrong: [[1, "frequency", -3]], edit: { 1: ALL, 2: ALL },
    mission: "ひまわりの花びらは8まい。今は何まいかな？", discovery: "速さを上げると、花びらがふえて細くなるね。" },
  { title: "花のかざぐるま", t: [[55, 1, 0], [25, -3, 30], [12, 5, 60]], wrong: [[1, "phase", 210], [2, "phase", 240]], edit: { 0: ALL, 1: ALL, 2: ALL },
    mission: "かざぐるまの羽の向きがバラバラ。スタート角度をそろえよう。", discovery: "スタート角度をずらすと、羽がねじれて回って見えるね。" },
  { title: "夜に咲く花", t: [[50, 1, 0], [30, 4, 0]], wrong: [[1, "frequency", -4]], edit: { 1: ALL },
    mission: "夜の花は、内側に輪っかがあるよ。回る向きを変えてみよう。", discovery: "同じ向きに回すと、とがりの代わりに輪っかができるんだ。" },
  { title: "ふたつのリズム", t: [[50, 1, 0], [25, -3, 0], [20, 5, 0]], wrong: [[1, "frequency", -2], [2, "frequency", 3]], edit: { 1: ALL, 2: ALL },
    mission: "2つの円のリズムが、どちらもずれているよ。", discovery: "2つの円の速さが合わさって、ふくざつなリズムが生まれるね。" },
  { title: "ちいさなつぼみ", t: [[60, 1, 0], [15, -5, 0], [10, 7, 90]], wrong: [[0, "radius", 30], [1, "radius", 40]], edit: { 0: ALL, 1: ALL, 2: ALL },
    mission: "大きさがあべこべ！ どの円が大きすぎて、どの円が小さすぎる？", discovery: "大きな円が形のわく、小さな円がギザギザの飾りを作っているんだ。" },
  { title: "森の花火", t: [[50, 1, 0], [25, -4, 0], [15, 6, 90], [5, -8, 0]], budget: true,
    mission: "4つの円に光をともそう。3つだけで作れるかな？", discovery: "いちばん小さな円は、細かい飾り。なくても花火はあがるね。" },
  { title: "花びらの研究者", t: [[55, 1, 0], [30, -4, 60], [12, 6, 0]], wrong: [[1, "frequency", -2], [1, "phase", 0], [2, "radius", 30]], edit: { 0: ALL, 1: ALL, 2: ALL },
    mission: "森の最後の試験！ 花びらの数、向き、飾りの大きさ…3つのちがいを見つけよう。", discovery: "速さ・角度・大きさ。花の研究者になれたね！" },
  // ── WORLD 3 星空の研究所（まちがいさがし）──
  { title: "星のコンパス", lead: "コンパスの針がふくらんでいる？", t: [[55, 1, 0], [25, -3, 0], [15, 5, 0]], wrong: [[1, "radius", 70]], all: true },
  { title: "きらめく衛星", lead: "衛星のとがりが、内側に丸まっているよ。", t: [[50, 1, 0], [25, -4, 30], [12, 6, 0], [8, -9, 0]], wrong: [[1, "frequency", 4]], all: true },
  { title: "流れ星のリボン", lead: "リボンの結び目が、反対を向いているみたい。", t: [[50, 1, 0], [30, 2, 0], [12, -3, 0], [8, 5, 0], [5, -6, 0]], wrong: [[1, "phase", 180]], all: true },
  { title: "星雲のかけら", lead: "星雲が大きすぎるし、どこかのリズムもおかしい。", t: [[55, 1, 0], [30, -2, 90], [14, 4, 0]], wrong: [[0, "radius", 100], [2, "frequency", -4]], all: true },
  { title: "銀河のうずまき", lead: "うずの数と、飾りの大きさをよく見て。", t: [[50, 1, 0], [28, -5, 0], [14, 3, 60], [8, -7, 0]], wrong: [[1, "frequency", -2], [2, "radius", 40]], all: true },
  { title: "月のレース", lead: "レースの模様がくずれている。細かいところも見てみよう。", t: [[50, 1, 0], [22, -6, 0], [16, 4, 30], [10, -11, 0], [6, 9, 0]], wrong: [[1, "radius", 60], [3, "frequency", 11]], all: true },
  { title: "天の川のしずく", lead: "しずくの向きと太さが、ちょっとちがう。", t: [[50, 1, 0], [25, 2, 90], [10, 3, 0]], wrong: [[1, "phase", 270], [2, "radius", 40]], all: true },
  { title: "星座をつなごう", t: [[55, 1, 0], [22, -4, 0], [14, 6, 0], [8, -9, 0]], wrong: [[1, "frequency", -6], [2, "frequency", 4]], all: true,
    mission: "2つの円の速さが、入れかわっているみたい！ どれとどれかな？" },
  { title: "星のオーケストラ", t: [[50, 1, 0], [25, -3, 0], [15, 5, 0], [10, -7, 0], [5, 9, 0]], budget: true,
    mission: "5つの楽器（円）に光をともそう。4つだけで演奏できるかな？", discovery: "大きな円ほど、形への影響が大きいんだ。" },
  { title: "星空の発明家", t: [[50, 1, 0], [28, -3, 30], [16, 5, 90]], wrong: [[0, "radius", 90], [1, "frequency", 3], [2, "phase", 270]], all: true,
    mission: "研究所の最後の試験！ 3つの円が、それぞれちがうところでずれているよ。" },
  // ── WORLD 4 フーリエ城（まちがいさがし・上級）──
  { title: "城の魔法陣", lead: "魔法陣のまわりに、よけいな輪っかができているよ。", t: [[50, 1, 0], [24, -3, 0], [16, 5, 0], [10, -7, 0], [6, 9, 0]], wrong: [[1, "radius", 60], [3, "frequency", 7]], all: true },
  { title: "虹色のかぎ", lead: "かぎの形が、ゆがんでいるね。", t: [[50, 1, 0], [25, 2, 0], [15, -3, 90], [10, 4, 0], [7, -6, 0], [5, 8, 0]], wrong: [[1, "frequency", -2], [2, "radius", 45]], all: true },
  { title: "光の王冠", lead: "王冠がぶかぶか！ ほかにもずれがあるよ。", t: [[55, 1, 0], [20, -7, 0], [10, 9, 0], [6, -5, 0], [4, 3, 0], [3, 11, 0], [2, -9, 0]], wrong: [[0, "radius", 110], [1, "frequency", 7], [2, "phase", 180]], all: true },
  { title: "秘密の紋章", lead: "紋章は8つの円でできている。あやしいのはどれ？", t: [[50, 1, 0], [24, -3, 0], [16, 5, 0], [12, -7, 0], [8, 9, 0], [6, -11, 0], [4, 3, 90], [3, -5, 90]], wrong: [[1, "radius", 70], [2, "frequency", 2], [4, "phase", 180]], all: true },
  { title: "鏡の迷宮", t: [[50, 1, 0], [30, -1, 0], [15, 3, 0], [10, -3, 0]], wrong: [[1, "frequency", 1], [2, "radius", 45]], all: true,
    mission: "鏡の迷宮は、たてに細長い形。左右反対に回る2つの円がカギだよ。" },
  { title: "八つのリズム", lead: "8つのとがりが、そろっていないよ。", t: [[50, 1, 0], [22, -7, 0], [14, 9, 0], [8, -3, 0], [5, 5, 0]], wrong: [[1, "frequency", -5], [2, "frequency", -9], [3, "radius", 30]], all: true },
  { title: "ひかりの万華鏡", lead: "万華鏡をのぞくと、何かがちがう…", t: [[45, 1, 0], [25, -5, 0], [18, 7, 60], [10, -11, 0], [6, -2, 0], [4, 4, 0]], wrong: [[1, "phase", 180], [2, "radius", 50], [3, "frequency", 11]], all: true },
  { title: "王国の花火", lead: "花火が大きすぎるし、リズムもちがう！", t: [[40, 1, 0], [28, -6, 0], [18, 8, 0], [10, -11, 30], [7, 4, 0], [5, -2, 0], [3, 10, 0]], wrong: [[0, "radius", 90], [1, "frequency", 6], [2, "phase", 180]], all: true },
  { title: "最後のひらめき", t: [[45, 1, 0], [25, -4, 0], [16, 6, 0], [12, -9, 0], [8, 11, 0], [6, -2, 0], [4, 3, 0], [3, -7, 0]], budget: true,
    mission: "8つの円に光をともそう。7つで作れたら、きみは節約の達人！", discovery: "たくさんの円も、大きい順に組み立てれば迷わないね。" },
  { title: "きみだけの魔法使い", t: [[50, 1, 0], [26, -3, 0], [18, 5, 90], [12, -7, 0], [8, 9, 0]], wrong: [[0, "radius", 100], [1, "frequency", 3], [2, "phase", 270], [3, "radius", 40]], all: true,
    mission: "最後の試練！ 4つの円がずれている。ここまでの魔法を全部使おう！" },
];
const worldDiscoveries = [
  "",
  "",
  ["一つずつ確かめると、まちがいが見つかるね。名探偵だ！", "速さのずれは、とがりの数でわかるね。", "形がねじれていたら、スタート角度をあやしもう。"],
  ["円がたくさんでも、一つずつ調べれば大丈夫。", "大きな円から直すと、早く近づけるね。", "フーリエの魔法は、円の足し算なんだ。"],
];
const c = ([r, f, p]) => ({ radius: r, frequency: f, phase: (p * Math.PI) / 180 });
const point = (cs, t) => cs.reduce((a, q) => ({ x: a.x + q.radius * Math.cos(q.frequency * t + q.phase), y: a.y + q.radius * Math.sin(q.frequency * t + q.phase) }), { x: 0, y: 0 });
function score(cs, target, D) {
  let e = 0;
  for (let i = 0; i < 512; i++) {
    const t = (i * 2 * Math.PI) / 512, a = point(cs, t), b = point(target, t);
    e += (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  }
  return Math.max(0, 100 * (1 - Math.sqrt(e / 512) / D));
}
const rows = S.map((s, i) => {
  const id = i + 1, world = Math.ceil(id / 10), target = s.t.map(c), type = s.budget ? "budget" : "shape";
  const initial = s.budget ? target.map((x) => ({ ...x, radius: 0 })) : structuredClone(target);
  for (const [j, prop, v] of s.wrong || []) initial[j][prop] = prop === "phase" ? (v * Math.PI) / 180 : v;
  const editable = s.budget || s.all ? Object.fromEntries(target.map((_, j) => [j, s.budget ? ["radius"] : ALL])) : s.edit;
  const D = (id === 1 ? 0.8 : 1.8) * Math.sqrt(target.reduce((a, q) => a + q.radius ** 2, 0));
  const off = new Set((s.wrong || []).map((w) => w[0])).size;
  const mission = s.mission || `${s.lead} まちがいさがしだ！ お手本とくらべて、ずれている円を見つけよう。`;
  const discovery = s.discovery || worldDiscoveries[world - 1][id % 3];
  const sc = score(initial, target, D);
  if (sc >= 70) throw new Error(`ST${id} starts cleared (${sc.toFixed(1)})`);
  return { id, world, title: s.title, mission, discovery, target, initial, editable, maxCircles: target.length, D, type, ...(s.budget ? { budgetGoal: target.length - 1 } : {}), ...(off ? { mistakes: off } : {}) };
});
if (rows.length !== 40) throw new Error("expected 40 stages");
fs.writeFileSync("src/stages.json", JSON.stringify(rows, null, 2));
console.log(rows.map((r) => `${r.id}:${score(r.initial, r.target, r.D).toFixed(0)}`).join(" "));
