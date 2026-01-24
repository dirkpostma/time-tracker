import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DayGroup } from '../hooks/useTimeEntries';
import { TimeEntryCard } from './TimeEntryCard';
import { colors, typography, spacing } from '../design-system/tokens';

interface DaySectionProps {
  group: DayGroup;
}

function formatTotalDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

export function DaySection({ group }: DaySectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header} testID={`day-header-${group.date}`}>
        <Text style={styles.date}>{group.displayDate}</Text>
        <Text style={styles.total}>{formatTotalDuration(group.totalDuration)}</Text>
      </View>
      {group.entries.map((entry) => (
        <TimeEntryCard key={entry.id} entry={entry} />
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
  date: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  total: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});
