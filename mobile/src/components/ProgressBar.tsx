import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import theme from '../theme';

interface ProgressBarProps {
  progress: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  style,
}) => {
  const width = `${Math.min(Math.max(progress * 100, 0), 100)}%`;

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(width, {
      duration: theme.animations.timing.normal,
    }),
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.progress, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: theme.components.progressBar.height,
    backgroundColor: theme.components.progressBar.backgroundColor,
    borderRadius: theme.components.progressBar.borderRadius,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: theme.components.progressBar.fillColor,
    borderRadius: theme.components.progressBar.borderRadius,
  },
});

export default ProgressBar;
