import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, componentTokens } from '../tokens';
import { useTheme } from '../themes/ThemeContext';
import { ThemeColors, ThemeTypography, ThemeSpacing, ThemeBorderRadius } from '../themes';

export type DSButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
export type DSButtonSize = 'sm' | 'md' | 'lg';

export interface DSButtonProps {
  title: string;
  onPress: () => void;
  variant?: DSButtonVariant;
  size?: DSButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function DSButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  testID,
  accessibilityLabel,
  style,
}: DSButtonProps) {
  // Try to get theme context, fall back to default if not available
  let themeColors = colors as unknown as ThemeColors;
  let themeTypography = typography as unknown as ThemeTypography;
  let themeSpacing = spacing as unknown as ThemeSpacing;
  let themeBorderRadius: ThemeBorderRadius = { none: 0, sm: 6, md: 8, lg: 12, xl: 16, full: 9999 };
  try {
    const { theme } = useTheme();
    themeColors = theme.colors;
    themeTypography = theme.typography;
    themeSpacing = theme.spacing;
    themeBorderRadius = theme.borderRadius;
  } catch {
    // useTheme will throw if not in a ThemeProvider - use default colors
  }

  const isDisabled = disabled || loading;

  // Build styles dynamically using theme values
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: themeColors.primary };
      case 'secondary':
        return {
          backgroundColor: themeColors.backgroundTertiary,
          borderWidth: 1,
          borderColor: themeColors.border,
        };
      case 'danger':
        return { backgroundColor: themeColors.danger };
      case 'ghost':
      case 'link':
        return { backgroundColor: 'transparent' };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: themeSpacing.sm, paddingHorizontal: themeSpacing.md };
      case 'md':
        return { paddingVertical: componentTokens.button.paddingVertical, paddingHorizontal: componentTokens.button.paddingHorizontal };
      case 'lg':
        return { paddingVertical: themeSpacing.lg, paddingHorizontal: themeSpacing.xl };
    }
  };

  const getTextVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return { color: themeColors.textOnPrimary };
      case 'secondary':
        return { color: themeColors.textSecondary };
      case 'ghost':
      case 'link':
        return { color: themeColors.primary };
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: themeTypography.fontSize.sm };
      case 'md':
        return { fontSize: themeTypography.fontSize.md };
      case 'lg':
        return { fontSize: themeTypography.fontSize.lg };
    }
  };

  const buttonStyles: ViewStyle[] = [
    {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: themeBorderRadius.md,
    },
    getVariantStyle(),
    getSizeStyle(),
    fullWidth && { width: '100%' as const },
    isDisabled && { opacity: 0.6 },
    isDisabled && variant === 'primary' && { backgroundColor: themeColors.textMuted },
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    { fontWeight: themeTypography.fontWeight.semibold },
    getTextVariantStyle(),
    getTextSizeStyle(),
    isDisabled && (variant === 'ghost' || variant === 'link') && { color: themeColors.textMuted },
  ].filter(Boolean) as TextStyle[];

  const loaderColor = variant === 'ghost' || variant === 'link' ? themeColors.primary : themeColors.textOnPrimary;

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} size="small" />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
