import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing } from '../tokens';

type SpacingKey = keyof typeof spacing;

export interface DSStackProps {
  children: React.ReactNode;
  gap?: SpacingKey | number;
  align?: 'stretch' | 'center' | 'flex-start' | 'flex-end';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  flex?: number;
  padding?: SpacingKey | number;
  paddingHorizontal?: SpacingKey | number;
  paddingVertical?: SpacingKey | number;
  style?: ViewStyle;
  testID?: string;
}

function resolveSpacing(value: SpacingKey | number | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  return spacing[value];
}

export function DSStack({
  children,
  gap,
  align,
  justify,
  flex,
  padding,
  paddingHorizontal,
  paddingVertical,
  style,
  testID,
}: DSStackProps) {
  const stackStyle: ViewStyle = {
    gap: resolveSpacing(gap),
    alignItems: align,
    justifyContent: justify,
    flex,
    padding: resolveSpacing(padding),
    paddingHorizontal: resolveSpacing(paddingHorizontal),
    paddingVertical: resolveSpacing(paddingVertical),
  };

  return (
    <View style={[styles.stack, stackStyle, style]} testID={testID}>
      {children}
    </View>
  );
}

// Horizontal row variant
export interface DSRowProps extends Omit<DSStackProps, 'align'> {
  align?: 'stretch' | 'center' | 'flex-start' | 'flex-end' | 'baseline';
}

export function DSRow({
  children,
  gap,
  align = 'center',
  justify,
  flex,
  padding,
  paddingHorizontal,
  paddingVertical,
  style,
  testID,
}: DSRowProps) {
  const rowStyle: ViewStyle = {
    gap: resolveSpacing(gap),
    alignItems: align,
    justifyContent: justify,
    flex,
    padding: resolveSpacing(padding),
    paddingHorizontal: resolveSpacing(paddingHorizontal),
    paddingVertical: resolveSpacing(paddingVertical),
  };

  return (
    <View style={[styles.row, rowStyle, style]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
