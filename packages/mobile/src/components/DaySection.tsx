import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DayGroup } from '../hooks/useTimeEntries';
import { TimeEntryCard } from './TimeEntryCard';

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
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  total: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
