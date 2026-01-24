import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { DSText } from './DSText';
import { colors, spacing } from '../tokens';

export interface DSSectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function DSSection({
  title,
  children,
  style,
  testID,
}: DSSectionProps) {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {title && (
        <DSText variant="label" style={styles.title}>
          {title}
        </DSText>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    marginBottom: spacing.md,
  },
});
