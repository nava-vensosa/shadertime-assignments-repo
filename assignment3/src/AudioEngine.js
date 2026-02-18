// WAV file mappings: machine → { display name → filename }
const SAMPLE_FILES = {
  'TR-505': {
    'Kick': 'kick.wav', 'Snare': 'snare.wav', 'Clap': 'clap.wav',
    'Closed HH': 'closed-hh.wav', 'Open HH': 'open-hh.wav',
    'Crash': 'crash.wav', 'Ride': 'ride.wav', 'Rimshot': 'rimshot.wav',
    'Cowbell Hi': 'cowbell-hi.wav', 'Cowbell Lo': 'cowbell-lo.wav',
    'Hi Conga': 'hi-conga.wav', 'Lo Conga': 'lo-conga.wav',
    'Hi Tom': 'hi-tom.wav', 'Mid Tom': 'mid-tom.wav', 'Lo Tom': 'lo-tom.wav',
    'Timbale': 'timbale.wav',
  },
  'TR-808': {
    'Kick': 'kick.wav', 'Snare': 'snare.wav', 'Clap': 'clap.wav',
    'Closed HH': 'closed-hh.wav', 'Open HH': 'open-hh.wav',
    'Cymbal': 'cymbal.wav', 'Rimshot': 'rimshot.wav', 'Cowbell': 'cowbell.wav',
    'Clave': 'clave.wav', 'Maracas': 'maracas.wav',
    'Hi Tom': 'hi-tom.wav', 'Mid Tom': 'mid-tom.wav', 'Lo Tom': 'lo-tom.wav',
    'Hi Conga': 'hi-conga.wav', 'Mid Conga': 'mid-conga.wav', 'Lo Conga': 'lo-conga.wav',
  },
  'TR-909': {
    'Kick': 'kick.wav', 'Snare': 'snare.wav', 'Clap': 'clap.wav',
    'Closed HH': 'closed-hh.wav', 'Open HH': 'open-hh.wav',
    'Crash': 'crash.wav', 'Ride': 'ride.wav', 'Rimshot': 'rimshot.wav',
    'Hi Tom': 'hi-tom.wav', 'Mid Tom': 'mid-tom.wav', 'Lo Tom': 'lo-tom.wav',
  },
  'HR-16': {
    'Kick': 'kick.wav', 'Snare': 'snare.wav', 'Clap': 'clap.wav',
    'Closed HH': 'closed-hh.wav', 'Open HH': 'open-hh.wav',
    'Crash': 'crash.wav', 'Ride': 'ride.wav', 'Sidestick': 'sidestick.wav',
    'Hi Tom': 'hi-tom.wav', 'Mid Tom': 'mid-tom.wav', 'Lo Tom': 'lo-tom.wav',
    'Cowbell': 'cowbell.wav', 'Tambourine': 'tambourine.wav', 'Cabasa': 'cabasa.wav',
    'Hi Conga': 'hi-conga.wav', 'Lo Conga': 'lo-conga.wav',
  },
  'LinnDrum': {
    'Kick': 'kick.wav', 'Snare': 'snare.wav', 'Clap': 'clap.wav',
    'Closed HH': 'closed-hh.wav', 'Open HH': 'open-hh.wav',
    'Crash': 'crash.wav', 'Ride': 'ride.wav', 'Sidestick': 'sidestick.wav',
    'Cowbell': 'cowbell.wav', 'Tambourine': 'tambourine.wav', 'Cabasa': 'cabasa.wav',
    'Hi Tom': 'hi-tom.wav', 'Mid Tom': 'mid-tom.wav', 'Lo Tom': 'lo-tom.wav',
    'Hi Conga': 'hi-conga.wav', 'Mid Conga': 'mid-conga.wav', 'Lo Conga': 'lo-conga.wav',
  },
};

// Synthesis params for machines without WAV samples
const SYNTH_PARAMS = {
  'TR-606': {
    'Kick':       ['kick',   { freq: 155, end: 42, sweep: 0.055, decay: 0.22, vol: 0.85 }],
    'Snare':      ['snare',  { body: 185, bDecay: 0.08, nFreq: 3500, nQ: 0.6, nDecay: 0.12, vol: 0.6 }],
    'Lo Tom':     ['tom',    { freq: 90, end: 50, decay: 0.22, vol: 0.7 }],
    'Hi Tom':     ['tom',    { freq: 170, end: 100, decay: 0.16, vol: 0.7 }],
    'Closed HH':  ['hat',   { freq: 8000, decay: 0.04, vol: 0.25 }],
    'Open HH':   ['hat',    { freq: 7000, decay: 0.25, vol: 0.22 }],
    'Cymbal':     ['cym',    { freq: 6000, decay: 1.0, vol: 0.18 }],
  },
  'TR-707': {
    'Kick':       ['kick',   { freq: 150, end: 38, sweep: 0.065, decay: 0.32, vol: 0.95 }],
    'Snare':      ['snare',  { body: 195, bDecay: 0.1, nFreq: 3200, nQ: 0.7, nDecay: 0.16, vol: 0.7 }],
    'Lo Tom':     ['tom',    { freq: 95, end: 55, decay: 0.22, vol: 0.75 }],
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
  'DMX': {
    'Kick':       ['kick',   { freq: 135, end: 30, sweep: 0.07, decay: 0.28, vol: 0.9 }],
    'Snare':      ['snare',  { body: 168, bDecay: 0.1, nFreq: 2800, nQ: 0.6, nDecay: 0.18, vol: 0.65 }],
    'Lo Tom':     ['tom',    { freq: 75, end: 38, decay: 0.25, vol: 0.7 }],
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

// Synthesis functions for real-time fallback
const SYNTH = {
  kick(ctx, t, p) {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(p.freq, t);
    osc.frequency.exponentialRampToValueAtTime(p.end, t + p.sweep);
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    osc.connect(g).connect(ctx.destination);
    osc.start(t); osc.stop(t + p.decay);
    const c = ctx.createOscillator();
    c.frequency.setValueAtTime(p.freq * 2, t);
    c.frequency.exponentialRampToValueAtTime(p.end * 1.5, t + 0.02);
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(p.vol * 0.5, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    c.connect(cg).connect(ctx.destination);
    c.start(t); c.stop(t + 0.04);
  },
  snare(ctx, t, p) {
    const dur = p.nDecay + 0.02;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur | 0, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = p.nFreq; fl.Q.value = p.nQ;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(p.vol, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + p.nDecay);
    ns.connect(fl).connect(ng).connect(ctx.destination);
    ns.start(t); ns.stop(t + dur);
    const osc = ctx.createOscillator(); osc.type = 'triangle';
    osc.frequency.setValueAtTime(p.body, t);
    osc.frequency.exponentialRampToValueAtTime(p.body * 0.6, t + 0.05);
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(p.vol * 0.7, t);
    bg.gain.exponentialRampToValueAtTime(0.001, t + p.bDecay);
    osc.connect(bg).connect(ctx.destination);
    osc.start(t); osc.stop(t + p.bDecay);
  },
  hat(ctx, t, p) {
    const dur = p.decay + 0.01;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur | 0, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const fl = ctx.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = p.freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    ns.connect(fl).connect(g).connect(ctx.destination);
    ns.start(t); ns.stop(t + dur);
  },
  tom(ctx, t, p) {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(p.freq, t);
    osc.frequency.exponentialRampToValueAtTime(p.end, t + p.decay * 0.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    osc.connect(g).connect(ctx.destination);
    osc.start(t); osc.stop(t + p.decay);
  },
  cym(ctx, t, p) {
    const dur = p.decay + 0.02;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur | 0, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const fl = ctx.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = p.freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    ns.connect(fl).connect(g).connect(ctx.destination);
    ns.start(t); ns.stop(t + dur);
    const o = ctx.createOscillator(); o.type = 'square';
    o.frequency.setValueAtTime(p.freq * 0.7, t);
    const og = ctx.createGain();
    og.gain.setValueAtTime(p.vol * 0.08, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + p.decay * 0.6);
    o.connect(og).connect(ctx.destination);
    o.start(t); o.stop(t + p.decay * 0.6);
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
      const ns = ctx.createBufferSource(); ns.buffer = buf;
      const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = p.freq; fl.Q.value = 0.8;
      const g = ctx.createGain();
      g.gain.setValueAtTime(b === bursts - 1 ? p.vol : p.vol * 0.6, bt);
      g.gain.exponentialRampToValueAtTime(0.001, bt + p.decay);
      ns.connect(fl).connect(g).connect(ctx.destination);
      ns.start(bt); ns.stop(bt + dur);
    }
  },
  cow(ctx, t, p) {
    for (const freq of [p.f1, p.f2]) {
      const o = ctx.createOscillator(); o.type = 'square';
      o.frequency.setValueAtTime(freq, t);
      const fl = ctx.createBiquadFilter(); fl.type = 'bandpass';
      fl.frequency.value = (p.f1 + p.f2) / 2; fl.Q.value = 2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(p.vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
      o.connect(fl).connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + p.decay);
    }
  },
  rim(ctx, t, p) {
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(p.freq, t);
    const og = ctx.createGain();
    og.gain.setValueAtTime(p.vol, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    o.connect(og).connect(ctx.destination);
    o.start(t); o.stop(t + p.decay);
    const dur = p.decay + 0.01;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur | 0, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const fl = ctx.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = p.nFreq;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(p.vol * 0.5, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + p.decay * 0.8);
    ns.connect(fl).connect(ng).connect(ctx.destination);
    ns.start(t); ns.stop(t + dur);
  },
  shk(ctx, t, p) {
    const dur = p.decay + 0.01;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur | 0, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = p.freq; fl.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    ns.connect(fl).connect(g).connect(ctx.destination);
    ns.start(t); ns.stop(t + dur);
  },
  tamb(ctx, t, p) {
    const dur = p.decay + 0.01;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur | 0, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const fl = ctx.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = p.freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(p.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.decay);
    ns.connect(fl).connect(g).connect(ctx.destination);
    ns.start(t); ns.stop(t + dur);
    const o = ctx.createOscillator(); o.type = 'square';
    o.frequency.setValueAtTime(p.freq * 1.2, t);
    const og2 = ctx.createGain();
    og2.gain.setValueAtTime(p.vol * 0.06, t);
    og2.gain.exponentialRampToValueAtTime(0.001, t + p.decay * 0.5);
    o.connect(og2).connect(ctx.destination);
    o.start(t); o.stop(t + p.decay * 0.5);
  },
};

// Build unified catalog for UI display (machine → { soundName → true })
export const SAMPLE_CATALOG = {};
for (const machine in SAMPLE_FILES) {
  SAMPLE_CATALOG[machine] = {};
  for (const name in SAMPLE_FILES[machine]) SAMPLE_CATALOG[machine][name] = true;
}
for (const machine in SYNTH_PARAMS) {
  SAMPLE_CATALOG[machine] = {};
  for (const name in SYNTH_PARAMS[machine]) SAMPLE_CATALOG[machine][name] = true;
}

export default class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = true;
    this.buffers = new Map();
    this._loaded = false;
    this._unlocked = false;
    this._initPromise = null;
    this._keepaliveOsc = null;
    this._keepaliveGain = null;
  }

  _ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.ctx.onstatechange = () => {
        if (this.ctx.state === 'suspended') this._unlocked = false;
      };
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    // iOS requires playing a silent buffer from a user gesture to truly unlock
    if (!this._unlocked) {
      this._unlocked = true;
      const buf = this.ctx.createBuffer(1, 1, 22050);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.ctx.destination);
      src.start(0);
    }
  }

  _startKeepalive() {
    if (this._keepaliveOsc) return;
    const osc = this.ctx.createOscillator();
    osc.frequency.value = 1;
    const g = this.ctx.createGain();
    g.gain.value = 0.001;
    osc.connect(g).connect(this.ctx.destination);
    osc.start();
    this._keepaliveOsc = osc;
    this._keepaliveGain = g;
  }

  _stopKeepalive() {
    if (this._keepaliveOsc) {
      this._keepaliveOsc.stop();
      this._keepaliveOsc.disconnect();
      this._keepaliveGain.disconnect();
      this._keepaliveOsc = null;
      this._keepaliveGain = null;
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (!muted) {
      this.init();
      this._startKeepalive();
    } else {
      this._stopKeepalive();
    }
  }

  async init() {
    // Always try to unlock — each user gesture is a new opportunity
    this._ensureContext();
    if (this._initPromise) return this._initPromise;
    this._initPromise = this._doInit();
    return this._initPromise;
  }

  async _doInit() {

    const promises = [];
    for (const machine in SAMPLE_FILES) {
      for (const name in SAMPLE_FILES[machine]) {
        const file = SAMPLE_FILES[machine][name];
        const key = `${machine}/${name}`;
        const url = `samples/${machine}/${file}`;
        promises.push(
          fetch(url)
            .then(r => r.arrayBuffer())
            .then(buf => this.ctx.decodeAudioData(buf))
            .then(decoded => this.buffers.set(key, decoded))
            .catch(err => console.warn(`Failed to load ${key}:`, err))
        );
      }
    }
    await Promise.all(promises);
    this._loaded = true;
    console.log(`AudioEngine: loaded ${this.buffers.size} samples`);
  }

  play(samplePath) {
    if (this.muted || !samplePath || !this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Try cached WAV buffer first
    if (this.buffers.has(samplePath)) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.buffers.get(samplePath);
      src.connect(this.ctx.destination);
      src.start();
      return;
    }

    // Fall back to real-time synthesis
    const i = samplePath.indexOf('/');
    if (i < 0) return;
    const machine = samplePath.slice(0, i);
    const sound = samplePath.slice(i + 1);
    const entry = SYNTH_PARAMS[machine]?.[sound];
    if (!entry) return;
    const fn = SYNTH[entry[0]];
    if (fn) fn(this.ctx, this.ctx.currentTime, entry[1]);
  }
}
