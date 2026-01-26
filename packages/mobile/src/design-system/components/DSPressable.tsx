import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

export interface DSPressableProps {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  activeOpacity?: number;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export function DSPressable({
  children,
  onPress,
  disabled = false,
  activeOpacity = 0.7,
  style,
  testID,
  accessibilityLabel,
}: DSPressableProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      {children}
    </TouchableOpacity>
  );
}
