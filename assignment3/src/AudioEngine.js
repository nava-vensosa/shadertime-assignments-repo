export const SAMPLE_CATALOG = {
  'TR-505': {
    'Kick':       ['kick',   { freq: 140, end: 35, sweep: 0.06, decay: 0.3, vol: 0.9 }],
    'Snare':      ['snare',  { body: 180, bDecay: 0.1, nFreq: 4000, nQ: 0.8, nDecay: 0.14, vol: 0.65 }],
    'Low Tom':    ['tom',    { freq: 100, end: 60, decay: 0.2, vol: 0.7 }],
    'Mid Tom':    ['tom',    { freq: 140, end: 80, decay: 0.18, vol: 0.7 }],
    'Hi Tom':     ['tom',    { freq: 190, end: 110, decay: 0.15, vol: 0.7 }],
    'Rimshot':    ['rim',    { freq: 820, nFreq: 6500, decay: 0.035, vol: 0.5 }],
    'Closed HH':  ['hat',   { freq: 7000, decay: 0.05, vol: 0.3 }],
    'Open HH':   ['hat',    { freq: 6000, decay: 0.3, vol: 0.25 }],
    'Crash':      ['cym',    { freq: 5000, decay: 0.9, vol: 0.2 }],
    'Clap':       ['clap',  { freq: 3500, decay: 0.12, vol: 0.45, bursts: 3, gap: 0.012 }],
    'Cowbell':    ['cow',    { f1: 540, f2: 800, decay: 0.07, vol: 0.35 }],
  },
  'TR-606': {
    'Kick':       ['kick',   { freq: 155, end: 42, sweep: 0.055, decay: 0.22, vol: 0.85 }],
    'Snare':      ['snare',  { body: 185, bDecay: 0.08, nFreq: 3500, nQ: 0.6, nDecay: 0.12, vol: 0.6 }],
    'Low Tom':    ['tom',    { freq: 90, end: 50, decay: 0.22, vol: 0.7 }],
    'Hi Tom':     ['tom',    { freq: 170, end: 100, decay: 0.16, vol: 0.7 }],
    'Closed HH':  ['hat',   { freq: 8000, decay: 0.04, vol: 0.25 }],
    'Open HH':   ['hat',    { freq: 7000, decay: 0.25, vol: 0.22 }],
    'Cymbal':     ['cym',    { freq: 6000, decay: 1.0, vol: 0.18 }],
  },
  'TR-707': {
    'Kick':       ['kick',   { freq: 150, end: 38, sweep: 0.065, decay: 0.32, vol: 0.95 }],
    'Snare':      ['snare',  { body: 195, bDecay: 0.1, nFreq: 3200, nQ: 0.7, nDecay: 0.16, vol: 0.7 }],
    'Low Tom':    ['tom',    { freq: 95, end: 55, decay: 0.22, vol: 0.75 }],
    'Mid Tom':    ['tom',    { freq: 135, end: 78, decay: 0.19, vol: 0.75 }],
    'Hi Tom':     ['tom',    { freq: 185, end: 108, decay: 0.16, vol: 0.75 }],
    'Rimshot':    ['rim',    { freq: 850, nFreq: 7000, decay: 0.03, vol: 0.5 }],
    'Closed HH':  ['hat',   { freq: 7500, decay: 0.045, vol: 0.3 }],
    'Open HH':   ['hat',    { freq: 6500, decay: 0.28, vol: 0.25 }],
    'Crash':      ['cym',    { freq: 4500, decay: 1.2, vol: 0.2 }],
    'Ride':       ['cym',    { freq: 7000, decay: 0.8, vol: 0.18 }],
    'Clap':       ['clap',  { freq: 3200, decay: 0.14, vol: 0.5, bursts: 4, gap: 0.01 }],
    'Cowbell':    ['cow',    { f1: 560, f2: 845, decay: 0.08, vol: 0.35 }],
    'Tambourine': ['tamb',  { freq: 9000, decay: 0.1, vol: 0.2 }],
  },
  'TR-808': {
    'Kick':       ['kick',   { freq: 160, end: 28, sweep: 0.1, decay: 0.5, vol: 1.0 }],
    'Snare':      ['snare',  { body: 175, bDecay: 0.12, nFreq: 2500, nQ: 0.5, nDecay: 0.22, vol: 0.7 }],
    'Clap':       ['clap',  { freq: 2500, decay: 0.18, vol: 0.55, bursts: 4, gap: 0.015 }],
    'Closed HH':  ['hat',   { freq: 8000, decay: 0.06, vol: 0.28 }],
    'Open HH':   ['hat',    { freq: 6500, decay: 0.35, vol: 0.24 }],
    'Low Tom':    ['tom',    { freq: 80, end: 40, decay: 0.3, vol: 0.8 }],
    'Mid Tom':    ['tom',    { freq: 120, end: 65, decay: 0.25, vol: 0.8 }],
    'Hi Tom':     ['tom',    { freq: 165, end: 95, decay: 0.2, vol: 0.8 }],
    'Cymbal':     ['cym',    { freq: 5000, decay: 1.5, vol: 0.2 }],
    'Rimshot':    ['rim',    { freq: 760, nFreq: 5500, decay: 0.04, vol: 0.5 }],
    'Cowbell':    ['cow',    { f1: 540, f2: 800, decay: 0.08, vol: 0.4 }],
    'Clave':      ['clave', { freq: 2500, decay: 0.025, vol: 0.4 }],
    'Maracas':    ['shk',   { freq: 10000, decay: 0.03, vol: 0.2 }],
    'Low Conga':  ['conga', { freq: 200, end: 120, decay: 0.18, vol: 0.6 }],
    'Mid Conga':  ['conga', { freq: 280, end: 160, decay: 0.15, vol: 0.6 }],
    'Hi Conga':   ['conga', { freq: 370, end: 220, decay: 0.12, vol: 0.6 }],
  },
  'TR-909': {
    'Kick':       ['kick',   { freq: 165, end: 33, sweep: 0.08, decay: 0.4, vol: 1.0 }],
    'Snare':      ['snare',  { body: 210, bDecay: 0.1, nFreq: 3000, nQ: 1.2, nDecay: 0.2, vol: 0.75 }],
    'Clap':       ['clap',  { freq: 3000, decay: 0.2, vol: 0.55, bursts: 5, gap: 0.008 }],
    'Closed HH':  ['hat',   { freq: 9000, decay: 0.04, vol: 0.3 }],
    'Open HH':   ['hat',    { freq: 7000, decay: 0.3, vol: 0.26 }],
    'Low Tom':    ['tom',    { freq: 85, end: 45, decay: 0.28, vol: 0.8 }],
    'Mid Tom':    ['tom',    { freq: 130, end: 70, decay: 0.22, vol: 0.8 }],
    'Hi Tom':     ['tom',    { freq: 175, end: 100, decay: 0.18, vol: 0.8 }],
    'Crash':      ['cym',    { freq: 4500, decay: 1.8, vol: 0.2 }],
    'Ride':       ['cym',    { freq: 8000, decay: 1.0, vol: 0.16 }],
    'Rimshot':    ['rim',    { freq: 700, nFreq: 6000, decay: 0.035, vol: 0.5 }],
  },
  'HR-16': {
    'Kick':       ['kick',   { freq: 148, end: 34, sweep: 0.06, decay: 0.3, vol: 0.95 }],
    'Snare':      ['snare',  { body: 190, bDecay: 0.09, nFreq: 3800, nQ: 0.9, nDecay: 0.15, vol: 0.7 }],
    'Sidestick':  ['rim',    { freq: 900, nFreq: 7500, decay: 0.025, vol: 0.45 }],
    'Tom 1':      ['tom',    { freq: 85, end: 48, decay: 0.22, vol: 0.75 }],
    'Tom 2':      ['tom',    { freq: 115, end: 65, decay: 0.19, vol: 0.75 }],
    'Tom 3':      ['tom',    { freq: 150, end: 88, decay: 0.16, vol: 0.75 }],
    'Tom 4':      ['tom',    { freq: 190, end: 112, decay: 0.14, vol: 0.75 }],
    'Closed HH':  ['hat',   { freq: 8000, decay: 0.045, vol: 0.3 }],
    'Open HH':   ['hat',    { freq: 6500, decay: 0.28, vol: 0.25 }],
    'Crash':      ['cym',    { freq: 4000, decay: 1.2, vol: 0.2 }],
    'Ride':       ['cym',    { freq: 7500, decay: 0.9, vol: 0.18 }],
    'Clap':       ['clap',  { freq: 3500, decay: 0.13, vol: 0.5, bursts: 3, gap: 0.01 }],
    'Cowbell':    ['cow',    { f1: 560, f2: 830, decay: 0.075, vol: 0.35 }],
    'Tambourine': ['tamb',  { freq: 9000, decay: 0.1, vol: 0.2 }],
    'Shaker':     ['shk',   { freq: 8500, decay: 0.06, vol: 0.2 }],
  },
  'DMX': {
    'Kick':       ['kick',   { freq: 135, end: 30, sweep: 0.07, decay: 0.28, vol: 0.9 }],
    'Snare':      ['snare',  { body: 168, bDecay: 0.1, nFreq: 2800, nQ: 0.6, nDecay: 0.18, vol: 0.65 }],
    'Low Tom':    ['tom',    { freq: 75, end: 38, decay: 0.25, vol: 0.7 }],
    'Mid Tom':    ['tom',    { freq: 110, end: 60, decay: 0.2, vol: 0.7 }],
    'Hi Tom':     ['tom',    { freq: 155, end: 88, decay: 0.17, vol: 0.7 }],
    'Closed HH':  ['hat',   { freq: 7000, decay: 0.05, vol: 0.25 }],
    'Open HH':   ['hat',    { freq: 5500, decay: 0.3, vol: 0.22 }],
    'Crash':      ['cym',    { freq: 4500, decay: 1.1, vol: 0.18 }],
    'Ride':       ['cym',    { freq: 7000, decay: 0.85, vol: 0.16 }],
    'Clap':       ['clap',  { freq: 2800, decay: 0.15, vol: 0.5, bursts: 3, gap: 0.012 }],
    'Rimshot':    ['rim',    { freq: 750, nFreq: 5500, decay: 0.03, vol: 0.45 }],
    'Cowbell':    ['cow',    { f1: 520, f2: 780, decay: 0.075, vol: 0.35 }],
    'Tambourine': ['tamb',  { freq: 8500, decay: 0.1, vol: 0.18 }],
    'Shaker':     ['shk',   { freq: 8000, decay: 0.06, vol: 0.18 }],
  },
};

const SYNTH = {
  kick(ctx, t, p) {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(p.freq, t);
    osc.frequency.exponentialRampToValueAtTime(p.end, t + p.sweep);
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + p.decay);
    // Click transient
    const c = ctx.createOscillator();
    c.frequency.setValueAtTime(p.freq * 2, t);
    c.frequency.exponentialRampToValueAtTime(p.end * 1.5, t + 0.02);
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(p.vol * 0.5, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    c.connect(cg).connect(ctx.destination);
    c.start(t);
    c.stop(t + 0.04);
  },

  snare(ctx, t, p) {
    // Noise burst
    const dur = p.nDecay + 0.02;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur | 0, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource();
    ns.buffer = buf;
    const fl = ctx.createBiquadFilter();
    fl.type = 'bandpass';
    fl.frequency.value = p.nFreq;
    fl.Q.value = p.nQ;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(p.vol, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + p.nDecay);
    ns.connect(fl).connect(ng).connect(ctx.destination);
    ns.start(t);
    ns.stop(t + dur);
    // Body tone
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(p.body, t);
    osc.frequency.exponentialRampToValueAtTime(p.body * 0.6, t + 0.05);
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(p.vol * 0.7, t);
    bg.gain.exponentialRampToValueAtTime(0.001, t + p.bDecay);
    osc.connect(bg).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + p.bDecay);
  },

  hat(ctx, t, p) {
    const dur = p.decay + 0.01;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur | 0, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource();
    ns.buffer = buf;
    const fl = ctx.createBiquadFilter();
    fl.type = 'highpass';
    fl.frequency.value = p.freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    ns.connect(fl).connect(g).connect(ctx.destination);
    ns.start(t);
    ns.stop(t + dur);
  },

  tom(ctx, t, p) {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(p.freq, t);
    osc.frequency.exponentialRampToValueAtTime(p.end, t + p.decay * 0.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + p.decay);
  },

  cym(ctx, t, p) {
    const dur = p.decay + 0.02;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur | 0, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource();
    ns.buffer = buf;
    const fl = ctx.createBiquadFilter();
    fl.type = 'highpass';
    fl.frequency.value = p.freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    ns.connect(fl).connect(g).connect(ctx.destination);
    ns.start(t);
    ns.stop(t + dur);
    // Metallic shimmer
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(p.freq * 0.7, t);
    const og = ctx.createGain();
    og.gain.setValueAtTime(p.vol * 0.08, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + p.decay * 0.6);
    o.connect(og).connect(ctx.destination);
    o.start(t);
    o.stop(t + p.decay * 0.6);
  },

  clap(ctx, t, p) {
    const bursts = p.bursts ?? 3;
    const gap = p.gap ?? 0.01;
    for (let b = 0; b < bursts; b++) {
      const bt = t + b * gap;
      const dur = p.decay + 0.01;
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur | 0, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const ns = ctx.createBufferSource();
      ns.buffer = buf;
      const fl = ctx.createBiquadFilter();
      fl.type = 'bandpass';
      fl.frequency.value = p.freq;
      fl.Q.value = 0.8;
      const g = ctx.createGain();
      g.gain.setValueAtTime(b === bursts - 1 ? p.vol : p.vol * 0.6, bt);
      g.gain.exponentialRampToValueAtTime(0.001, bt + p.decay);
      ns.connect(fl).connect(g).connect(ctx.destination);
      ns.start(bt);
      ns.stop(bt + dur);
    }
  },

  cow(ctx, t, p) {
    for (const freq of [p.f1, p.f2]) {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.setValueAtTime(freq, t);
      const fl = ctx.createBiquadFilter();
      fl.type = 'bandpass';
      fl.frequency.value = (p.f1 + p.f2) / 2;
      fl.Q.value = 2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(p.vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
      o.connect(fl).connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + p.decay);
    }
  },

  clave(ctx, t, p) {
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(p.freq, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + p.decay);
  },

  rim(ctx, t, p) {
    // Bright ping
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(p.freq, t);
    const og = ctx.createGain();
    og.gain.setValueAtTime(p.vol, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    o.connect(og).connect(ctx.destination);
    o.start(t);
    o.stop(t + p.decay);
    // Noise snap
    const dur = p.decay + 0.01;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur | 0, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource();
    ns.buffer = buf;
    const fl = ctx.createBiquadFilter();
    fl.type = 'highpass';
    fl.frequency.value = p.nFreq;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(p.vol * 0.5, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + p.decay * 0.8);
    ns.connect(fl).connect(ng).connect(ctx.destination);
    ns.start(t);
    ns.stop(t + dur);
  },

  shk(ctx, t, p) {
    const dur = p.decay + 0.01;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur | 0, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource();
    ns.buffer = buf;
    const fl = ctx.createBiquadFilter();
    fl.type = 'bandpass';
    fl.frequency.value = p.freq;
    fl.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    ns.connect(fl).connect(g).connect(ctx.destination);
    ns.start(t);
    ns.stop(t + dur);
  },

  conga(ctx, t, p) {
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(p.freq, t);
    o.frequency.exponentialRampToValueAtTime(p.end, t + p.decay * 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + p.decay);
    // Slap transient
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.02 | 0, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource();
    ns.buffer = buf;
    const fl = ctx.createBiquadFilter();
    fl.type = 'bandpass';
    fl.frequency.value = p.freq * 3;
    fl.Q.value = 1;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(p.vol * 0.3, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
    ns.connect(fl).connect(ng).connect(ctx.destination);
    ns.start(t);
    ns.stop(t + 0.02);
  },

  tamb(ctx, t, p) {
    const dur = p.decay + 0.01;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur | 0, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource();
    ns.buffer = buf;
    const fl = ctx.createBiquadFilter();
    fl.type = 'highpass';
    fl.frequency.value = p.freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    ns.connect(fl).connect(g).connect(ctx.destination);
    ns.start(t);
    ns.stop(t + dur);
    // Metallic ring
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(p.freq * 1.2, t);
    const og = ctx.createGain();
    og.gain.setValueAtTime(p.vol * 0.06, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + p.decay * 0.5);
    o.connect(og).connect(ctx.destination);
    o.start(t);
    o.stop(t + p.decay * 0.5);
  },
};

export default class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = true;
  }

  _ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(samplePath) {
    if (this.muted || !samplePath) return;
    this._ensureContext();
    const i = samplePath.indexOf('/');
    if (i < 0) return;
    const entry = SAMPLE_CATALOG[samplePath.slice(0, i)]?.[samplePath.slice(i + 1)];
    if (!entry) return;
    const fn = SYNTH[entry[0]];
    if (fn) fn(this.ctx, this.ctx.currentTime, entry[1]);
  }
}
