import React, { forwardRef } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing, componentTokens } from '../tokens';
import { useTheme } from '../themes/ThemeContext';
import { ThemeColors, ThemeTypography, ThemeSpacing, ThemeBorderRadius } from '../themes';

export interface DSTextInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export const DSTextInput = forwardRef<TextInput, DSTextInputProps>(function DSTextInput(
  {
    label,
    error,
    disabled = false,
    editable = true,
    containerStyle,
    ...props
  },
  ref
) {
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

  const isDisabled = disabled || editable === false;

  return (
    <View style={[styles.container, { marginBottom: themeSpacing.lg }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontSize: themeTypography.fontSize.sm,
            fontWeight: themeTypography.fontWeight.medium,
            color: themeColors.textSecondary,
            marginBottom: themeSpacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        ref={ref}
        style={[
          {
            backgroundColor: themeColors.backgroundSecondary,
            borderRadius: themeBorderRadius.md,
            paddingHorizontal: componentTokens.input.paddingHorizontal,
            paddingVertical: componentTokens.input.paddingVertical,
            fontSize: themeTypography.fontSize.md,
            color: themeColors.textPrimary,
            borderWidth: componentTokens.input.borderWidth,
            borderColor: themeColors.border,
          },
          isDisabled && {
            backgroundColor: themeColors.backgroundSecondary,
            borderColor: themeColors.borderLight,
            color: themeColors.textMuted,
          },
          error && { borderColor: themeColors.danger },
        ]}
        editable={!isDisabled}
        placeholderTextColor={themeColors.textMuted}
        {...props}
      />
      {error && (
        <Text
          style={{
            fontSize: themeTypography.fontSize.xs,
            color: themeColors.danger,
            marginTop: themeSpacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {},
});
