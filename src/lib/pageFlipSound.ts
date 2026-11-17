/** Synthesised paper page-turn sound (no audio file): filtered noise with a swish and soft settle. */
let ctx: AudioContext | null = null;

export function playPageFlip(volume = 0.55) {
  if (typeof window === 'undefined') return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    const dur = 0.55 + Math.random() * 0.12;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const t = i / len;
      // crinkly texture: brownish noise with random grain bursts
      const white = Math.random() * 2 - 1;
      last = (last + 0.09 * white) / 1.09;
      const grain = Math.random() < 0.02 ? white * 0.9 : 0;
      const env = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 1.6) * (1 - t * 0.6);
      d[i] = (last * 3.2 + white * 0.22 + grain) * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 0.7;
    band.frequency.setValueAtTime(900, now);
    band.frequency.exponentialRampToValueAtTime(3200, now + dur * 0.45);
    band.frequency.exponentialRampToValueAtTime(700, now + dur);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 220;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(band).connect(hp).connect(gain).connect(ctx.destination);
    src.start(now);

    // soft "settle" thump as the page lands
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now + dur * 0.8);
    osc.frequency.exponentialRampToValueAtTime(60, now + dur + 0.1);
    og.gain.setValueAtTime(0.0001, now + dur * 0.8);
    og.gain.exponentialRampToValueAtTime(volume * 0.18, now + dur * 0.85);
    og.gain.exponentialRampToValueAtTime(0.0001, now + dur + 0.12);
    osc.connect(og).connect(ctx.destination);
    osc.start(now + dur * 0.8);
    osc.stop(now + dur + 0.15);
  } catch {
    /* sound is decorative */
  }
}
