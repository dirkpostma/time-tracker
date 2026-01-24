import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { colors, typography } from '../tokens';

export type DSTextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'timer';

export type DSTextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'muted'
  | 'inverse'
  | 'link'
  | 'danger'
  | 'success';

export interface DSTextProps extends Omit<TextProps, 'style'> {
  variant?: DSTextVariant;
  color?: DSTextColor;
  weight?: keyof typeof typography.fontWeight;
  align?: 'left' | 'center' | 'right';
  uppercase?: boolean;
  style?: TextStyle;
  children: React.ReactNode;
}

export function DSText({
  variant = 'body',
  color = 'primary',
  weight,
  align,
  uppercase = false,
  style,
  children,
  ...props
}: DSTextProps) {
  const textStyles: TextStyle[] = [
    styles[`variant_${variant}`],
    styles[`color_${color}`],
    weight && { fontWeight: typography.fontWeight[weight] },
    align && { textAlign: align },
    uppercase && styles.uppercase,
    style,
  ].filter(Boolean) as TextStyle[];

  return (
    <Text style={textStyles} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  // Variants
  variant_h1: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  variant_h2: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  variant_h3: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  variant_body: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.normal,
    color: colors.textPrimary,
  },
  variant_bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.textSecondary,
  },
  variant_caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    color: colors.textMuted,
  },
  variant_label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  variant_timer: {
    fontSize: typography.fontSize.timer,
    fontWeight: typography.fontWeight.thin,
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },

  // Colors
  color_primary: {
    color: colors.textPrimary,
  },
  color_secondary: {
    color: colors.textSecondary,
  },
  color_tertiary: {
    color: colors.textTertiary,
  },
  color_muted: {
    color: colors.textMuted,
  },
  color_inverse: {
    color: colors.textInverse,
  },
  color_link: {
    color: colors.primary,
  },
  color_danger: {
    color: colors.danger,
  },
  color_success: {
    color: colors.success,
  },

  // Modifiers
  uppercase: {
    textTransform: 'uppercase',
  },
});
