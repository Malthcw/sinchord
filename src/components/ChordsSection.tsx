import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChordDiagram } from '@/components/ChordDiagram';
import { colors, fonts, spacing } from '@/constants/theme';
import { getTransposedShape } from '@/utils/chordShapeTranspose';

type ChordsSectionProps = {
  chordNames: string[];
  steps: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

function transposeLabel(steps: number) {
  if (steps === 0) return 'Original key';
  return steps > 0 ? `Capo up ${steps}` : `Down ${Math.abs(steps)}`;
}

export function ChordsSection({ chordNames, steps, onIncrement, onDecrement }: ChordsSectionProps) {
  const shapes = chordNames
    .map((name) => getTransposedShape(name, steps))
    .filter((shape) => shape !== undefined);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Chords</Text>
          <Text style={styles.subtitle}>{transposeLabel(steps)}</Text>
        </View>

        <View style={styles.stepper}>
          <Pressable onPress={onDecrement} hitSlop={8} style={styles.stepperButton}>
            <Ionicons name="remove" size={16} color={colors.text} />
          </Pressable>
          <Text style={styles.stepperValue}>{steps}</Text>
          <Pressable onPress={onIncrement} hitSlop={8} style={styles.stepperButton}>
            <Ionicons name="add" size={16} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.diagramRow}
      >
        {shapes.map((shape, index) => (
          <ChordDiagram key={index} shape={shape} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  stepper: {
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
  stepperValue: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    minWidth: 16,
    textAlign: 'center',
  },
  diagramRow: {
    paddingHorizontal: spacing.lg,
  },
});
