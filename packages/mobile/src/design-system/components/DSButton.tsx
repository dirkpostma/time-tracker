import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius, componentTokens } from '../tokens';

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
  const isDisabled = disabled || loading;

  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    isDisabled && styles[`disabled_${variant}`],
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    isDisabled && styles.textDisabled,
    isDisabled && styles[`textDisabled_${variant}`],
  ].filter(Boolean) as TextStyle[];

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
        <ActivityIndicator
          color={variant === 'ghost' || variant === 'link' ? colors.primary : colors.textInverse}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: componentTokens.button.borderRadius,
  },
  fullWidth: {
    width: '100%',
  },

  // Variants
  variant_primary: {
    backgroundColor: colors.primary,
  },
  variant_secondary: {
    backgroundColor: colors.backgroundDisabled,
    borderWidth: 1,
    borderColor: colors.border,
  },
  variant_danger: {
    backgroundColor: colors.danger,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_link: {
    backgroundColor: 'transparent',
  },

  // Sizes
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  size_md: {
    paddingVertical: componentTokens.button.paddingVertical,
    paddingHorizontal: componentTokens.button.paddingHorizontal,
  },
  size_lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },

  // Disabled states
  disabled: {
    opacity: 0.6,
  },
  disabled_primary: {
    backgroundColor: colors.textMuted,
  },
  disabled_secondary: {},
  disabled_danger: {},
  disabled_ghost: {},
  disabled_link: {},

  // Text base
  text: {
    fontWeight: typography.fontWeight.semibold,
  },

  // Text variants
  text_primary: {
    color: colors.textInverse,
  },
  text_secondary: {
    color: colors.textSecondary,
  },
  text_danger: {
    color: colors.textInverse,
  },
  text_ghost: {
    color: colors.primary,
  },
  text_link: {
    color: colors.primary,
  },

  // Text sizes
  text_sm: {
    fontSize: typography.fontSize.sm,
  },
  text_md: {
    fontSize: typography.fontSize.md,
  },
  text_lg: {
    fontSize: typography.fontSize.lg,
  },

  // Text disabled
  textDisabled: {},
  textDisabled_primary: {},
  textDisabled_secondary: {},
  textDisabled_danger: {},
  textDisabled_ghost: {
    color: colors.textMuted,
  },
  textDisabled_link: {
    color: colors.textMuted,
  },
});
