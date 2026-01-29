# Signup Spec

## Overview

Account creation flow allowing new users to register with email and password via Supabase Auth.

## Flow

1. User on LoginScreen taps "Create Account" button
2. Navigate to SignupScreen
3. User enters email, password, and confirms password
4. On submit → Validate inputs → Call `supabase.auth.signUp()`
5. On success → Show confirmation alert → Navigate back to LoginScreen
6. User can then sign in with new credentials

## SignupScreen

### UI Elements

| Element | testID | Description |
|---------|--------|-------------|
| Title | - | "Create Account" |
| Subtitle | - | "Sign up to start tracking time" |
| Email input | `signup-email-input` | Email text field |
| Password input | `signup-password-input` | Secure password field |
| Confirm password | `signup-confirm-password-input` | Secure password confirmation |
| Sign Up button | `signup-button` | Submits registration |
| Back to Login | `back-to-login-from-signup` | Returns to LoginScreen |

### Input Behavior

| Input | Keyboard Type | Auto Capitalize | Return Key | Next Focus |
|-------|---------------|-----------------|------------|------------|
| Email | `email-address` | `none` | `next` | Password |
| Password | default | - | `next` | Confirm Password |
| Confirm Password | default | - | `done` | Submit form |

## Validation

### Client-Side Validation

Validation happens before API call, showing Alert on failure:

| Rule | Error Message |
|------|---------------|
| All fields required | "Please fill in all fields" |
| Password min 6 chars | "Password must be at least 6 characters" |
| Passwords must match | "Passwords do not match" |

### Server-Side Errors

Errors from Supabase Auth shown via Alert:

| Scenario | Typical Error |
|----------|---------------|
| Email already registered | "User already registered" |
| Invalid email format | "Invalid email" |
| Weak password | "Password should be at least 6 characters" |

## Success State

On successful registration:

1. Alert shown: "Account Created" / "Your account has been created. You can now sign in."
2. User taps "OK"
3. Navigate back to LoginScreen
4. User signs in with new credentials

## AuthContext Integration

### signUp Method

```typescript
signUp: (email: string, password: string) => Promise<void>
```

Calls `supabase.auth.signUp({ email, password })` and throws on error.

## Navigation

| From | Action | To |
|------|--------|-----|
| LoginScreen | Tap "Create Account" | SignupScreen |
| SignupScreen | Tap "Back to Login" | LoginScreen |
| SignupScreen | Successful signup + OK | LoginScreen |

## Accessibility

| Element | Label |
|---------|-------|
| Email input | "Email" |
| Password input | "Password" |
| Confirm Password input | "Confirm Password" |
| Sign Up button | "Sign Up" |
| Back to Login button | "Back to Login" |
