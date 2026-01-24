import React from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius, componentTokens } from '../tokens';

export interface DSTextInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export function DSTextInput({
  label,
  error,
  disabled = false,
  editable = true,
  containerStyle,
  ...props
}: DSTextInputProps) {
  const isDisabled = disabled || editable === false;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isDisabled && styles.inputDisabled,
          error && styles.inputError,
        ]}
        editable={!isDisabled}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: componentTokens.input.borderRadius,
    paddingHorizontal: componentTokens.input.paddingHorizontal,
    paddingVertical: componentTokens.input.paddingVertical,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    borderWidth: componentTokens.input.borderWidth,
    borderColor: colors.borderInput,
  },
  inputDisabled: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.borderLight,
    color: colors.textMuted,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    fontSize: typography.fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
