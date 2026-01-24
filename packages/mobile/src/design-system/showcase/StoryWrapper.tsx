import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../tokens';

interface StoryWrapperProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function StoryWrapper({ title, description, children }: StoryWrapperProps) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {description && <Text style={styles.description}>{description}</Text>}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

interface StoryRowProps {
  label: string;
  children: React.ReactNode;
}

export function StoryRow({ label, children }: StoryRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.rowContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  content: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.lg,
  },
  row: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  rowContent: {},
});
