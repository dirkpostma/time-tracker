import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing, componentTokens } from '../tokens';
import { useTheme } from '../themes/ThemeContext';

export interface DSCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  testID?: string;
}

export function DSCard({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
  testID,
}: DSCardProps) {
  const { theme } = useTheme();
  const { colors, shadows, borderRadius } = theme;

  const variantStyles: ViewStyle = variant === 'elevated'
    ? shadows.md
    : variant === 'outlined'
    ? { borderWidth: 1, borderColor: colors.border }
    : { backgroundColor: colors.backgroundTertiary };

  const baseBackgroundColor = variant === 'flat'
    ? colors.backgroundTertiary
    : colors.backgroundCard;

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: baseBackgroundColor, borderRadius: borderRadius.md },
        variantStyles,
        styles[`padding_${padding}`],
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {},

  // Padding
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: spacing.sm,
  },
  padding_md: {
    padding: componentTokens.card.padding,
  },
  padding_lg: {
    padding: spacing.xxl,
  },
});
