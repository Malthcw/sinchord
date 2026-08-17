import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';

type ScreenProps = ViewProps & {
  children: React.ReactNode;
};

export function Screen({ children, style, ...rest }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={[styles.content, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});