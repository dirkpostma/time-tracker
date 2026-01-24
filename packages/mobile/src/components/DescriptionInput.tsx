import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../design-system/tokens';

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
  placeholder = 'Add description...',
}: DescriptionInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        testID="description-input"
        accessibilityLabel="Description"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    minHeight: 60,
    maxHeight: 100,
    color: colors.textPrimary,
  },
  inputDisabled: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.borderLight,
  },
});
