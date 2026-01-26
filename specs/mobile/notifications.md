# Push Notifications Spec

## Overview

Notify users about long-running timers and provide daily reminders to track time.

## Notification Types

### Timer Running Too Long
- Trigger: Timer running for > X hours (configurable)
- Title: "Timer still running"
- Body: "You've been tracking time for {duration}"
- Default threshold: 8 hours

### Daily Reminder
- Trigger: Configurable time daily (e.g., 9:00 AM)
- Title: "Time to track!"
- Body: "Don't forget to start your timer"
- Only fires if no timer running

## Settings Screen

### Screen Elements
| Element | testID | Description |
|---------|--------|-------------|
| Screen container | `settings-screen` | Main settings view |
| Notifications section | `notifications-section` | Notification settings |
| Long timer toggle | `long-timer-toggle` | Enable/disable long timer alerts |
| Long timer hours | `long-timer-hours` | Hours threshold input |
| Daily reminder toggle | `daily-reminder-toggle` | Enable/disable daily reminder |
| Daily reminder time | `daily-reminder-time` | Time picker for reminder |

### Settings Storage
Key: `@time_tracker/notification_settings`
```typescript
interface NotificationSettings {
  longTimerEnabled: boolean;
  longTimerHours: number;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // "HH:MM" format
}
```

## Implementation

### Permission Request
- Request on first toggle of any notification setting
- Show explanation alert before request
- Handle denial gracefully

### Scheduling
Using `expo-notifications`:
- Long timer: Schedule when timer starts, cancel when stops
- Daily reminder: Schedule recurring notification

### Hooks

#### useNotifications
```typescript
function useNotifications() {
  return {
    settings: NotificationSettings;
    hasPermission: boolean;
    requestPermission: () => Promise<boolean>;
    updateSettings: (settings: Partial<NotificationSettings>) => void;
    scheduleLongTimerAlert: (startedAt: Date) => void;
    cancelLongTimerAlert: () => void;
    scheduleDailyReminder: (time: string) => void;
    cancelDailyReminder: () => void;
  };
}
```

## User Flows

### Enable Long Timer Notification
1. User opens Settings tab
2. Toggles "Alert when timer runs long"
3. If first notification: request permission
4. If granted: enable setting
5. If denied: show settings link

### Timer Starts
1. Check if long timer notification enabled
2. If enabled: schedule notification for startedAt + threshold hours

### Timer Stops
1. Cancel any pending long timer notification

### Enable Daily Reminder
1. User toggles "Daily reminder"
2. Request permission if needed
3. Show time picker
4. Schedule daily notification at selected time

## Components Structure

```
src/screens/
  └── SettingsScreen.tsx

src/hooks/
  └── useNotifications.ts

src/lib/
  └── notifications.ts
```

## TabBar Update

- Add Settings tab (third position)
- Icon: gear/cog emoji
- Only show when logged in
