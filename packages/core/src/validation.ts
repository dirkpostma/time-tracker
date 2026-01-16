/**
 * Core validation functions for the time-tracker application.
 * These are pure functions with no side effects - no I/O, no console.log.
 * They return result objects instead of throwing exceptions.
 */

/**
 * Result of a validation operation.
 * If valid is true, the input passed validation.
 * If valid is false, error contains a human-readable error message.
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Maximum length for entity names (client, project, task) */
const MAX_NAME_LENGTH = 255;

/** Maximum length for time entry descriptions */
const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * Validates a client name.
 * @param name - The client name to validate
 * @returns ValidationResult indicating if the name is valid
 */
export function validateClientName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Client name cannot be empty' };
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Client name cannot exceed ${MAX_NAME_LENGTH} characters` };
  }

  return { valid: true };
}

/**
 * Validates a project name.
 * @param name - The project name to validate
 * @returns ValidationResult indicating if the name is valid
 */
export function validateProjectName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Project name cannot be empty' };
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Project name cannot exceed ${MAX_NAME_LENGTH} characters` };
  }

  return { valid: true };
}

/**
 * Validates a task name.
 * @param name - The task name to validate
 * @returns ValidationResult indicating if the name is valid
 */
export function validateTaskName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Task name cannot be empty' };
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Task name cannot exceed ${MAX_NAME_LENGTH} characters` };
  }

  return { valid: true };
}

/**
 * Validates a time entry description.
 * Unlike names, descriptions are optional so empty values are allowed.
 * @param description - The description to validate
 * @returns ValidationResult indicating if the description is valid
 */
export function validateTimeEntryDescription(description: string): ValidationResult {
  // Description is optional, so empty is valid
  if (description.trim().length === 0) {
    return { valid: true };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { valid: false, error: `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters` };
  }

  return { valid: true };
}
