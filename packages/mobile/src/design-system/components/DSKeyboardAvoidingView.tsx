import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StyleSheet,
} from 'react-native';

export interface DSKeyboardAvoidingViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function DSKeyboardAvoidingView({
  children,
  style,
}: DSKeyboardAvoidingViewProps) {
  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
