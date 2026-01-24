import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing } from '../tokens';

type SpacingKey = keyof typeof spacing;

export interface DSCenterProps {
  children: React.ReactNode;
  flex?: number;
  padding?: SpacingKey | number;
  style?: ViewStyle;
  testID?: string;
}

function resolveSpacing(value: SpacingKey | number | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  return spacing[value];
}

export function DSCenter({
  children,
  flex = 1,
  padding,
  style,
  testID,
}: DSCenterProps) {
  const centerStyle: ViewStyle = {
    flex,
    padding: resolveSpacing(padding),
  };

  return (
    <View style={[styles.center, centerStyle, style]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
