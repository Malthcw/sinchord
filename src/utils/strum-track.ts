import { File, Paths } from 'expo-file-system';
import { renderStrumTrack, type StrumTrackOptions, type StrumTrackTiming } from '@/utils/strum-synth';

export type StrumTrack = StrumTrackTiming & { uri: string };

let previousFile: File | null = null;

/**
 * Renders the strumming track for these settings into the cache folder and
 * returns its file URI plus the timings needed to follow it on screen.
 */
export async function buildStrumTrack(options: StrumTrackOptions): Promise<StrumTrack> {
  const { pattern, bpm, beatsPerBar, countIn } = options;
  const { wav, timing } = renderStrumTrack(options);

  const name = `strum-${pattern.map((s) => (s === '-' ? 'x' : s)).join('')}-${bpm}-${beatsPerBar}-${countIn ? 'c' : 'n'}.wav`;
  const file = new File(Paths.cache, name);

  if (previousFile && previousFile.uri !== file.uri) {
    try {
      if (previousFile.exists) previousFile.delete();
    } catch {
      // A stale cache file is harmless; the system clears the cache folder.
    }
  }

  file.create({ overwrite: true });
  await file.write(wav);
  previousFile = file;

  return { uri: file.uri, ...timing };
}
