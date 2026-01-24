import { useState, useEffect, useCallback } from 'react';
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  hasNotificationPermission,
  scheduleLongTimerNotification,
  cancelLongTimerNotification,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '../lib/notifications';

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    longTimerEnabled: false,
    longTimerHours: 8,
    dailyReminderEnabled: false,
    dailyReminderTime: '09:00',
  });
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const loaded = await getNotificationSettings();
      setSettings(loaded);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async () => {
    const permission = await hasNotificationPermission();
    setHasPermission(permission);
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
    return granted;
  }, []);

  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);

    // Handle side effects
    if ('dailyReminderEnabled' in updates || 'dailyReminderTime' in updates) {
      if (newSettings.dailyReminderEnabled) {
        await scheduleDailyReminder(newSettings.dailyReminderTime);
      } else {
        await cancelDailyReminder();
      }
    }
  }, [settings]);

  const scheduleTimerAlert = useCallback(async (startedAt: Date) => {
    if (settings.longTimerEnabled && hasPermission) {
      await scheduleLongTimerNotification(startedAt, settings.longTimerHours);
    }
  }, [settings.longTimerEnabled, settings.longTimerHours, hasPermission]);

  const cancelTimerAlert = useCallback(async () => {
    await cancelLongTimerNotification();
  }, []);

  return {
    settings,
    hasPermission,
    loading,
    requestPermission,
    updateSettings,
    scheduleTimerAlert,
    cancelTimerAlert,
  };
}
