import { Platform } from 'react-native';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

export type BeatSound = 'strum-down' | 'strum-up' | 'click';

// ---------- Web: real-time synthesis via the Web Audio API ----------

type Ctor = typeof AudioContext;

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx: Ctor | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
  if (!Ctx) return null;
  if (!ctx) ctx = new Ctx();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function getNoiseBuffer(audio: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === audio.sampleRate) return noiseBuffer;
  const length = Math.floor(audio.sampleRate * 0.4);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  noiseBuffer = buffer;
  return buffer;
}

type StrumOptions = {
  up?: boolean;
  accent?: boolean;
};

/**
 * A short filtered-noise burst that reads as a strum across the strings.
 * Down strokes sit lower and fuller, up strokes brighter and shorter.
 *
 * `time` is an AudioContext time (seconds), not "now" — callers can schedule
 * this ahead of the current instant for sample-accurate playback.
 */
export function playStrum(audio: AudioContext, time: number, { up = false, accent = false }: StrumOptions = {}) {
  const source = audio.createBufferSource();
  source.buffer = getNoiseBuffer(audio);

  const band = audio.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = up ? 2600 : 1500;
  band.Q.value = 0.9;

  const shelf = audio.createBiquadFilter();
  shelf.type = 'highpass';
  shelf.frequency.value = up ? 900 : 420;

  const gain = audio.createGain();
  const peak = accent ? 0.5 : 0.28;
  const decay = up ? 0.07 : 0.11;

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);

  source.connect(band);
  band.connect(shelf);
  shelf.connect(gain);
  gain.connect(audio.destination);

  source.start(time);
  source.stop(time + decay + 0.05);
}

/**
 * A dry click used for the count-in and (on the fallback path) for silent
 * eighths. `time` is an AudioContext time (seconds), same as `playStrum`.
 */
export function playClick(audio: AudioContext, time: number, accent = false) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = 'square';
  osc.frequency.value = accent ? 1400 : 900;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(accent ? 0.22 : 0.12, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(time);
  osc.stop(time + 0.06);
}

// ---------- Native: pre-rendered clips via expo-audio ----------
// Web Audio isn't available in React Native, so native playback uses short
// synthesized WAV assets (see assets/sounds/) instead of real-time synthesis.

let downPlayer: AudioPlayer | null = null;
let upPlayer: AudioPlayer | null = null;
let clickPlayer: AudioPlayer | null = null;

function getNativePlayer(sound: BeatSound): AudioPlayer {
  if (sound === 'strum-down') {
    downPlayer ??= createAudioPlayer(require('@/assets/sounds/strum-down.wav'));
    return downPlayer;
  }
  if (sound === 'strum-up') {
    upPlayer ??= createAudioPlayer(require('@/assets/sounds/strum-up.wav'));
    return upPlayer;
  }
  clickPlayer ??= createAudioPlayer(require('@/assets/sounds/click.wav'));
  return clickPlayer;
}

async function playNative(sound: BeatSound) {
  const player = getNativePlayer(sound);
  try {
    await player.seekTo(0);
    player.play();
  } catch {
    // Ignore playback errors (e.g. player not ready yet).
  }
}

// ---------- Public, cross-platform API ----------

export function playBeatSound(sound: BeatSound, options: { accent?: boolean } = {}) {
  if (Platform.OS === 'web') {
    const audio = getAudioContext();
    if (!audio) return;
    const time = audio.currentTime;
    if (sound === 'strum-down') playStrum(audio, time, { up: false, accent: options.accent ?? false });
    else if (sound === 'strum-up') playStrum(audio, time, { up: true });
    else playClick(audio, time, options.accent ?? false);
    return;
  }

  void playNative(sound);
}
