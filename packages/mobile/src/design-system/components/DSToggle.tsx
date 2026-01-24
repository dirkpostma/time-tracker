import React from 'react';
import { View, Text, Switch, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../tokens';

export interface DSToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  testID?: string;
}

export function DSToggle({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  containerStyle,
  testID,
}: DSToggleProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.textContainer}>
        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
        {description && (
          <Text style={[styles.description, disabled && styles.descriptionDisabled]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        testID={testID}
        trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
        thumbColor={colors.background}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  descriptionDisabled: {
    color: colors.textMuted,
  },
});
