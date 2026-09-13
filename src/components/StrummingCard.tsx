import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/constants/theme';
import { getAudioContext, playBeatSound, playClick, playStrum } from '@/utils/audio';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const BEAT_LABELS = ['1', '&', '2', '&', '3', '&', '4', '&'];
const MIN_TEMPO = 40;
const MAX_TEMPO = 220;
/** How far ahead (ms) the web scheduler runs; must stay well below SCHEDULE_AHEAD. */
const LOOKAHEAD_MS = 25;
/** How far ahead (seconds) the web scheduler books audio events. */
const SCHEDULE_AHEAD = 0.12;

type VisualEvent = { time: number; step: number | null; count: number | null };

type StrummingCardProps = {
  pattern: ('D' | 'U' | '-')[];
  timeSignature: string;
  tempo: number;
  note?: string;
};

function strumIcon(symbol: 'D' | 'U' | '-'): IoniconName {
  if (symbol === 'D') return 'arrow-down';
  if (symbol === 'U') return 'arrow-up';
  return 'remove';
}

export function StrummingCard({ pattern, timeSignature, tempo, note }: StrummingCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [bpm, setBpm] = useState(tempo);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [countIn, setCountIn] = useState<number | null>(null);

  const bpmRef = useRef(bpm);
  const isMutedRef = useRef(isMuted);
  bpmRef.current = bpm;
  isMutedRef.current = isMuted;

  // Web: precise lookahead scheduler (audio-clock time), fed by a separate
  // rAF loop that only updates the visual highlight once the audio clock
  // actually reaches that time — see the "two clocks" pattern this mirrors.
  const nextTimeRef = useRef(0);
  const stepIndexRef = useRef(0);
  const countRef = useRef(0);
  const queueRef = useRef<VisualEvent[]>([]);
  const schedulerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Native fallback: no audio-clock scheduling API available, so this uses a
  // self-correcting setTimeout chain instead (still avoids compounding drift).
  const fallbackIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (schedulerIdRef.current !== null) clearInterval(schedulerIdRef.current);
    if (frameIdRef.current !== null) cancelAnimationFrame(frameIdRef.current);
    if (fallbackIdRef.current !== null) clearTimeout(fallbackIdRef.current);
    schedulerIdRef.current = null;
    frameIdRef.current = null;
    fallbackIdRef.current = null;
    queueRef.current = [];
    setIsPlaying(false);
    setActiveIndex(null);
    setCountIn(null);
  }, []);

  const start = useCallback(() => {
    const beatsPerBar = parseInt(timeSignature, 10) || 4;
    setIsPlaying(true);
    setCountIn(beatsPerBar);

    const audio = getAudioContext();

    if (audio) {
      stepIndexRef.current = 0;
      countRef.current = 0;
      queueRef.current = [];
      nextTimeRef.current = audio.currentTime + 0.15;

      schedulerIdRef.current = setInterval(() => {
        while (nextTimeRef.current < audio.currentTime + SCHEDULE_AHEAD) {
          const time = nextTimeRef.current;
          const quarter = 60 / bpmRef.current;

          if (countRef.current < beatsPerBar) {
            if (!isMutedRef.current) playClick(audio, time, countRef.current === 0);
            queueRef.current.push({ time, step: null, count: beatsPerBar - countRef.current });
            countRef.current += 1;
            nextTimeRef.current = time + quarter;
          } else {
            const index = stepIndexRef.current;
            const symbol = pattern[index];
            if (symbol !== '-' && !isMutedRef.current) {
              playStrum(audio, time, { up: symbol === 'U', accent: index === 0 });
            }
            queueRef.current.push({ time, step: index, count: null });
            stepIndexRef.current = (index + 1) % pattern.length;
            nextTimeRef.current = time + quarter / 2;
          }
        }
      }, LOOKAHEAD_MS);

      const tick = () => {
        const now = audio.currentTime;
        while (queueRef.current.length && queueRef.current[0].time <= now) {
          const event = queueRef.current.shift()!;
          setActiveIndex(event.step);
          setCountIn(event.count);
        }
        frameIdRef.current = requestAnimationFrame(tick);
      };
      frameIdRef.current = requestAnimationFrame(tick);
      return;
    }

    // Self-correcting scheduler: each step's delay is computed against a fixed
    // absolute clock (Date.now()), not "N ms after the last tick fired" like
    // setInterval — so a single late tick (e.g. a slow native seekTo/play
    // round-trip) doesn't compound into every tick after it.
    function scheduleAt(targetTime: number, run: () => void) {
      const delay = Math.max(0, targetTime - Date.now());
      fallbackIdRef.current = setTimeout(run, delay);
    }

    function playBeat(index: number) {
      if (isMutedRef.current) return;
      const symbol = pattern[index];
      if (symbol === 'D') playBeatSound('strum-down', { accent: index === 0 });
      else if (symbol === 'U') playBeatSound('strum-up');
      // '-' is a rest: no sound.
    }

    function runPatternStep(index: number, targetTime: number) {
      playBeat(index);
      setActiveIndex(index);
      const next = (index + 1) % pattern.length;
      const eighthNoteMs = 60000 / bpmRef.current / 2;
      scheduleAt(targetTime + eighthNoteMs, () => runPatternStep(next, targetTime + eighthNoteMs));
    }

    function runCountInStep(remaining: number, targetTime: number) {
      if (!isMutedRef.current) playBeatSound('click', { accent: remaining === beatsPerBar });
      setCountIn(remaining);
      const quarterNoteMs = 60000 / bpmRef.current;

      if (remaining <= 1) {
        scheduleAt(targetTime + quarterNoteMs, () => {
          setCountIn(null);
          runPatternStep(0, targetTime + quarterNoteMs);
        });
        return;
      }

      scheduleAt(targetTime + quarterNoteMs, () => runCountInStep(remaining - 1, targetTime + quarterNoteMs));
    }

    runCountInStep(beatsPerBar, Date.now());
  }, [pattern, timeSignature]);

  useEffect(() => stop, [stop]);

  const patternLabel = pattern.map((symbol) => (symbol === '-' ? '—' : symbol)).join(' ');

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.label}>STRUMMING</Text>
          <Text style={styles.pattern}>{patternLabel}</Text>
          <Text style={styles.subtitle}>{timeSignature} · {bpm} BPM</Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={() => setIsMuted((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={isMuted ? 'Unmute' : 'Mute'}
            style={styles.iconButton}
          >
            <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={18} color={colors.text} />
          </Pressable>
          <View style={styles.playButtonWrapper}>
            <Pressable
              onPress={() => (isPlaying ? stop() : start())}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
              style={[styles.iconButton, styles.playButton]}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color={colors.background} />
            </Pressable>
            {countIn !== null && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{countIn}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.beatRow}>
        {pattern.map((symbol, index) => {
          const isActive = isPlaying && index === activeIndex;
          return (
            <View key={`${symbol}-${index}`} style={styles.beat}>
              <View style={[styles.beatButton, isActive && styles.beatButtonActive]}>
                <Ionicons name={strumIcon(symbol)} size={16} color={isActive ? colors.background : colors.text} />
              </View>
              <Text style={[styles.beatLabel, isActive && styles.beatLabelActive]}>
                {BEAT_LABELS[index] ?? ''}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.tempoRow}>
        <View style={styles.tempoStepper}>
          <Pressable
            onPress={() => setBpm((value) => Math.max(value - 1, MIN_TEMPO))}
            hitSlop={8}
            style={styles.stepperButton}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </Pressable>
          <Text style={styles.tempoValue}>{bpm} bpm</Text>
          <Pressable
            onPress={() => setBpm((value) => Math.min(value + 1, MAX_TEMPO))}
            hitSlop={8}
            style={styles.stepperButton}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </Pressable>
        </View>
        <Text style={styles.tempoCaption}>Song tempo</Text>
      </View>

      {note && <Text style={styles.note}>{note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    gap: 4,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  pattern: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 2,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  playButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  playButtonWrapper: {
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  countBadgeText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: colors.background,
  },
  beatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  beat: {
    alignItems: 'center',
    gap: 6,
  },
  beatButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  beatButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  beatLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  beatLabelActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  tempoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tempoStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  stepperButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempoValue: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  tempoCaption: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
});
