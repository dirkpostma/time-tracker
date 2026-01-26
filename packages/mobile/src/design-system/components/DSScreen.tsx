import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView, RefreshControl } from 'react-native';
import { colors } from '../tokens';
import { useTheme } from '../themes/ThemeContext';

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
  // Try to get theme context, fall back to default colors if not available
  let backgroundColor: string = colors.background;
  let backgroundSecondaryColor: string = colors.backgroundSecondary;
  try {
    const { theme } = useTheme();
    backgroundColor = theme.colors.background;
    backgroundSecondaryColor = theme.colors.backgroundSecondary;
  } catch {
    // useTheme will throw if not in a ThemeProvider - use default colors
  }

  const containerStyle: ViewStyle[] = [
    styles.container,
    { backgroundColor: variant === 'secondary' ? backgroundSecondaryColor : backgroundColor },
    style,
  ].filter(Boolean) as ViewStyle[];

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
    <View style={[...containerStyle, contentStyle]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
