# Time Entry Description Spec

## Overview

Allow users to add and edit descriptions for time entries.

## Behavior

### When Timer Stopped
- Description input field visible but disabled/hidden
- Placeholder: "Add description..."

### When Timer Running
- Description input field visible and editable
- User can type/edit description at any time
- Description saved to current time entry on change (debounced)
- Changes persist across app restart

## UI Elements

| Element | testID | Description |
|---------|--------|-------------|
| Description input | `description-input` | TextInput for entry description |

## Component: DescriptionInput

### Props
```typescript
interface DescriptionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  placeholder?: string;
}
```

### Styling
- Appears below timer display
- Light gray border when editable
- Placeholder text in gray
- Multi-line support (max 3 lines visible)
- Auto-resize up to max height

## Data Model

### time_entries table
```sql
-- Add description column if not exists
ALTER TABLE time_entries ADD COLUMN description TEXT;
```

### Update Flow
1. User types in description field
2. Debounce changes (500ms)
3. Update time_entry with new description
4. Show subtle save indicator (optional)

## API

### Update Description
```sql
UPDATE time_entries SET description = ? WHERE id = ?
```

## User Flow

### Adding Description to Running Timer
1. Start timer
2. Tap description field
3. Type description
4. Description auto-saves after 500ms pause
5. Stop timer - description persists

### Editing Description
1. With running timer, tap existing description
2. Modify text
3. Changes auto-save

## Edge Cases

- Empty description: Save as null/empty string
- Network error on save: Retry silently, log error
- Very long description: No limit, scroll within input
- Special characters: Allow all unicode
