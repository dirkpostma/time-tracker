import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../design-system/tokens';
import { useTheme } from '../design-system/themes/ThemeContext';
import { ThemeColors, ThemeTypography, ThemeSpacing } from '../design-system/themes';

export type TabName = 'timer' | 'history' | 'settings';

interface TabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
  showSettings?: boolean;
}

export function TabBar({ activeTab, onTabPress, showSettings = false }: TabBarProps) {
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

  const tabIconStyle = {
    fontSize: themeTypography.fontSize.xl,
    marginBottom: themeSpacing.xs,
    opacity: 0.5,
  };

  const tabIconActiveStyle = {
    opacity: 1,
  };

  const tabLabelStyle = {
    fontSize: themeTypography.fontSize.xs,
    color: themeColors.textMuted,
  };

  const tabLabelActiveStyle = {
    color: themeColors.primary,
    fontWeight: themeTypography.fontWeight.semibold,
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderTopColor: themeColors.borderLight,
          backgroundColor: themeColors.background,
          paddingBottom: themeSpacing.xl,
          paddingTop: themeSpacing.sm,
        },
      ]}
      testID="tab-bar"
    >
      <TouchableOpacity
        style={[styles.tab, { paddingVertical: themeSpacing.sm }]}
        onPress={() => onTabPress('timer')}
        testID="tab-timer"
        activeOpacity={0.7}
      >
        <Text style={[tabIconStyle, activeTab === 'timer' && tabIconActiveStyle]}>
          ⏱
        </Text>
        <Text style={[tabLabelStyle, activeTab === 'timer' && tabLabelActiveStyle]}>
          Timer
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, { paddingVertical: themeSpacing.sm }]}
        onPress={() => onTabPress('history')}
        testID="tab-history"
        activeOpacity={0.7}
      >
        <Text style={[tabIconStyle, activeTab === 'history' && tabIconActiveStyle]}>
          📋
        </Text>
        <Text style={[tabLabelStyle, activeTab === 'history' && tabLabelActiveStyle]}>
          History
        </Text>
      </TouchableOpacity>

      {showSettings && (
        <TouchableOpacity
          style={[styles.tab, { paddingVertical: themeSpacing.sm }]}
          onPress={() => onTabPress('settings')}
          testID="tab-settings"
          activeOpacity={0.7}
        >
          <Text style={[tabIconStyle, activeTab === 'settings' && tabIconActiveStyle]}>
            ⚙️
          </Text>
          <Text style={[tabLabelStyle, activeTab === 'settings' && tabLabelActiveStyle]}>
            Settings
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
});
