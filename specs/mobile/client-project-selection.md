# Client/Project Selection Spec

## Overview

Allow users to select client, project, and optionally task before starting a timer.

## Data Model

### Entities
- **Client**: Top-level grouping (required for timer)
- **Project**: Belongs to a client (optional for timer)
- **Task**: Belongs to a project (optional for timer)

### Hierarchy
```
Client (required)
  └── Project (optional)
        └── Task (optional)
```

## UI Components

### Selection Display
| Element | testID | Description |
|---------|--------|-------------|
| Selection button | `selection-button` | Shows current selection, opens picker |
| Selected client | `selected-client` | Client name in selection |
| Selected project | `selected-project` | Project name in selection |
| Selected task | `selected-task` | Task name in selection |

### Client Picker Modal
| Element | testID | Description |
|---------|--------|-------------|
| Modal container | `client-picker-modal` | Bottom sheet modal |
| Client list | `client-list` | List of available clients |
| Client item | `client-item-{id}` | Individual client row |
| Close button | `client-picker-close` | Dismiss modal |
| Add button | `add-client-button` | Opens add client form |
| Add form | `add-client-form` | Form container |
| Name input | `new-client-name-input` | Text input for new client name |
| Submit button | `submit-new-client-button` | Creates new client (accessibilityLabel: "Add client") |

### Project Picker Modal
| Element | testID | Description |
|---------|--------|-------------|
| Modal container | `project-picker-modal` | Bottom sheet modal |
| Project list | `project-list` | List of projects for selected client |
| Project item | `project-item-{id}` | Individual project row |
| Skip button | `project-skip` | Skip project selection |
| Close button | `project-picker-close` | Dismiss modal |
| Add button | `add-project-button` | Opens add project form |
| Add form | `add-project-form` | Form container |
| Name input | `new-project-name-input` | Text input for new project name |
| Submit button | `submit-new-project-button` | Creates new project (accessibilityLabel: "Add project") |

### Task Picker Modal
| Element | testID | Description |
|---------|--------|-------------|
| Modal container | `task-picker-modal` | Bottom sheet modal |
| Task list | `task-list` | List of tasks for selected project |
| Task item | `task-item-{id}` | Individual task row |
| Skip button | `task-skip` | Skip task selection |
| Close button | `task-picker-close` | Dismiss modal |
| Add button | `add-task-button` | Opens add task form |
| Add form | `add-task-form` | Form container |
| Name input | `new-task-name-input` | Text input for new task name |
| Submit button | `submit-new-task-button` | Creates new task (accessibilityLabel: "Add task") |

## User Flow

### First Timer Start
1. User taps Start button
2. Client picker modal opens
3. User selects a client
4. Project picker modal opens (can skip)
5. User selects project or skips
6. If project selected, task picker opens (can skip)
7. Timer starts with selected entities

### Subsequent Timer Starts
1. User taps Start button
2. Timer starts with last used selection (smart default)
3. User can tap selection display to change

### Changing Selection While Stopped
1. Tap selection display area
2. Client picker opens
3. Select new client → clears project/task
4. Optionally select new project → clears task
5. Optionally select new task

## Smart Defaults (Recent Selection)

### Storage
- Use AsyncStorage to persist last selection
- Key: `@time_tracker/recent_selection`
- Value: `{ clientId, projectId?, taskId? }`

### Behavior
- On app start, load recent selection
- Display recent selection in selection area
- When starting timer, use recent selection if available
- Update stored selection when user makes new choice

## API Queries

### Fetch Clients
```sql
SELECT * FROM clients ORDER BY name
```

### Fetch Projects for Client
```sql
SELECT * FROM projects WHERE client_id = ? ORDER BY name
```

### Fetch Tasks for Project
```sql
SELECT * FROM tasks WHERE project_id = ? ORDER BY name
```

## Components Structure

```
src/components/
  ├── ClientPickerModal.tsx
  ├── ProjectPickerModal.tsx
  └── TaskPickerModal.tsx

src/hooks/
  └── useRecentSelection.ts

src/lib/
  └── storage.ts
```

## Edge Cases

- No clients exist: Show "No clients available" message
- No projects for client: Skip project picker, proceed to start
- No tasks for project: Skip task picker, proceed to start
- Offline: Use cached recent selection, show error if no cache
- Client deleted: Clear stored selection, prompt new selection
