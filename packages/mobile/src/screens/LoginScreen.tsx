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

interface LoginScreenProps {
  onOpenShowcase?: () => void;
  onOpenThemes?: () => void;
  onForgotPassword: () => void;
  onSignup: () => void;
}

export function LoginScreen({ onOpenShowcase, onOpenThemes, onForgotPassword, onSignup }: LoginScreenProps) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const passwordInputRef = useRef<TextInput>(null);

  const handleEmailChange = useCallback((text: string) => {
    emailRef.current = text;
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    passwordRef.current = text;
  }, []);

  const handleLogin = useCallback(async () => {
    const email = emailRef.current.trim();
    const password = passwordRef.current;

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  }, [signIn]);

  const handleDevLogin = useCallback(async () => {
    setLoading(true);
    try {
      await signIn('test@example.com', 'Test1234');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Dev Login Failed', message);
    } finally {
      setLoading(false);
    }
  }, [signIn]);

  return (
    <DSScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <DSCenter padding="xxl">
          <DSStack gap="md" align="stretch" style={{ width: '100%' }}>
            <DSText variant="h1" align="center">
              Time Tracker
            </DSText>
            <DSText variant="body" color="secondary" align="center">
              Sign in to continue
            </DSText>

            <DSSpacer size="lg" />

            <DSTextInput
              placeholder="Email"
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              testID="email-input"
              accessibilityLabel="Email"
            />

            <DSTextInput
              ref={passwordInputRef}
              placeholder="Password"
              onChangeText={handlePasswordChange}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              testID="password-input"
              accessibilityLabel="Password"
            />

            <DSButton
              title="Forgot Password?"
              onPress={onForgotPassword}
              variant="link"
              size="sm"
              testID="forgot-password-button"
              accessibilityLabel="Forgot Password"
            />

            <DSButton
              title="Login"
              onPress={handleLogin}
              variant="primary"
              loading={loading}
              disabled={loading}
              testID="login-button"
              accessibilityLabel="Login"
            />

            <DSButton
              title="Create Account"
              onPress={onSignup}
              variant="secondary"
              testID="go-to-signup-button"
              accessibilityLabel="Create Account"
            />

            {__DEV__ && (
              <DSButton
                title="Dev Login (test@example.com)"
                onPress={handleDevLogin}
                variant="secondary"
                loading={loading}
                disabled={loading}
                size="sm"
              />
            )}
            {__DEV__ && onOpenShowcase && (
              <DSButton
                title="Open Component Showcase"
                onPress={onOpenShowcase}
                variant="secondary"
                size="sm"
                testID="open-showcase-button"
              />
            )}
            {__DEV__ && onOpenThemes && (
              <DSButton
                title="Theme Showcase (5 Themes)"
                onPress={onOpenThemes}
                variant="primary"
                size="sm"
                testID="open-themes-button"
              />
            )}
          </DSStack>
        </DSCenter>
      </KeyboardAvoidingView>
    </DSScreen>
  );
}
