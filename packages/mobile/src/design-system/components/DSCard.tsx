import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows, componentTokens } from '../tokens';

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
  return (
    <View
      style={[
        styles.base,
        styles[`variant_${variant}`],
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
  base: {
    backgroundColor: colors.background,
    borderRadius: componentTokens.card.borderRadius,
  },

  // Variants
  variant_elevated: {
    ...shadows.card,
  },
  variant_outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  variant_flat: {
    backgroundColor: colors.backgroundTertiary,
  },

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
