import React, { useState, useEffect } from 'react';
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

interface SettingsScreenProps {
  onDeleteAccount: () => void;
}

export function SettingsScreen({ onDeleteAccount }: SettingsScreenProps) {
  const { signOut } = useAuth();
  const {
    settings,
    hasPermission,
    loading,
    requestPermission,
    updateSettings,
  } = useNotifications();

  const [hoursInput, setHoursInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [hoursChanged, setHoursChanged] = useState(false);
  const [timeChanged, setTimeChanged] = useState(false);

  // Sync local state when settings load from storage
  useEffect(() => {
    if (!loading) {
      setHoursInput(settings.longTimerHours.toString());
      setTimeInput(settings.dailyReminderTime);
      setHoursChanged(false);
      setTimeChanged(false);
    }
  }, [loading, settings.longTimerHours, settings.dailyReminderTime]);

  const handleLongTimerToggle = async (value: boolean) => {
    if (value && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Notifications are disabled. Timer alerts will not be shown. Enable notifications in Settings to receive alerts.'
        );
        // Still allow toggle to be enabled so user can configure the hours
        // Notifications just won't work until permission is granted
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
          'Notifications are disabled. Reminders will not be shown. Enable notifications in Settings to receive reminders.'
        );
        // Still allow toggle to be enabled so user can configure the time
        // Notifications just won't work until permission is granted
      }
    }
    updateSettings({ dailyReminderEnabled: value });
  };

  const handleHoursChange = (text: string) => {
    setHoursInput(text);
    setHoursChanged(text !== settings.longTimerHours.toString());
  };

  const handleSaveHours = () => {
    const hours = parseInt(hoursInput, 10);
    if (!isNaN(hours) && hours > 0 && hours <= 24) {
      updateSettings({ longTimerHours: hours });
      setHoursChanged(false);
    } else {
      Alert.alert('Invalid Value', 'Please enter a number between 1 and 24');
    }
  };

  const handleTimeChange = (text: string) => {
    setTimeInput(text);
    setTimeChanged(text !== settings.dailyReminderTime);
  };

  const handleSaveTime = () => {
    // Validate HH:MM format
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeInput)) {
      updateSettings({ dailyReminderTime: timeInput });
      setTimeChanged(false);
    } else {
      Alert.alert('Invalid Format', 'Please enter time in HH:MM format (e.g., 09:00)');
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
          <DSRow gap="md" paddingVertical="sm" style={{ paddingLeft: spacing.lg, alignItems: 'center' }}>
            <DSText variant="bodySmall" style={{ flexShrink: 1 }}>Alert after (hours):</DSText>
            <DSTextInput
              value={hoursInput}
              onChangeText={handleHoursChange}
              keyboardType="number-pad"
              testID="long-timer-hours"
              containerStyle={{ width: 60, marginBottom: 0 }}
            />
            {hoursChanged && (
              <DSButton
                title="Save"
                variant="primary"
                size="sm"
                onPress={handleSaveHours}
                testID="save-long-timer-hours"
                fullWidth={false}
              />
            )}
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
          <DSRow gap="md" paddingVertical="sm" style={{ paddingLeft: spacing.lg, alignItems: 'center' }}>
            <DSText variant="bodySmall" style={{ flexShrink: 1 }}>Reminder time (HH:MM):</DSText>
            <DSTextInput
              value={timeInput}
              onChangeText={handleTimeChange}
              placeholder="09:00"
              testID="daily-reminder-time"
              containerStyle={{ width: 80, marginBottom: 0 }}
            />
            {timeChanged && (
              <DSButton
                title="Save"
                variant="primary"
                size="sm"
                onPress={handleSaveTime}
                testID="save-daily-reminder-time"
                fullWidth={false}
              />
            )}
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
        <DSSeparator spacing="sm" />
        <DSButton
          title="Delete Account"
          onPress={onDeleteAccount}
          variant="danger"
          fullWidth={false}
          testID="delete-account-button"
        />
      </DSSection>
    </DSScreen>
  );
}

