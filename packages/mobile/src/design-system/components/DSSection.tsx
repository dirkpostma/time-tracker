import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { DSText } from './DSText';
import { colors, spacing } from '../tokens';
import { useTheme } from '../themes/ThemeContext';
import { ThemeColors, ThemeSpacing } from '../themes';

export interface DSSectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function DSSection({
  title,
  children,
  style,
  testID,
}: DSSectionProps) {
  // Try to get theme context, fall back to default if not available
  let themeColors = colors as unknown as ThemeColors;
  let themeSpacing = spacing as unknown as ThemeSpacing;
  try {
    const { theme } = useTheme();
    themeColors = theme.colors;
    themeSpacing = theme.spacing;
  } catch {
    // useTheme will throw if not in a ThemeProvider - use default colors
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.background,
          marginTop: themeSpacing.xxl,
          paddingHorizontal: themeSpacing.lg,
          paddingVertical: themeSpacing.md,
        },
        style,
      ]}
      testID={testID}
    >
      {title && (
        <DSText variant="label" style={{ marginBottom: themeSpacing.md }}>
          {title}
        </DSText>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});
