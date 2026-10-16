let ctx: AudioContext | undefined;
let volume = 0.35,
  muted = false,
  last = 0;
export function configure(v: number, m: boolean) {
  volume = v;
  muted = m;
}
export function unlock() {
  try {
    ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {}
}
export function note(n = 0, duration = 0.28, delay = 0, soft = false) {
  if (!ctx || muted || volume === 0) return;
  const now = ctx.currentTime;
  if (!delay && !soft && now - last < 0.07) return;
  if (!delay) last = now;
  const o = ctx.createOscillator(),
    g = ctx.createGain();
  const notes = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
  o.type = soft ? "sine" : "triangle";
  o.frequency.value = notes[((n % 8) + 8) % 8];
  g.gain.setValueAtTime(0, now + delay);
  g.gain.linearRampToValueAtTime(volume * (soft ? 0.06 : 0.16), now + delay + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(now + delay);
  o.stop(now + delay + duration + 0.05);
}
export function win() {
  [0, 2, 3, 5, 7].forEach((n, i) => note(n, 0.6, i * 0.11));
}
