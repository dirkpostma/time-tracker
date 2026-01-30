import React, { useCallback, useRef, useState } from 'react';
import { Alert, ActivityIndicator, View, ScrollView } from 'react-native';
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
import { useTheme } from '../design-system/themes/ThemeContext';

interface DeleteAccountScreenProps {
  onCancel: () => void;
  onDeleted: () => void;
}

export function DeleteAccountScreen({ onCancel, onDeleted }: DeleteAccountScreenProps) {
  const { deleteAccount } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const handleDelete = useCallback(async () => {
    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      Alert.alert('Error', 'Password is required');
      return;
    }

    setLoading(true);
    try {
      await deleteAccount(trimmedPassword);
      Alert.alert(
        'Account Deleted',
        'Your account and all data have been permanently deleted.',
        [{ text: 'OK', onPress: onDeleted }]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete account';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [deleteAccount, onDeleted, password]);

  return (
    <DSScreen testID="delete-account-screen" scrollable>
      <DSCenter padding="xxl">
        <DSStack gap="md" align="stretch" style={{ width: '100%' }}>
            <DSText variant="h1" align="center">
              Delete Account
            </DSText>

            <DSSpacer size="md" />

            <View testID="delete-warning-text">
              <DSText variant="body" color="secondary" align="center">
                This will permanently delete your account and all your data, including:
              </DSText>
              <DSSpacer size="sm" />
              <DSText variant="body" color="secondary">
                {'\u2022'} All time entries
              </DSText>
              <DSText variant="body" color="secondary">
                {'\u2022'} All clients, projects, and tasks
              </DSText>
              <DSText variant="body" color="secondary">
                {'\u2022'} Your account settings
              </DSText>
              <DSSpacer size="sm" />
              <DSText variant="body" color="danger" align="center">
                This action cannot be undone.
              </DSText>
            </View>

            <DSSpacer size="lg" />

            <DSTextInput
              placeholder="Enter your password to confirm"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              testID="delete-password-input"
              accessibilityLabel="Password"
              editable={!loading}
            />

            <DSSpacer size="sm" />

            {loading ? (
              <View testID="delete-loading" style={{ padding: 16, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.danger} />
                <DSSpacer size="sm" />
                <DSText variant="body" color="secondary">Deleting account...</DSText>
              </View>
            ) : (
              <>
                <DSButton
                  title="Delete My Account"
                  onPress={handleDelete}
                  variant="danger"
                  disabled={loading}
                  testID="delete-confirm-button"
                  accessibilityLabel="Delete My Account"
                />

                <DSButton
                  title="Cancel"
                  onPress={onCancel}
                  variant="ghost"
                  disabled={loading}
                  testID="delete-cancel-button"
                  accessibilityLabel="Cancel"
                />
              </>
            )}
          </DSStack>
        </DSCenter>
    </DSScreen>
  );
}
