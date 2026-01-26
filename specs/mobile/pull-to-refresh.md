# Pull-to-Refresh Spec

## Overview

Allow users to refresh timer state and data by pulling down on the screen.

## Behavior

### Timer Screen
- User can pull down anywhere on the timer screen
- Spinner appears at top during refresh
- Releases to refresh current timer state from server
- Updates timer display if running timer exists

### Loading States
| State | Indicator |
|-------|-----------|
| Pulling | Pull indicator appears at top |
| Refreshing | Spinner visible, screen content grayed |
| Complete | Indicator disappears, content updated |

## Implementation

### UI Elements
| Element | testID | Description |
|---------|--------|-------------|
| Refresh indicator | `refresh-indicator` | Shows during pull-to-refresh |

### Technical Approach
- Wrap content in `ScrollView` with `RefreshControl`
- Use `refreshing` state to control spinner
- Call `fetchRunningTimer` on refresh
- `contentContainerStyle` with `flexGrow: 1` to maintain layout

## User Flow

1. User pulls down on timer screen
2. Refresh indicator appears
3. App fetches latest timer state from Supabase
4. If running timer found → update display
5. If no timer → show stopped state
6. Refresh indicator hides

## Edge Cases

- Refresh while timer running: Update elapsed time base
- Network error during refresh: Show error alert, hide spinner
- Multiple rapid pulls: Ignore if already refreshing
