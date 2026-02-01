import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DSCard, DSText, DSPressable, spacing, colors } from '../design-system';

interface SwitchCardProps {
  onPress: () => void;
  disabled?: boolean;
}

export function SwitchCard({ onPress, disabled }: SwitchCardProps) {
  return (
    <DSPressable onPress={onPress} testID="switch-selection-button" disabled={disabled}>
      <DSCard
        variant="flat"
        style={{ 
          marginTop: spacing.lg, 
          borderColor: colors.primary, 
          borderWidth: 1,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <View style={styles.row}>
          <DSText variant="body" color="primary">↻</DSText>
          <DSText variant="body" color="secondary" style={styles.text}>
            Switch to different client/project
          </DSText>
        </View>
      </DSCard>
    </DSPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    marginLeft: spacing.xs,
  },
});
