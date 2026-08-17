import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ChordDiagram } from '@/components/ChordDiagram';
import type { ChordShape } from '@/types/chord';
import { spacing } from '@/constants/theme';

type ChordMarqueeProps = {
  shapes: readonly ChordShape[];
  /** Scroll speed in pixels per second */
  speed?: number;
};

export function ChordMarquee({ shapes, speed = 26 }: ChordMarqueeProps) {
  const [setWidth, setSetWidth] = useState(0);
  const translateX = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (setWidth === 0 || reduceMotion) return;

    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-setWidth, {
        duration: (setWidth / speed) * 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => cancelAnimation(translateX);
  }, [setWidth, speed, reduceMotion, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.viewport} pointerEvents="none">
      <Animated.View style={[styles.row, animatedStyle]}>
        <View
          style={styles.set}
          onLayout={(event) => setSetWidth(event.nativeEvent.layout.width)}
        >
          {shapes.map((shape) => (
            <ChordDiagram key={`a-${shape.name}`} shape={shape} />
          ))}
        </View>

        <View style={styles.set}>
          {shapes.map((shape) => (
            <ChordDiagram key={`b-${shape.name}`} shape={shape} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    overflow: 'hidden',
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    paddingLeft: spacing.lg,
  },
  set: {
    flexDirection: 'row',
  },
});