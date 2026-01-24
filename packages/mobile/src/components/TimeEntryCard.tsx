import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimeEntryDisplay } from '../hooks/useTimeEntries';
import {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
} from '../design-system/tokens';

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
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  duration: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  projectName: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  taskName: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  timeRange: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
