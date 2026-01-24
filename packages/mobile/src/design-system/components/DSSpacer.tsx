import React from 'react';
import { View } from 'react-native';
import { spacing } from '../tokens';

type SpacingKey = keyof typeof spacing;

export interface DSSpacerProps {
  size?: SpacingKey | number;
  flex?: number;
  horizontal?: boolean;
}

function resolveSpacing(value: SpacingKey | number | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  return spacing[value];
}

export function DSSpacer({
  size,
  flex,
  horizontal = false,
}: DSSpacerProps) {
  const dimension = resolveSpacing(size);

  if (flex !== undefined) {
    return <View style={{ flex }} />;
  }

  if (horizontal) {
    return <View style={{ width: dimension }} />;
  }

  return <View style={{ height: dimension }} />;
}
