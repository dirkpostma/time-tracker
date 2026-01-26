import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../tokens';

export type DSBadgeVariant = 'info' | 'success' | 'warning' | 'danger';

export interface DSBadgeProps {
  text: string;
  subtext?: string;
  variant?: DSBadgeVariant;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function DSBadge({
  text,
  subtext,
  variant = 'info',
  fullWidth = true,
  style,
  testID,
}: DSBadgeProps) {
  return (
    <View
      style={[
        styles.container,
        styles[`variant_${variant}`],
        fullWidth && styles.fullWidth,
        style,
      ]}
      testID={testID}
    >
      <Text style={styles.text}>{text}</Text>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },

  // Variants
  variant_info: {
    backgroundColor: colors.primary,
  },
  variant_success: {
    backgroundColor: colors.success,
  },
  variant_warning: {
    backgroundColor: colors.warning,
  },
  variant_danger: {
    backgroundColor: colors.danger,
  },

  text: {
    color: colors.textInverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xxs,
  },
});
