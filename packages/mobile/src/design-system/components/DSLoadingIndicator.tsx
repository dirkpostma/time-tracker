import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../tokens';

export interface DSLoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function DSLoadingIndicator({
  size = 'large',
  color = colors.primary,
  fullScreen = false,
  style,
  testID,
}: DSLoadingIndicatorProps) {
  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, style]} testID={testID}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={color} testID={testID} />;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
