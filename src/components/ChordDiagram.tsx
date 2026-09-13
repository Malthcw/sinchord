import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { ChordShape } from '@/types/chord';
import { colors, fonts } from '@/constants/theme';

const STRING_COUNT = 6;
const FRET_COUNT = 5;
const STRING_GAP = 11;
const FRET_GAP = 12;
const PAD_X = 10;
const PAD_TOP = 16;
const GRID_W = STRING_GAP * (STRING_COUNT - 1);
const GRID_H = FRET_GAP * FRET_COUNT;
const SVG_W = GRID_W + PAD_X * 2;
const SVG_H = PAD_TOP + GRID_H + 6;
const DOT_R = 3.6;
const MARKER_Y = PAD_TOP - 7;

const stringX = (index: number) => PAD_X + index * STRING_GAP;
const fretY = (fret: number, baseFret: number) =>
  PAD_TOP + (fret - baseFret + 0.5) * FRET_GAP;

type ChordDiagramProps = {
  shape: ChordShape;
};

export function ChordDiagram({ shape }: ChordDiagramProps) {
  const { name, frets, barre, baseFret } = shape;
  const showNut = baseFret === 1;

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>

      <Svg width={SVG_W} height={SVG_H}>
        {baseFret > 1 && (
          <SvgText
            x={PAD_X - 3}
            y={PAD_TOP + FRET_GAP * 0.5 + 3}
            fontSize={7}
            fill={colors.textMuted}
            textAnchor="end"
          >
            {baseFret}
          </SvgText>
        )}

        {Array.from({ length: FRET_COUNT + 1 }, (_, i) => {
          const isNut = i === 0 && showNut;
          return (
            <Line
              key={`fret-${i}`}
              x1={PAD_X}
              y1={PAD_TOP + i * FRET_GAP}
              x2={PAD_X + GRID_W}
              y2={PAD_TOP + i * FRET_GAP}
              stroke={isNut ? colors.textMuted : colors.border}
              strokeWidth={isNut ? 2.5 : 1}
            />
          );
        })}

        {Array.from({ length: STRING_COUNT }, (_, i) => (
          <Line
            key={`string-${i}`}
            x1={stringX(i)}
            y1={PAD_TOP}
            x2={stringX(i)}
            y2={PAD_TOP + GRID_H}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}

        {frets.map((fret, i) => {
          if (fret === null) {
            const s = 3;
            return (
              <Path
                key={`mark-${i}`}
                d={`M${stringX(i) - s} ${MARKER_Y - s} L${stringX(i) + s} ${MARKER_Y + s} M${stringX(i) + s} ${MARKER_Y - s} L${stringX(i) - s} ${MARKER_Y + s}`}
                stroke={colors.textMuted}
                strokeWidth={1.3}
                strokeLinecap="round"
              />
            );
          }
          if (fret === 0) {
            return (
              <Circle
                key={`mark-${i}`}
                cx={stringX(i)}
                cy={MARKER_Y}
                r={3}
                stroke={colors.textMuted}
                strokeWidth={1.3}
                fill="none"
              />
            );
          }
          return null;
        })}

        {barre !== undefined && (
          <Rect
            x={stringX(barre.fromString) - DOT_R}
            y={fretY(barre.fret, baseFret) - DOT_R}
            width={stringX(barre.toString) - stringX(barre.fromString) + DOT_R * 2}
            height={DOT_R * 2}
            rx={DOT_R}
            fill={colors.accent}
          />
        )}

        {frets.map((fret, i) => {
          if (fret === null || fret === 0) return null;
          const coveredByBarre =
            barre !== undefined &&
            fret === barre.fret &&
            i >= barre.fromString &&
            i <= barre.toString;
          if (coveredByBarre) return null;

          return (
            <Circle
              key={`dot-${i}`}
              cx={stringX(i)}
              cy={fretY(fret, baseFret)}
              r={DOT_R}
              fill={colors.accent}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 86,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 10,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
});