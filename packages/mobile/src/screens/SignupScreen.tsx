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

interface SignupScreenProps {
  onBack: () => void;
}

export function SignupScreen({ onBack }: SignupScreenProps) {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const confirmPasswordRef = useRef('');
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const handleEmailChange = useCallback((text: string) => {
    emailRef.current = text;
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    passwordRef.current = text;
  }, []);

  const handleConfirmPasswordChange = useCallback((text: string) => {
    confirmPasswordRef.current = text;
  }, []);

  const handleSignup = useCallback(async () => {
    const email = emailRef.current.trim();
    const password = passwordRef.current;
    const confirmPassword = confirmPasswordRef.current;

    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      Alert.alert(
        'Account Created',
        'Your account has been created. You can now sign in.',
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      Alert.alert('Signup Failed', message);
    } finally {
      setLoading(false);
    }
  }, [signUp, onBack]);

  return (
    <DSScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <DSCenter padding="xxl">
          <DSStack gap="md" align="stretch" style={{ width: '100%' }}>
            <DSText variant="h1" align="center">
              Create Account
            </DSText>
            <DSText variant="body" color="secondary" align="center">
              Sign up to start tracking time
            </DSText>

            <DSSpacer size="lg" />

            <DSTextInput
              placeholder="Email"
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              testID="signup-email-input"
              accessibilityLabel="Email"
            />

            <DSTextInput
              ref={passwordInputRef}
              placeholder="Password"
              onChangeText={handlePasswordChange}
              secureTextEntry
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              testID="signup-password-input"
              accessibilityLabel="Password"
            />

            <DSTextInput
              ref={confirmPasswordInputRef}
              placeholder="Confirm Password"
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSignup}
              testID="signup-confirm-password-input"
              accessibilityLabel="Confirm Password"
            />

            <DSSpacer size="sm" />

            <DSButton
              title="Sign Up"
              onPress={handleSignup}
              variant="primary"
              loading={loading}
              disabled={loading}
              testID="signup-button"
              accessibilityLabel="Sign Up"
            />

            <DSButton
              title="Back to Login"
              onPress={onBack}
              variant="ghost"
              testID="back-to-login-from-signup"
              accessibilityLabel="Back to Login"
            />
          </DSStack>
        </DSCenter>
      </KeyboardAvoidingView>
    </DSScreen>
  );
}
