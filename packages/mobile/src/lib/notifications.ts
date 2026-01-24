import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@time_tracker/notification_settings';
const LONG_TIMER_NOTIFICATION_ID = 'long-timer-alert';
const DAILY_REMINDER_NOTIFICATION_ID = 'daily-reminder';

export interface NotificationSettings {
  longTimerEnabled: boolean;
  longTimerHours: number;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  longTimerEnabled: false,
  longTimerHours: 8,
  dailyReminderEnabled: false,
  dailyReminderTime: '09:00',
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const value = await AsyncStorage.getItem(SETTINGS_KEY);
    if (value) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(value) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

export async function scheduleLongTimerNotification(startedAt: Date, hours: number): Promise<void> {
  await cancelLongTimerNotification();

  const triggerDate = new Date(startedAt.getTime() + hours * 60 * 60 * 1000);

  // Don't schedule if already past trigger time
  if (triggerDate <= new Date()) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: LONG_TIMER_NOTIFICATION_ID,
    content: {
      title: 'Timer still running',
      body: `You've been tracking time for ${hours} hours`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function cancelLongTimerNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(LONG_TIMER_NOTIFICATION_ID);
}

export async function scheduleDailyReminder(timeString: string): Promise<void> {
  await cancelDailyReminder();

  const [hours, minutes] = timeString.split(':').map(Number);

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_NOTIFICATION_ID,
    content: {
      title: 'Time to track!',
      body: "Don't forget to start your timer",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_NOTIFICATION_ID);
}
