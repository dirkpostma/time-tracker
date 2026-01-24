import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

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
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingBottom: 20,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 12,
    color: '#999',
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
