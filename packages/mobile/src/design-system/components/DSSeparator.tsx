import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../tokens';

export interface DSSeparatorProps {
  variant?: 'full' | 'inset';
  spacing?: 'none' | 'sm' | 'md';
  style?: ViewStyle;
}

export function DSSeparator({
  variant = 'full',
  spacing: spacingSize = 'none',
  style,
}: DSSeparatorProps) {
  return (
    <View
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`spacing_${spacingSize}`],
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    height: 1,
    backgroundColor: colors.borderLight,
  },

  // Variants
  variant_full: {
    marginLeft: 0,
  },
  variant_inset: {
    marginLeft: spacing.lg,
  },

  // Spacing
  spacing_none: {
    marginVertical: 0,
  },
  spacing_sm: {
    marginVertical: spacing.sm,
  },
  spacing_md: {
    marginVertical: spacing.md,
  },
});
