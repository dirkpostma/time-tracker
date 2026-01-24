import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

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
      <View style={styles.container} testID="settings-screen">
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper} testID="settings-screen">
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section} testID="notifications-section">
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Alert when timer runs long</Text>
            <Text style={styles.settingDescription}>
              Get notified if your timer runs for too long
            </Text>
          </View>
          <Switch
            value={settings.longTimerEnabled}
            onValueChange={handleLongTimerToggle}
            testID="long-timer-toggle"
          />
        </View>

        {settings.longTimerEnabled && (
          <View style={styles.subSetting}>
            <Text style={styles.subSettingLabel}>Alert after (hours):</Text>
            <TextInput
              style={styles.numberInput}
              value={hoursInput}
              onChangeText={handleHoursChange}
              keyboardType="number-pad"
              testID="long-timer-hours"
            />
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily reminder</Text>
            <Text style={styles.settingDescription}>
              Remind me to start tracking each day
            </Text>
          </View>
          <Switch
            value={settings.dailyReminderEnabled}
            onValueChange={handleDailyReminderToggle}
            testID="daily-reminder-toggle"
          />
        </View>

        {settings.dailyReminderEnabled && (
          <View style={styles.subSetting}>
            <Text style={styles.subSettingLabel}>Reminder time (HH:MM):</Text>
            <TextInput
              style={styles.timeInput}
              value={timeInput}
              onChangeText={handleTimeChange}
              placeholder="09:00"
              testID="daily-reminder-time"
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          testID="settings-logout-button"
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  subSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 16,
  },
  subSettingLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    width: 60,
    textAlign: 'center',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  logoutButton: {
    paddingVertical: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});
