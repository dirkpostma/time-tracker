import React from 'react';
import { StyleSheet, TextInput, View, Text, ViewStyle, TextStyle } from 'react-native';
import { typography, spacing } from '../design-system/tokens';
import { useTheme } from '../design-system/themes/ThemeContext';

interface DescriptionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  placeholder?: string;
}

export function DescriptionInput({
  value,
  onChangeText,
  editable,
  placeholder = 'What are you working on?',
}: DescriptionInputProps) {
  const { theme } = useTheme();
  const { colors, borderRadius, shadows } = theme;

  const containerStyle: ViewStyle = {
    marginTop: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  };

  const labelStyle: TextStyle = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };

  const hintStyle: TextStyle = {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  };

  const inputStyle: TextStyle = {
    backgroundColor: editable ? colors.backgroundTertiary : colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    minHeight: 48,
    maxHeight: 80,
    color: editable ? colors.textPrimary : colors.textTertiary,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  };

  return (
    <View style={containerStyle}>
      <View style={styles.labelRow}>
        <Text style={labelStyle}>Notes</Text>
        {editable && !value && (
          <Text style={hintStyle}>optional</Text>
        )}
      </View>
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={2}
        textAlignVertical="top"
        testID="description-input"
        accessibilityLabel="Description"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
});
