# Time Tracking Flow Spec

## Constraints

- Only one timer can run at a time

## Starting a Timer

1. If a timer is already running, error and tell user to stop it first
2. If client doesn't exist, prompt to create it
3. If project is provided and doesn't exist, prompt to create it
4. If task is provided and doesn't exist, prompt to create it
5. Create a new TimeEntry with `started_at` set to now, `ended_at` null
6. Optionally set description

## Stopping a Timer

1. Find the running TimeEntry (where `ended_at` is null)
2. If no timer is running, notify the user
3. If description provided and one already exists, warn user (overwrite? y/n)
4. Set `ended_at` to now

## Checking Status

- Show the currently running timer (client, project if present, task if present, duration so far)
- If no timer running, say so
