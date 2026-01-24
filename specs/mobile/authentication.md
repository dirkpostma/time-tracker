# Mobile Authentication Spec

## Overview

Authentication uses Supabase Auth with secure token storage via `expo-secure-store`.

## Auth Flow

1. App launches → Check for existing session
2. If no session → Show LoginScreen
3. User enters email/password → Call `supabase.auth.signInWithPassword()`
4. On success → Tokens stored in SecureStore → Navigate to TimerScreen
5. On logout → Clear session → Return to LoginScreen

## Components

### AuthContext

Provides auth state to entire app.

| Export        | Type                                      | Description                |
|---------------|-------------------------------------------|----------------------------|
| `AuthProvider`| Component                                 | Wrap app to provide auth   |
| `useAuth()`   | Hook                                      | Access auth state/methods  |

### useAuth() Return Value

| Property  | Type                                    | Description              |
|-----------|-----------------------------------------|--------------------------|
| `user`    | `User \| null`                          | Current user or null     |
| `session` | `Session \| null`                       | Current session or null  |
| `loading` | `boolean`                               | True during init         |
| `signIn`  | `(email, password) => Promise<void>`    | Login method             |
| `signOut` | `() => Promise<void>`                   | Logout method            |

## LoginScreen

| Element         | testID          | Description                |
|-----------------|-----------------|----------------------------|
| Email input     | `email-input`   | Email text field           |
| Password input  | `password-input`| Secure password field      |
| Login button    | `login-button`  | Submits credentials        |

### Validation

- Both fields required
- Shows Alert on empty fields
- Shows Alert with error message on auth failure

## Token Storage

Tokens stored securely using `expo-secure-store`:

| Key                              | Content          |
|----------------------------------|------------------|
| `supabase.auth.token`            | Session JSON     |

## Test User (Local Dev)

| Field    | Value            |
|----------|------------------|
| Email    | test@example.com |
| Password | Test1234         |
