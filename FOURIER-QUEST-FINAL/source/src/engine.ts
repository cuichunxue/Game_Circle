export type Circle = { radius: number; frequency: number; phase: number };
export type Stage = {
  id: number;
  world: number;
  title: string;
  mission: string;
  discovery: string;
  target: Circle[];
  initial: Circle[];
  editable: Record<number, string[]>;
  maxCircles: number;
  D: number;
  type?: string;
};
export const TAU = Math.PI * 2;
export function point(cs: Circle[], t: number) {
  let x = 0,
    y = 0;
  for (const c of cs) {
    x += c.radius * Math.cos(c.frequency * t + c.phase);
    y += c.radius * Math.sin(c.frequency * t + c.phase);
  }
  return { x, y };
}
export function sample(cs: Circle[], n = 512) {
  return Array.from({ length: n }, (_, i) => point(cs, (i * TAU) / n));
}
export function score(cs: Circle[], s: Stage) {
  const a = sample(cs),
    b = sample(s.target);
  let e = 0;
  for (let i = 0; i < a.length; i++) e += (a[i].x - b[i].x) ** 2 + (a[i].y - b[i].y) ** 2;
  return Math.max(0, 100 * (1 - Math.sqrt(e / a.length) / s.D));
}
export const stars = (v: number) => (v >= 95 ? 3 : v >= 85 ? 2 : v >= 70 ? 1 : 0);
export const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
export function resamplePath(points: { x: number; y: number }[], n = 256) {
  const closed = [...points, points[0]],
    lens = [0];
  for (let i = 1; i < closed.length; i++) lens.push(lens[i - 1] + Math.hypot(closed[i].x - closed[i - 1].x, closed[i].y - closed[i - 1].y));
  const total = lens.at(-1)!;
  if (total < 1) return [];
  let j = 1;
  return Array.from({ length: n }, (_, i) => {
    const d = (i * total) / n;
    while (lens[j] < d && j < lens.length - 1) j++;
    const q = (d - lens[j - 1]) / (lens[j] - lens[j - 1] || 1);
    return { x: closed[j - 1].x + (closed[j].x - closed[j - 1].x) * q, y: closed[j - 1].y + (closed[j].y - closed[j - 1].y) * q };
  });
}
export function fourier(points: { x: number; y: number }[], count = 32): Circle[] {
  const p = resamplePath(points);
  if (!p.length) return [];
  const mx = p.reduce((s, v) => s + v.x, 0) / p.length,
    my = p.reduce((s, v) => s + v.y, 0) / p.length;
  const out: Circle[] = [];
  for (let k = -128; k < 128; k++) {
    if (k === 0) continue;
    let re = 0,
      im = 0;
    for (let j = 0; j < p.length; j++) {
      const t = (-TAU * k * j) / p.length,
        x = p[j].x - mx,
        y = p[j].y - my;
      re += x * Math.cos(t) - y * Math.sin(t);
      im += x * Math.sin(t) + y * Math.cos(t);
    }
    re /= p.length;
    im /= p.length;
    out.push({ radius: Math.hypot(re, im), frequency: k, phase: Math.atan2(im, re) });
  }
  return out.sort((a, b) => b.radius - a.radius).slice(0, count);
}
