/**
 * @deprecated This module is deprecated. Import from '../cli/commands/config.js' instead.
 * This file re-exports from the new location for backward compatibility.
 */
export {
  validateCredentials,
  showConfig,
  configCommand,
  ensureConfig,
} from '../cli/commands/config.js';
export type { ValidationResult } from '../cli/commands/config.js';
