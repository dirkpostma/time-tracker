import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import {
  DSButton,
  DSText,
  DSTextInput,
  DSScreen,
  DSStack,
  DSCenter,
  DSSpacer,
  DSKeyboardAvoidingView,
} from '../design-system';

interface LoginScreenProps {
  onOpenShowcase?: () => void;
}

export function LoginScreen({ onOpenShowcase }: LoginScreenProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
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
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      await signIn('test@example.com', 'Test1234');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Dev Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DSScreen>
      <DSKeyboardAvoidingView>
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
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="email-input"
              accessibilityLabel="Email"
            />

            <DSTextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              testID="password-input"
              accessibilityLabel="Password"
            />

            <DSSpacer size="sm" />

            <DSButton
              title="Login"
              onPress={handleLogin}
              variant="primary"
              loading={loading}
              disabled={loading}
              testID="login-button"
              accessibilityLabel="Login"
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
                variant="primary"
                size="sm"
              />
            )}
          </DSStack>
        </DSCenter>
      </DSKeyboardAvoidingView>
    </DSScreen>
  );
}
