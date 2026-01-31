import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { DayGroup, TimeEntryDisplay } from '../hooks/useTimeEntries';
import { TimeEntryCard } from './TimeEntryCard';
import { typography, spacing } from '../design-system/tokens';
import { useTheme } from '../design-system/themes/ThemeContext';

interface DaySectionProps {
  group: DayGroup;
  onEntryPress?: (entry: TimeEntryDisplay) => void;
}

function formatTotalDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

export function DaySection({ group, onEntryPress }: DaySectionProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const dateStyle: TextStyle = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  };

  const totalStyle: TextStyle = {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} testID={`day-header-${group.date}`}>
        <Text style={dateStyle}>{group.displayDate}</Text>
        <Text style={totalStyle}>{formatTotalDuration(group.totalDuration)}</Text>
      </View>
      {group.entries.map((entry) => (
        <TimeEntryCard 
          key={entry.id} 
          entry={entry} 
          onPress={onEntryPress ? () => onEntryPress(entry) : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
