# Data Model Spec

Duplicate names allowed (e.g., same project name under different clients).

All entities have a `user_id` for ownership. See [Row Level Security](row-level-security.md).

## Client

| Field      | Type     | Notes                              |
|------------|----------|------------------------------------|
| id         | uuid     | PK                                 |
| user_id    | uuid     | FK to auth.users, default auth.uid() |
| name       | string   | required                           |
| created_at | datetime |                                    |
| updated_at | datetime |                                    |

## Project

| Field      | Type     | Notes                              |
|------------|----------|------------------------------------|
| id         | uuid     | PK                                 |
| user_id    | uuid     | FK to auth.users, default auth.uid() |
| client_id  | uuid     | FK to Client                       |
| name       | string   | required                           |
| created_at | datetime |                                    |
| updated_at | datetime |                                    |

## Task

| Field      | Type     | Notes                              |
|------------|----------|------------------------------------|
| id         | uuid     | PK                                 |
| user_id    | uuid     | FK to auth.users, default auth.uid() |
| project_id | uuid     | FK to Project                      |
| name       | string   | required                           |
| created_at | datetime |                                    |
| updated_at | datetime |                                    |

## TimeEntry

| Field       | Type     | Notes                              |
|-------------|----------|------------------------------------|
| id          | uuid     | PK                                 |
| user_id     | uuid     | FK to auth.users, default auth.uid() |
| client_id   | uuid     | FK to Client                       |
| project_id  | uuid     | FK to Project, optional            |
| task_id     | uuid     | FK to Task, optional               |
| description | string   | optional                           |
| started_at  | datetime | required                           |
| ended_at    | datetime | null if running                    |
| created_at  | datetime |                                    |
| updated_at  | datetime |                                    |
