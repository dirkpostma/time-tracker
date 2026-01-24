import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import {
  DSButton,
  DSText,
  DSTextInput,
  DSToggle,
  DSSeparator,
  DSScreen,
  DSScreenHeader,
  DSSection,
  DSRow,
  spacing,
} from '../design-system';

export function SettingsScreen() {
  const { signOut } = useAuth();
  const {
    settings,
    hasPermission,
    loading,
    requestPermission,
    updateSettings,
  } = useNotifications();

  const [hoursInput, setHoursInput] = useState(settings.longTimerHours.toString());
  const [timeInput, setTimeInput] = useState(settings.dailyReminderTime);

  const handleLongTimerToggle = async (value: boolean) => {
    if (value && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive timer alerts.'
        );
        return;
      }
    }
    updateSettings({ longTimerEnabled: value });
  };

  const handleDailyReminderToggle = async (value: boolean) => {
    if (value && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive reminders.'
        );
        return;
      }
    }
    updateSettings({ dailyReminderEnabled: value });
  };

  const handleHoursChange = (text: string) => {
    setHoursInput(text);
    const hours = parseInt(text, 10);
    if (!isNaN(hours) && hours > 0 && hours <= 24) {
      updateSettings({ longTimerHours: hours });
    }
  };

  const handleTimeChange = (text: string) => {
    setTimeInput(text);
    // Validate HH:MM format
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(text)) {
      updateSettings({ dailyReminderTime: text });
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Logout failed';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <DSScreen variant="secondary" testID="settings-screen">
        <DSScreenHeader title="Settings" variant="bordered" />
      </DSScreen>
    );
  }

  return (
    <DSScreen scrollable variant="secondary" testID="settings-screen">
      <DSScreenHeader title="Settings" variant="bordered" />

      <DSSection title="Notifications" testID="notifications-section">
        <DSToggle
          value={settings.longTimerEnabled}
          onValueChange={handleLongTimerToggle}
          label="Alert when timer runs long"
          description="Get notified if your timer runs for too long"
          testID="long-timer-toggle"
        />

        {settings.longTimerEnabled && (
          <DSRow gap="md" paddingVertical="sm" style={{ paddingLeft: spacing.lg }}>
            <DSText variant="bodySmall">Alert after (hours):</DSText>
            <DSTextInput
              value={hoursInput}
              onChangeText={handleHoursChange}
              keyboardType="number-pad"
              testID="long-timer-hours"
              containerStyle={{ width: 60, marginBottom: 0 }}
            />
          </DSRow>
        )}

        <DSSeparator spacing="sm" />

        <DSToggle
          value={settings.dailyReminderEnabled}
          onValueChange={handleDailyReminderToggle}
          label="Daily reminder"
          description="Remind me to start tracking each day"
          testID="daily-reminder-toggle"
        />

        {settings.dailyReminderEnabled && (
          <DSRow gap="md" paddingVertical="sm" style={{ paddingLeft: spacing.lg }}>
            <DSText variant="bodySmall">Reminder time (HH:MM):</DSText>
            <DSTextInput
              value={timeInput}
              onChangeText={handleTimeChange}
              placeholder="09:00"
              testID="daily-reminder-time"
              containerStyle={{ width: 80, marginBottom: 0 }}
            />
          </DSRow>
        )}
      </DSSection>

      <DSSection title="Account">
        <DSButton
          title="Logout"
          onPress={handleLogout}
          variant="ghost"
          fullWidth={false}
          testID="settings-logout-button"
        />
      </DSSection>
    </DSScreen>
  );
}
