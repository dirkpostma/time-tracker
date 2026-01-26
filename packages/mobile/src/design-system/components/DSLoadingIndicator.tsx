import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

export interface DSLoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function DSLoadingIndicator({
  size = 'large',
  color,
  fullScreen = false,
  style,
  testID,
}: DSLoadingIndicatorProps) {
  const { theme } = useTheme();
  const indicatorColor = color ?? theme.colors.primary;

  if (fullScreen) {
    return (
      <View
        style={[styles.fullScreen, { backgroundColor: theme.colors.background }, style]}
        testID={testID}
      >
        <ActivityIndicator size={size} color={indicatorColor} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={indicatorColor} testID={testID} />;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
