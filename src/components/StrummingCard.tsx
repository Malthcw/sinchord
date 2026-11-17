import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { colors, fonts, spacing } from '@/constants/theme';
import { getAudioContext, playClick, playStrum } from '@/utils/audio';
import { buildStrumTrack, type StrumTrack } from '@/utils/strum-track';

const IS_WEB = Platform.OS === 'web';
/** Native: wait this long after the last tempo tap before re-rendering the track. */
const TEMPO_DEBOUNCE_MS = 300;

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

  // Native: there is no audio clock to schedule single strokes against, so the
  // whole rhythm is rendered into one clip. The native player keeps time and
  // the highlight simply follows the player's position.
  const playerRef = useRef<AudioPlayer | null>(null);
  const trackRef = useRef<StrumTrack | null>(null);
  const trackBpmRef = useRef(0);
  const sessionRef = useRef(0);
  const tempoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const beatsPerBar = parseInt(timeSignature, 10) || 4;

  const releasePlayer = useCallback(() => {
    const player = playerRef.current;
    playerRef.current = null;
    trackRef.current = null;
    if (!player) return;
    try {
      player.pause();
      player.remove();
    } catch {
      // Already released.
    }
  }, []);

  const stop = useCallback(() => {
    sessionRef.current += 1; // cancels any track still being rendered
    if (schedulerIdRef.current !== null) clearInterval(schedulerIdRef.current);
    if (frameIdRef.current !== null) cancelAnimationFrame(frameIdRef.current);
    if (tempoTimerRef.current !== null) clearTimeout(tempoTimerRef.current);
    schedulerIdRef.current = null;
    frameIdRef.current = null;
    tempoTimerRef.current = null;
    queueRef.current = [];
    releasePlayer();
    setIsPlaying(false);
    setActiveIndex(null);
    setCountIn(null);
  }, [releasePlayer]);

  /** Native: render the track at the current tempo and start playing it. */
  const playTrack = useCallback(
    async (withCountIn: boolean) => {
      const session = (sessionRef.current += 1);
      const bpmNow = bpmRef.current;
      trackBpmRef.current = bpmNow;

      let track: StrumTrack;
      try {
        track = await buildStrumTrack({ pattern, bpm: bpmNow, beatsPerBar, countIn: withCountIn });
      } catch {
        if (session === sessionRef.current) stop();
        return;
      }
      if (session !== sessionRef.current) return; // stopped or superseded meanwhile

      releasePlayer();
      const player = createAudioPlayer({ uri: track.uri }, { updateInterval: 100 });
      player.muted = isMutedRef.current;
      player.addListener('playbackStatusUpdate', (status) => {
        // The clip holds a fixed number of bars; at its end, jump back to the
        // first pattern bar so it keeps going.
        if (status.didJustFinish && playerRef.current === player) {
          void player
            .seekTo(track.countInSeconds)
            .then(() => player.play())
            .catch(() => {});
        }
      });
      playerRef.current = player;
      trackRef.current = track;
      player.play();
    },
    [pattern, beatsPerBar, releasePlayer, stop],
  );

  const start = useCallback(() => {
    setIsPlaying(true);
    setCountIn(beatsPerBar);

    if (!IS_WEB) {
      void playTrack(true);

      const follow = () => {
        const player = playerRef.current;
        const track = trackRef.current;
        if (player && track) {
          let seconds = 0;
          try {
            seconds = player.currentTime;
          } catch {
            // Player was released between frames.
          }
          if (seconds < track.countInSeconds) {
            setCountIn(beatsPerBar - Math.floor(seconds / track.beatSeconds + 1e-6));
            setActiveIndex(null);
          } else {
            const step = Math.floor((seconds - track.countInSeconds) / track.stepSeconds + 1e-6);
            setCountIn(null);
            setActiveIndex(step % pattern.length);
          }
        }
        frameIdRef.current = requestAnimationFrame(follow);
      };
      frameIdRef.current = requestAnimationFrame(follow);
      return;
    }

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

    // Web without Web Audio support: nothing can play.
    stop();
  }, [pattern, beatsPerBar, playTrack, stop]);

  // Native: mute applies to the playing clip straight away.
  useEffect(() => {
    if (playerRef.current) playerRef.current.muted = isMuted;
  }, [isMuted]);

  // Native: a tempo change needs a new clip. Re-render once the taps settle
  // and carry on from the top of the pattern, without another count-in.
  useEffect(() => {
    if (IS_WEB || !isPlaying || trackBpmRef.current === 0 || trackBpmRef.current === bpm) return;
    tempoTimerRef.current = setTimeout(() => {
      tempoTimerRef.current = null;
      void playTrack(false);
    }, TEMPO_DEBOUNCE_MS);
    return () => {
      if (tempoTimerRef.current !== null) clearTimeout(tempoTimerRef.current);
      tempoTimerRef.current = null;
    };
  }, [bpm, isPlaying, playTrack]);

  useEffect(() => stop, [stop]);

  // Rests show as a gap here; the dash appears only in the arrow row below.
  const patternLabel = pattern.map((symbol) => (symbol === '-' ? ' ' : symbol)).join('').trimEnd();

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
    gap: 4,
  },
  beat: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  // Shrinks with the card so all eight steps fit on a narrow phone.
  beatButton: {
    width: '100%',
    maxWidth: 36,
    aspectRatio: 1,
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
