# Next High-Value Mobile Features

Prioritized features for mobile app development. Build these when asked to "add features" or "build next features".

## Priority 1: Essential Functionality

### 1. Client/Project Selection for Timer
**Current**: Timer uses first available client or creates "Default Client"
**Needed**: Let user select client/project before starting timer

- Add client picker screen/modal
- Add project picker (filtered by selected client)
- Optional task picker (filtered by selected project)
- Remember last selection (smart defaults like CLI)

### 2. Timer History / Recent Entries
**Current**: No way to view past time entries
**Needed**: Show recent time entries with duration and details

- List view of recent entries (today, this week)
- Show: client, project, task, duration, description
- Tap to view details
- Group by day with daily totals

### 3. Edit Time Entry Description
**Current**: No way to add description to timer
**Needed**: Add/edit description for running or past entries

- Optional description field when starting timer
- Edit description while timer running
- Edit description on past entries

## Priority 2: User Experience

### 4. Pull-to-Refresh
**Current**: Data only loads on mount
**Needed**: Pull down to refresh timer state and entries

### 5. Offline Support
**Current**: Requires network connection
**Needed**: Work offline, sync when connected

- Cache current timer state locally
- Queue start/stop actions when offline
- Sync when connection restored
- Show offline indicator

### 6. Push Notifications
**Current**: No reminders
**Needed**: Remind user if timer running too long or forgot to start

- "Timer still running" after X hours
- Daily reminder to start tracking
- Configurable notification settings

## Priority 3: Data Management

### 7. Create Client/Project/Task
**Current**: Can only use existing entities or auto-create default
**Needed**: Full CRUD for clients, projects, tasks

- Add new client from mobile
- Add new project under client
- Add new task under project
- Edit/rename entities

### 8. Reports / Summary View
**Current**: No reporting
**Needed**: View time summaries and reports

- Daily/weekly/monthly totals
- By client breakdown
- By project breakdown
- Export capability (CSV/PDF)

### 9. Manual Time Entry
**Current**: Only real-time tracking
**Needed**: Add entries for past work

- Pick date/time range
- Select client/project/task
- Add description
- Useful for forgotten entries

## Priority 4: Polish

### 10. Dark Mode
**Current**: Light theme only
**Needed**: System-aware dark mode support

### 11. Haptic Feedback
**Current**: No tactile feedback
**Needed**: Haptics on start/stop for confirmation

### 12. Widget (iOS)
**Current**: Must open app to see timer
**Needed**: Home screen widget showing current timer

- Shows running/stopped state
- Shows elapsed time
- Quick start/stop from widget

## Implementation Notes

Each feature should include:
1. Spec update in `specs/mobile/`
2. Maestro E2E test in `.maestro/`
3. Unit tests where applicable

## Quick Wins (< 1 hour each)

- Pull-to-refresh
- Haptic feedback
- Dark mode (if using system components)
- Edit description on running timer

## Medium Effort (1-4 hours each)

- Client/project selection
- Recent entries list
- Manual time entry form

## Larger Effort (4+ hours each)

- Offline support with sync
- Push notifications
- iOS widget
- Full reports view
