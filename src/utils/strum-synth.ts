// Pure-JS rendering of a whole strumming track (count-in + pattern bars) to a
// WAV byte buffer. Used on native, where there is no audio clock to schedule
// individual strokes against: baking the rhythm into one clip lets the native
// player keep time instead of JS timers.

export type Stroke = 'D' | 'U' | '-';

export const SAMPLE_RATE = 22050;
/** How many bars of the pattern one rendered track holds before it loops. */
export const PATTERN_BARS = 32;

export type StrumTrackTiming = {
  /** Length of the count-in bar (0 when rendered without one). */
  countInSeconds: number;
  /** Length of one count-in beat (a quarter note). */
  beatSeconds: number;
  /** Length of one pattern step (an eighth, sixteenth, … depending on the pattern length). */
  stepSeconds: number;
  totalSeconds: number;
};

export type StrumTrackOptions = {
  pattern: Stroke[];
  bpm: number;
  beatsPerBar: number;
  countIn: boolean;
  /** Steps per beat; guessed from the pattern length when missing. */
  stepsPerBeat?: number;
};

// Deterministic noise so every render sounds identical.
function createNoise(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x80000000 - 1;
  };
}

function normalize(clip: Float32Array, peak: number): Float32Array {
  let max = 0;
  for (let i = 0; i < clip.length; i += 1) max = Math.max(max, Math.abs(clip[i]));
  if (max > 0) {
    const scale = peak / max;
    for (let i = 0; i < clip.length; i += 1) clip[i] *= scale;
  }
  return clip;
}

/** Filtered noise burst: down strokes lower and longer, up strokes brighter and shorter. */
function renderStrum(up: boolean, peak: number): Float32Array {
  const attack = 0.005;
  const decay = up ? 0.07 : 0.11;
  const tau = (decay - attack) / 6.9;
  const length = Math.floor((decay + 0.03) * SAMPLE_RATE);
  const clip = new Float32Array(length);
  const noise = createNoise(up ? 7 : 3);

  const lowCoef = 1 - Math.exp((-2 * Math.PI * (up ? 4500 : 2600)) / SAMPLE_RATE);
  const highCoef = 1 - Math.exp((-2 * Math.PI * (up ? 900 : 420)) / SAMPLE_RATE);
  let low = 0;
  let rumble = 0;

  for (let i = 0; i < length; i += 1) {
    const t = i / SAMPLE_RATE;
    const envelope = t < attack ? t / attack : Math.exp(-(t - attack) / tau);
    low += lowCoef * (noise() - low);
    rumble += highCoef * (low - rumble);
    clip[i] = (low - rumble) * envelope;
  }
  return normalize(clip, peak);
}

/** Dry square-wave blip for the count-in. */
function renderClick(accent: boolean): Float32Array {
  const attack = 0.002;
  const tau = (0.045 - attack) / 6.9;
  const frequency = accent ? 1400 : 900;
  const length = Math.floor(0.06 * SAMPLE_RATE);
  const clip = new Float32Array(length);

  for (let i = 0; i < length; i += 1) {
    const t = i / SAMPLE_RATE;
    const envelope = t < attack ? t / attack : Math.exp(-(t - attack) / tau);
    clip[i] = ((t * frequency) % 1 < 0.5 ? 1 : -1) * envelope;
  }
  return normalize(clip, accent ? 0.6 : 0.35);
}

type Clips = {
  click: Float32Array;
  clickAccent: Float32Array;
  down: Float32Array;
  downAccent: Float32Array;
  up: Float32Array;
};

let clips: Clips | null = null;

function getClips(): Clips {
  clips ??= {
    click: renderClick(false),
    clickAccent: renderClick(true),
    down: renderStrum(false, 0.55),
    downAccent: renderStrum(false, 0.9),
    up: renderStrum(true, 0.55),
  };
  return clips;
}

function writeAscii(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
}

/**
 * How many pattern steps fit in one beat, derived from the pattern length:
 * 8 steps in 4/4 → 2 (eighths), 16 → 4 (sixteenths), 12 → 3 (triplets).
 * Rests ('-') are ordinary steps, so a gap like "D UU" is just "D-UU".
 */
export function getStepsPerBeat(patternLength: number, beatsPerBar: number): number {
  const steps = patternLength / beatsPerBar;
  return Number.isInteger(steps) && steps > 0 ? steps : 2;
}

export function getStrumTrackTiming({ pattern, bpm, beatsPerBar, countIn, stepsPerBeat }: StrumTrackOptions): StrumTrackTiming {
  const beatSeconds = 60 / bpm;
  const stepSeconds = beatSeconds / (stepsPerBeat ?? getStepsPerBeat(pattern.length, beatsPerBar));
  const countInSeconds = countIn ? beatsPerBar * beatSeconds : 0;
  return {
    countInSeconds,
    beatSeconds,
    stepSeconds,
    totalSeconds: countInSeconds + pattern.length * PATTERN_BARS * stepSeconds,
  };
}

/** Renders the track as a 16-bit mono WAV file. */
export function renderStrumTrack(options: StrumTrackOptions): { wav: Uint8Array; timing: StrumTrackTiming } {
  const { pattern, beatsPerBar, countIn } = options;
  const timing = getStrumTrackTiming(options);
  const sounds = getClips();

  const sampleCount = Math.ceil(timing.totalSeconds * SAMPLE_RATE);
  const mix = new Float32Array(sampleCount);

  // Every event is placed from its absolute time, so rounding never accumulates.
  const place = (clip: Float32Array, seconds: number) => {
    const start = Math.round(seconds * SAMPLE_RATE);
    const end = Math.min(start + clip.length, sampleCount);
    for (let i = start; i < end; i += 1) mix[i] += clip[i - start];
  };

  if (countIn) {
    for (let beat = 0; beat < beatsPerBar; beat += 1) {
      place(beat === 0 ? sounds.clickAccent : sounds.click, beat * timing.beatSeconds);
    }
  }

  const steps = pattern.length * PATTERN_BARS;
  for (let step = 0; step < steps; step += 1) {
    const index = step % pattern.length;
    const symbol = pattern[index];
    if (symbol === '-') continue;
    const clip = symbol === 'U' ? sounds.up : index === 0 ? sounds.downAccent : sounds.down;
    place(clip, timing.countInSeconds + step * timing.stepSeconds);
  }

  const dataBytes = sampleCount * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataBytes, true);

  for (let i = 0; i < sampleCount; i += 1) {
    const sample = Math.max(-1, Math.min(1, mix[i]));
    view.setInt16(44 + i * 2, Math.round(sample * 32767), true);
  }

  return { wav: new Uint8Array(buffer), timing };
}
