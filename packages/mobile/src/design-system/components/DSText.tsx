import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { colors, typography } from '../tokens';
import { useTheme } from '../themes/ThemeContext';
import { ThemeColors, ThemeTypography } from '../themes';

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

function getVariantStyle(variant: DSTextVariant, themeColors: ThemeColors, themeTypography: ThemeTypography): TextStyle {
  const variantStyles: Record<DSTextVariant, TextStyle> = {
    h1: {
      fontSize: themeTypography.fontSize.xxl,
      fontWeight: themeTypography.fontWeight.bold,
      color: themeColors.textPrimary,
    },
    h2: {
      fontSize: themeTypography.fontSize.xl,
      fontWeight: themeTypography.fontWeight.bold,
      color: themeColors.textPrimary,
    },
    h3: {
      fontSize: themeTypography.fontSize.lg,
      fontWeight: themeTypography.fontWeight.semibold,
      color: themeColors.textPrimary,
    },
    body: {
      fontSize: themeTypography.fontSize.md,
      fontWeight: themeTypography.fontWeight.normal,
      color: themeColors.textPrimary,
    },
    bodySmall: {
      fontSize: themeTypography.fontSize.sm,
      fontWeight: themeTypography.fontWeight.normal,
      color: themeColors.textSecondary,
    },
    caption: {
      fontSize: themeTypography.fontSize.xs,
      fontWeight: themeTypography.fontWeight.normal,
      color: themeColors.textMuted,
    },
    label: {
      fontSize: themeTypography.fontSize.sm,
      fontWeight: themeTypography.fontWeight.semibold,
      color: themeColors.textSecondary,
      textTransform: 'uppercase',
    },
    timer: {
      fontSize: themeTypography.fontSize.timer,
      fontWeight: themeTypography.fontWeight.thin,
      fontVariant: ['tabular-nums'],
      color: themeColors.textPrimary,
    },
  };
  return variantStyles[variant];
}

function getColorStyle(colorName: DSTextColor, themeColors: ThemeColors): TextStyle {
  const colorMap: Record<DSTextColor, string> = {
    primary: themeColors.textPrimary,
    secondary: themeColors.textSecondary,
    tertiary: themeColors.textTertiary,
    muted: themeColors.textMuted,
    inverse: themeColors.textInverse,
    link: themeColors.primary,
    danger: themeColors.danger,
    success: themeColors.success,
  };
  return { color: colorMap[colorName] };
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
  // Try to get theme context, fall back to default if not available
  let themeColors = colors as unknown as ThemeColors;
  let themeTypography = typography as unknown as ThemeTypography;
  try {
    const { theme } = useTheme();
    themeColors = theme.colors;
    themeTypography = theme.typography;
  } catch {
    // useTheme will throw if not in a ThemeProvider - use default colors
  }

  const textStyles: TextStyle[] = [
    getVariantStyle(variant, themeColors, themeTypography),
    getColorStyle(color, themeColors),
    weight && { fontWeight: themeTypography.fontWeight[weight] },
    align && { textAlign: align },
    uppercase && { textTransform: 'uppercase' },
    style,
  ].filter(Boolean) as TextStyle[];

  return (
    <Text style={textStyles} {...props}>
      {children}
    </Text>
  );
}
