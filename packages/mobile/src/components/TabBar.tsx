import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../design-system/tokens';

export type TabName = 'timer' | 'history' | 'settings';

interface TabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
  showSettings?: boolean;
}

export function TabBar({ activeTab, onTabPress, showSettings = false }: TabBarProps) {
  return (
    <View style={styles.container} testID="tab-bar">
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress('timer')}
        testID="tab-timer"
        activeOpacity={0.7}
      >
        <Text style={[styles.tabIcon, activeTab === 'timer' && styles.tabIconActive]}>
          ⏱
        </Text>
        <Text style={[styles.tabLabel, activeTab === 'timer' && styles.tabLabelActive]}>
          Timer
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress('history')}
        testID="tab-history"
        activeOpacity={0.7}
      >
        <Text style={[styles.tabIcon, activeTab === 'history' && styles.tabIconActive]}>
          📋
        </Text>
        <Text style={[styles.tabLabel, activeTab === 'history' && styles.tabLabelActive]}>
          History
        </Text>
      </TouchableOpacity>

      {showSettings && (
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabPress('settings')}
          testID="tab-settings"
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'settings' && styles.tabIconActive]}>
            ⚙️
          </Text>
          <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>
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
    borderTopColor: colors.borderLight,
    backgroundColor: colors.background,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  tabIcon: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.xs,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});
