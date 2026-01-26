import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { DSText } from './DSText';
import { DSButton } from './DSButton';
import { spacing } from '../tokens';
import { useTheme } from '../themes/ThemeContext';

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
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
        variant === 'bordered' && [styles.bordered, { borderBottomColor: colors.borderLight }],
        style,
      ]}
    >
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
  },
  bordered: {
    borderBottomWidth: 1,
  },
});
