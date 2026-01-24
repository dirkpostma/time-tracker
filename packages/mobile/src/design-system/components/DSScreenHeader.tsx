import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { DSText } from './DSText';
import { DSButton } from './DSButton';
import { colors, spacing } from '../tokens';

export interface DSScreenHeaderProps {
  title: string;
  action?: {
    label: string;
    onPress: () => void;
    variant?: 'ghost' | 'link';
    testID?: string;
  };
  variant?: 'default' | 'bordered';
  style?: ViewStyle;
}

export function DSScreenHeader({
  title,
  action,
  variant = 'default',
  style,
}: DSScreenHeaderProps) {
  return (
    <View style={[styles.container, variant === 'bordered' && styles.bordered, style]}>
      <DSText variant="h2">{title}</DSText>
      {action && (
        <DSButton
          title={action.label}
          onPress={action.onPress}
          variant={action.variant || 'ghost'}
          size="sm"
          fullWidth={false}
          testID={action.testID}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.headerTop,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
});
