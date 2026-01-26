import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { TimeEntryDisplay } from '../hooks/useTimeEntries';
import { typography, spacing } from '../design-system/tokens';
import { useTheme } from '../design-system/themes/ThemeContext';

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
  const { theme } = useTheme();
  const { colors, shadows, borderRadius } = theme;

  const containerStyle: ViewStyle = {
    backgroundColor: colors.backgroundCard,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.md,
  };

  const clientNameStyle: TextStyle = {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  };

  const durationStyle: TextStyle = {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  };

  const projectNameStyle: TextStyle = {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  };

  const taskNameStyle: TextStyle = {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  };

  const descriptionStyle: TextStyle = {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  };

  const timeRangeStyle: TextStyle = {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  };

  return (
    <View style={containerStyle} testID={`entry-card-${entry.id}`}>
      <View style={styles.header}>
        <Text style={clientNameStyle}>{entry.clientName}</Text>
        <Text style={durationStyle}>{formatDuration(entry.duration)}</Text>
      </View>

      {entry.projectName && (
        <Text style={projectNameStyle}>{entry.projectName}</Text>
      )}

      {entry.taskName && (
        <Text style={taskNameStyle}>{entry.taskName}</Text>
      )}

      {entry.description && (
        <Text style={descriptionStyle} numberOfLines={2}>
          {entry.description}
        </Text>
      )}

      <Text style={timeRangeStyle}>
        {formatTime(entry.startedAt)} - {formatTime(entry.endedAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
