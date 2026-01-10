# Data Model Spec

Duplicate names allowed (e.g., same project name under different clients).

## Client

| Field      | Type     | Notes    |
|------------|----------|----------|
| id         | uuid     | PK       |
| name       | string   | required |
| created_at | datetime |          |
| updated_at | datetime |          |

## Project

| Field      | Type     | Notes        |
|------------|----------|--------------|
| id         | uuid     | PK           |
| client_id  | uuid     | FK to Client |
| name       | string   | required     |
| created_at | datetime |              |
| updated_at | datetime |              |

## Task

| Field      | Type     | Notes         |
|------------|----------|---------------|
| id         | uuid     | PK            |
| project_id | uuid     | FK to Project |
| name       | string   | required      |
| created_at | datetime |               |
| updated_at | datetime |               |

## TimeEntry

| Field       | Type     | Notes                   |
|-------------|----------|-------------------------|
| id          | uuid     | PK                      |
| client_id   | uuid     | FK to Client            |
| project_id  | uuid     | FK to Project, optional |
| task_id     | uuid     | FK to Task, optional    |
| description | string   | optional                |
| started_at  | datetime | required                |
| ended_at    | datetime | null if running         |
| created_at  | datetime |                         |
| updated_at  | datetime |                         |
