import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView, RefreshControl } from 'react-native';
import { colors, spacing } from '../tokens';

export interface DSScreenProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary';
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  testID?: string;
}

export function DSScreen({
  children,
  variant = 'default',
  scrollable = false,
  refreshing,
  onRefresh,
  style,
  contentStyle,
  testID,
}: DSScreenProps) {
  const containerStyle = [
    styles.container,
    variant === 'secondary' && styles.secondary,
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        testID={testID}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[containerStyle, contentStyle]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  secondary: {
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
