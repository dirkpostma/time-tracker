# Account Deletion Spec

## Overview

Allow users to permanently delete their account and all associated data. Required by Apple App Store guidelines (section 5.1.1).

## Requirements

- Users must be able to delete their account from within the app
- All user data must be permanently deleted
- Deletion must be confirmed to prevent accidental deletion
- Process should complete immediately (no 30-day wait for in-app deletion)

## Data Deleted

When an account is deleted, all associated data is permanently removed:

| Data | Table | Cascade |
|------|-------|---------|
| Time entries | `time_entries` | ON DELETE CASCADE |
| Tasks | `tasks` | ON DELETE CASCADE |
| Projects | `projects` | ON DELETE CASCADE |
| Clients | `clients` | ON DELETE CASCADE |
| User account | `auth.users` | Primary deletion |

## User Flow

1. User navigates to Settings tab
2. User taps "Delete Account"
3. Confirmation screen appears with warning
4. User enters password to confirm
5. User taps "Delete My Account"
6. Account and all data deleted
7. User signed out and returned to Login screen
8. Success message displayed

## Settings Screen Update

Add delete account option to existing Settings screen.

| Element | testID | Description |
|---------|--------|-------------|
| Delete account button | `delete-account-button` | Opens deletion flow |

### Button Styling
- Red/destructive color
- Located at bottom of settings list
- Clear "Delete Account" label

## Delete Account Screen

New screen for confirming account deletion.

| Element | testID | Description |
|---------|--------|-------------|
| Screen container | `delete-account-screen` | Main container |
| Warning text | `delete-warning-text` | Explains consequences |
| Password input | `delete-password-input` | Confirms user identity |
| Cancel button | `delete-cancel-button` | Returns to Settings |
| Confirm button | `delete-confirm-button` | Initiates deletion |
| Loading indicator | `delete-loading` | Shown during deletion |

### Warning Text Content

```
This will permanently delete your account and all your data, including:

• All time entries
• All clients, projects, and tasks
• Your account settings

This action cannot be undone.
```

## Validation

### Client-side
| Rule | Error |
|------|-------|
| Password required | "Password is required" |

### Server-side
| Rule | Error |
|------|-------|
| Invalid password | "Incorrect password" |
| Deletion failed | "Failed to delete account. Please try again." |

## Implementation

### AuthContext Update

Add delete account method to existing AuthContext.

```typescript
interface AuthContextValue {
  // ... existing properties
  deleteAccount: (password: string) => Promise<void>;
}
```

### Delete Flow

```typescript
async function deleteAccount(password: string): Promise<void> {
  // 1. Verify password by re-authenticating
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (authError) {
    throw new Error('Incorrect password');
  }

  // 2. Delete user data (cascade handles related records)
  const { error: deleteError } = await supabase.rpc('delete_user_account');

  if (deleteError) {
    throw new Error('Failed to delete account. Please try again.');
  }

  // 3. Sign out (clears local tokens)
  await signOut();
}
```

### Database Function

```sql
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all user data (RLS ensures only own data)
  DELETE FROM clients WHERE user_id = auth.uid();

  -- Delete the auth user
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
```

## Navigation

| From | Action | To |
|------|--------|-----|
| Settings | Tap "Delete Account" | DeleteAccountScreen |
| DeleteAccountScreen | Tap "Cancel" | Settings |
| DeleteAccountScreen | Successful deletion | LoginScreen |

## Test Scenarios

| ID | Scenario | Expected |
|----|----------|----------|
| account.delete.cancel | User taps Cancel | Returns to Settings, no data deleted |
| account.delete.empty_password | User taps Confirm without password | Shows "Password is required" error |
| account.delete.wrong_password | User enters wrong password | Shows "Incorrect password" error |
| account.delete.success | User confirms with correct password | Account deleted, redirected to Login |
| account.delete.data_removed | After deletion, check database | All user data removed |

## Components Structure

```
src/screens/
  └── DeleteAccountScreen.tsx

src/contexts/
  └── AuthContext.tsx  (update existing)
```

## Local Storage Cleanup

On account deletion, clear all local data:

| Storage | Key | Action |
|---------|-----|--------|
| SecureStore | `supabase.auth.token` | Delete |
| AsyncStorage | `@time_tracker/notification_settings` | Delete |
| AsyncStorage | `@time_tracker/last_selection` | Delete |

## Accessibility

- Warning text uses appropriate semantic heading
- Destructive actions clearly labeled
- Password field supports password managers
- Confirm button disabled during loading

## Deployment

### 1. Database Migration

Create and deploy the database function:

```bash
# Create migration file
npx supabase migration new add_delete_user_account_function

# Add SQL to the migration file (see Database Function section above)

# Test locally
npx supabase db reset

# Link to production (if not already linked)
npx supabase link --project-ref <your-project-ref>

# Push to production
npx supabase db push
```

### 2. Mobile App

Build and submit via EAS:

```bash
cd packages/mobile

# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### 3. Deployment Checklist

| Step | Command/Action | Verified |
|------|----------------|----------|
| Migration created | `npx supabase migration new ...` | ☐ |
| Local tests pass | `npm test -- --run` | ☐ |
| Maestro E2E tests pass | `maestro test ...` | ☐ |
| Migration pushed to prod | `npx supabase db push` | ☐ |
| iOS build created | `eas build --platform ios` | ☐ |
| App submitted | `eas submit --platform ios` | ☐ |
