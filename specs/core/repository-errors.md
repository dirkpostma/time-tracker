# Repository Error Handling Spec

## Overview

Repository implementations must handle errors from the underlying data store (Supabase) gracefully and provide meaningful error messages.

## Error Handling Pattern

The Supabase client returns errors in the response object rather than throwing:

```typescript
const { data, error } = await supabase.from('table').select();
```

Repositories must check for errors and throw `RepositoryError` with a user-friendly message.

## Scenarios

### Client Repository

| ID | Scenario | Expected |
|----|----------|----------|
| repo.client.create-error | Create client fails | Throw RepositoryError with "Failed to create client" |
| repo.client.find-by-id-error | findById query fails | Throw RepositoryError with "Failed to find client by ID" |
| repo.client.find-by-name-error | findByName query fails | Throw RepositoryError with "Failed to find client by name" |
| repo.client.find-all-error | findAll query fails | Throw RepositoryError with "Failed to list clients" |

### Project Repository

| ID | Scenario | Expected |
|----|----------|----------|
| repo.project.find-by-id-error | findById query fails | Throw RepositoryError with "Failed to find project" |
| repo.project.find-by-name-error | findByName query fails | Throw RepositoryError with "Failed to find project by name" |
| repo.project.find-by-client-error | findByClientId query fails | Throw RepositoryError with "Failed to find projects by client" |
| repo.project.find-all-error | findAll query fails | Throw RepositoryError with "Failed to list projects" |

### Task Repository

| ID | Scenario | Expected |
|----|----------|----------|
| repo.task.find-by-id-error | findById query fails | Throw RepositoryError with "Failed to find task" |
| repo.task.find-by-name-error | findByName query fails | Throw RepositoryError with "Failed to find task by name" |
| repo.task.find-by-project-error | findByProjectId query fails | Throw RepositoryError with "Failed to find tasks by project" |
| repo.task.find-all-error | findAll query fails | Throw RepositoryError with "Failed to find all tasks" |

### Config

| ID | Scenario | Expected |
|----|----------|----------|
| config.auth-tokens.parse-error | getAuthTokens encounters invalid JSON | Return null gracefully |

### Connection

| ID | Scenario | Expected |
|----|----------|----------|
| connection.no-config | No config available | Throw error with setup instructions |
