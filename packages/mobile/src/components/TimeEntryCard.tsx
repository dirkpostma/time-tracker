import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimeEntryDisplay } from '../hooks/useTimeEntries';

interface TimeEntryCardProps {
  entry: TimeEntryDisplay;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function TimeEntryCard({ entry }: TimeEntryCardProps) {
  return (
    <View style={styles.container} testID={`entry-card-${entry.id}`}>
      <View style={styles.header}>
        <Text style={styles.clientName}>{entry.clientName}</Text>
        <Text style={styles.duration}>{formatDuration(entry.duration)}</Text>
      </View>

      {entry.projectName && (
        <Text style={styles.projectName}>{entry.projectName}</Text>
      )}

      {entry.taskName && (
        <Text style={styles.taskName}>{entry.taskName}</Text>
      )}

      {entry.description && (
        <Text style={styles.description} numberOfLines={2}>
          {entry.description}
        </Text>
      )}

      <Text style={styles.timeRange}>
        {formatTime(entry.startedAt)} - {formatTime(entry.endedAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  duration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  projectName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  taskName: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  timeRange: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});
