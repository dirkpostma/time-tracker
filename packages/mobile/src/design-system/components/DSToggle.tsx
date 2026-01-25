import React from 'react';
import { View, Text, Switch, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../tokens';
import { useTheme } from '../themes/ThemeContext';
import { ThemeColors, ThemeTypography, ThemeSpacing } from '../themes';

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
  // Try to get theme context, fall back to default if not available
  let themeColors = colors as unknown as ThemeColors;
  let themeTypography = typography as unknown as ThemeTypography;
  let themeSpacing = spacing as unknown as ThemeSpacing;
  try {
    const { theme } = useTheme();
    themeColors = theme.colors;
    themeTypography = theme.typography;
    themeSpacing = theme.spacing;
  } catch {
    // useTheme will throw if not in a ThemeProvider - use default colors
  }

  return (
    <View style={[styles.container, { paddingVertical: themeSpacing.md }, containerStyle]}>
      <View style={[styles.textContainer, { marginRight: themeSpacing.lg }]}>
        <Text
          style={{
            fontSize: themeTypography.fontSize.md,
            color: disabled ? themeColors.textMuted : themeColors.textPrimary,
          }}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={{
              fontSize: themeTypography.fontSize.sm,
              color: themeColors.textMuted,
              marginTop: themeSpacing.xs,
            }}
          >
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        testID={testID}
        trackColor={{ false: themeColors.borderLight, true: themeColors.primaryLight }}
        thumbColor={themeColors.background}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
});
