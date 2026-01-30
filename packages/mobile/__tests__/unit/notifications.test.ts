/**
 * Unit tests for notification utility functions
 * Tests scheduling logic and time calculations
 */

// Mocks are configured via jest.config.js moduleNameMapper
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  hasNotificationPermission,
  scheduleLongTimerNotification,
  cancelLongTimerNotification,
  scheduleDailyReminder,
  cancelDailyReminder,
  NotificationSettings,
} from '../../src/lib/notifications';

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Notification Settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotificationSettings', () => {
    it('returns default settings when no stored value', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const settings = await getNotificationSettings();

      expect(settings).toEqual({
        longTimerEnabled: false,
        longTimerHours: 8,
        dailyReminderEnabled: false,
        dailyReminderTime: '09:00',
      });
    });

    it('returns stored settings merged with defaults', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ longTimerEnabled: true, longTimerHours: 4 })
      );

      const settings = await getNotificationSettings();

      expect(settings).toEqual({
        longTimerEnabled: true,
        longTimerHours: 4,
        dailyReminderEnabled: false,
        dailyReminderTime: '09:00',
      });
    });

    it('returns defaults on storage error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const settings = await getNotificationSettings();

      expect(settings).toEqual({
        longTimerEnabled: false,
        longTimerHours: 8,
        dailyReminderEnabled: false,
        dailyReminderTime: '09:00',
      });
    });
  });

  describe('saveNotificationSettings', () => {
    it('saves settings to AsyncStorage', async () => {
      const settings: NotificationSettings = {
        longTimerEnabled: true,
        longTimerHours: 6,
        dailyReminderEnabled: true,
        dailyReminderTime: '08:30',
      };

      await saveNotificationSettings(settings);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@time_tracker/notification_settings',
        JSON.stringify(settings)
      );
    });

    it('handles storage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const settings: NotificationSettings = {
        longTimerEnabled: true,
        longTimerHours: 6,
        dailyReminderEnabled: false,
        dailyReminderTime: '09:00',
      };

      // Should not throw
      await expect(saveNotificationSettings(settings)).resolves.toBeUndefined();
    });
  });
});

describe('Notification Permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestNotificationPermission', () => {
    it('returns true if already granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted' as any,
        expires: 'never',
        granted: true,
        canAskAgain: true,
      });

      const result = await requestNotificationPermission();

      expect(result).toBe(true);
      expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests permission if not granted and returns result', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'undetermined' as any,
        expires: 'never',
        granted: false,
        canAskAgain: true,
      });
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted' as any,
        expires: 'never',
        granted: true,
        canAskAgain: true,
      });

      const result = await requestNotificationPermission();

      expect(result).toBe(true);
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('returns false if permission denied', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'undetermined' as any,
        expires: 'never',
        granted: false,
        canAskAgain: true,
      });
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'denied' as any,
        expires: 'never',
        granted: false,
        canAskAgain: false,
      });

      const result = await requestNotificationPermission();

      expect(result).toBe(false);
    });
  });

  describe('hasNotificationPermission', () => {
    it('returns true when permission granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted' as any,
        expires: 'never',
        granted: true,
        canAskAgain: true,
      });

      const result = await hasNotificationPermission();

      expect(result).toBe(true);
    });

    it('returns false when permission not granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'denied' as any,
        expires: 'never',
        granted: false,
        canAskAgain: false,
      });

      const result = await hasNotificationPermission();

      expect(result).toBe(false);
    });
  });
});

describe('Long Timer Notification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-30T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('scheduleLongTimerNotification', () => {
    it('schedules notification for future time', async () => {
      const startedAt = new Date('2026-01-30T10:00:00Z');
      const hours = 8;

      await scheduleLongTimerNotification(startedAt, hours);

      expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'long-timer-alert'
      );
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        identifier: 'long-timer-alert',
        content: {
          title: 'Timer still running',
          body: "You've been tracking time for 8 hours",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date('2026-01-30T18:00:00Z'),
        },
      });
    });

    it('does not schedule if trigger time is in the past', async () => {
      // Timer started 10 hours ago
      const startedAt = new Date('2026-01-30T00:00:00Z');
      const hours = 8; // Would trigger at 08:00, but it's now 10:00

      await scheduleLongTimerNotification(startedAt, hours);

      expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalled();
      expect(mockNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('calculates correct trigger time for different hour values', async () => {
      const startedAt = new Date('2026-01-30T10:00:00Z');

      await scheduleLongTimerNotification(startedAt, 2);

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({
            date: new Date('2026-01-30T12:00:00Z'),
          }),
        })
      );
    });
  });

  describe('cancelLongTimerNotification', () => {
    it('cancels the long timer notification', async () => {
      await cancelLongTimerNotification();

      expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'long-timer-alert'
      );
    });
  });
});

describe('Daily Reminder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scheduleDailyReminder', () => {
    it('schedules daily reminder with correct time', async () => {
      await scheduleDailyReminder('09:00');

      expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'daily-reminder'
      );
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        identifier: 'daily-reminder',
        content: {
          title: 'Time to track!',
          body: "Don't forget to start your timer",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });
    });

    it('parses different time formats correctly', async () => {
      await scheduleDailyReminder('14:30');

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({
            hour: 14,
            minute: 30,
          }),
        })
      );
    });

    it('handles midnight correctly', async () => {
      await scheduleDailyReminder('00:00');

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({
            hour: 0,
            minute: 0,
          }),
        })
      );
    });
  });

  describe('cancelDailyReminder', () => {
    it('cancels the daily reminder notification', async () => {
      await cancelDailyReminder();

      expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'daily-reminder'
      );
    });
  });
});
