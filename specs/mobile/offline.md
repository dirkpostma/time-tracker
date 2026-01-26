# Offline Support Spec

## Overview

Allow users to start/stop timers while offline. Actions are queued and synced when connection is restored.

## Components

### OfflineIndicator
| Element | testID | Description |
|---------|--------|-------------|
| Indicator bar | `offline-indicator` | Shows when offline |
| Syncing indicator | `sync-indicator` | Shows during sync |

### States
| State | Display |
|-------|---------|
| Online | No indicator shown |
| Offline | Red bar: "No connection" |
| Syncing | Blue bar: "Syncing..." |

## Architecture

### OfflineContext
Provides:
- `isOnline`: Current network status
- `isSyncing`: Whether sync is in progress
- `pendingActions`: Count of queued actions
- `queueAction`: Add action to offline queue
- `syncNow`: Force sync attempt

### Offline Queue
Queue structure:
```typescript
interface QueuedAction {
  id: string;
  type: 'start_timer' | 'stop_timer' | 'update_description';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
}
```

### Storage Keys
- `@time_tracker/offline_queue` - Pending actions
- `@time_tracker/cached_timer` - Current timer state

## Flows

### Start Timer (Offline)
1. Create local timer state
2. Queue 'start_timer' action
3. Show timer running with cached start time
4. When online: sync action, update with server response

### Stop Timer (Offline)
1. Update local timer state (stopped)
2. Queue 'stop_timer' action
3. When online: sync action

### Update Description (Offline)
1. Update local description
2. Queue 'update_description' action
3. When online: sync action

### Sync Process
1. Detect connection restored
2. Process queue in order (FIFO)
3. For each action:
   - Attempt API call
   - On success: remove from queue
   - On failure: increment retry, keep in queue
4. Update local state with server data
5. Clear cached timer if no running timer

## Network Detection

Using `@react-native-community/netinfo`:
```typescript
NetInfo.addEventListener(state => {
  setIsOnline(state.isConnected && state.isInternetReachable);
});
```

## Error Handling

### Sync Failures
- Retry up to 3 times with exponential backoff
- After 3 failures: keep in queue, show error
- User can force retry via pull-to-refresh

### Conflict Resolution
- Server wins for stop_timer conflicts
- Latest description wins

## Components Structure

```
src/contexts/
  └── OfflineContext.tsx

src/hooks/
  └── useNetworkStatus.ts

src/lib/
  ├── offlineQueue.ts
  └── offlineStorage.ts

src/components/
  └── OfflineIndicator.tsx
```
