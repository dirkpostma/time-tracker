import React, { useCallback, useRef, useState } from 'react';
import { Alert, TextInput } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import {
  DSButton,
  DSText,
  DSTextInput,
  DSScreen,
  DSStack,
  DSCenter,
  DSSpacer,
} from '../design-system';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const emailRef = useRef('');

  const handleEmailChange = useCallback((text: string) => {
    emailRef.current = text;
  }, []);

  const handleReset = useCallback(async () => {
    const email = emailRef.current.trim();
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert(
        'Check Your Email',
        'If an account exists with that email, you will receive a password reset link.',
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reset failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [resetPassword, onBack]);

  return (
    <DSScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <DSCenter padding="xxl">
          <DSStack gap="md" align="stretch" style={{ width: '100%' }}>
            <DSText variant="h1" align="center">
              Reset Password
            </DSText>
            <DSText variant="body" color="secondary" align="center">
              Enter your email to receive a reset link
            </DSText>

            <DSSpacer size="lg" />

            <DSTextInput
              placeholder="Email"
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              testID="reset-email-input"
              accessibilityLabel="Email"
            />

            <DSSpacer size="sm" />

            <DSButton
              title="Send Reset Link"
              onPress={handleReset}
              variant="primary"
              loading={loading}
              disabled={loading}
              testID="reset-button"
              accessibilityLabel="Send Reset Link"
            />

            <DSButton
              title="Back to Login"
              onPress={onBack}
              variant="ghost"
              testID="back-to-login-button"
              accessibilityLabel="Back to Login"
            />
          </DSStack>
        </DSCenter>
      </KeyboardAvoidingView>
    </DSScreen>
  );
}
