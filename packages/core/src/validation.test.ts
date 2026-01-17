import { describe, it, expect } from 'vitest';
import {
  validateClientName,
  validateProjectName,
  validateTaskName,
  validateTimeEntryDescription,
  type ValidationResult,
} from './validation.js';

describe('validation', () => {
  describe('ValidationResult type', () => {
    it('should have valid boolean and optional error string', () => {
      const validResult: ValidationResult = { valid: true };
      const invalidResult: ValidationResult = { valid: false, error: 'Error message' };

      expect(validResult.valid).toBe(true);
      expect(validResult.error).toBeUndefined();
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toBe('Error message');
    });
  });

  describe('validateClientName', () => {
    it('should return valid for a normal client name', () => {
      const result = validateClientName('Acme Corp');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid for a single character name', () => {
      const result = validateClientName('A');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid for a name with special characters', () => {
      const result = validateClientName('O\'Brien & Associates');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid for a name with numbers', () => {
      const result = validateClientName('Company 123');
      expect(result).toEqual({ valid: true });
    });

    it('should return invalid for empty string', () => {
      const result = validateClientName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return invalid for whitespace only', () => {
      const result = validateClientName('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return invalid for name that is too long (over 255 characters)', () => {
      const longName = 'A'.repeat(256);
      const result = validateClientName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return valid for name at max length (255 characters)', () => {
      const maxName = 'A'.repeat(255);
      const result = validateClientName(maxName);
      expect(result).toEqual({ valid: true });
    });

    it('should trim leading/trailing whitespace and validate the trimmed value', () => {
      const result = validateClientName('  Valid Name  ');
      expect(result).toEqual({ valid: true });
    });
  });

  describe('validateProjectName', () => {
    it('should return valid for a normal project name', () => {
      const result = validateProjectName('Website Redesign');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid for a single character name', () => {
      const result = validateProjectName('P');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid for a name with special characters', () => {
      const result = validateProjectName('Project v2.0 (Beta)');
      expect(result).toEqual({ valid: true });
    });

    it('should return invalid for empty string', () => {
      const result = validateProjectName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return invalid for whitespace only', () => {
      const result = validateProjectName('\t\n');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return invalid for name that is too long (over 255 characters)', () => {
      const longName = 'P'.repeat(256);
      const result = validateProjectName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return valid for name at max length (255 characters)', () => {
      const maxName = 'P'.repeat(255);
      const result = validateProjectName(maxName);
      expect(result).toEqual({ valid: true });
    });
  });

  describe('validateTaskName', () => {
    it('should return valid for a normal task name', () => {
      const result = validateTaskName('Implement login page');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid for a single character name', () => {
      const result = validateTaskName('T');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid for a name with special characters', () => {
      const result = validateTaskName('Fix bug #123 - User can\'t login');
      expect(result).toEqual({ valid: true });
    });

    it('should return invalid for empty string', () => {
      const result = validateTaskName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return invalid for whitespace only', () => {
      const result = validateTaskName('   \t   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return invalid for name that is too long (over 255 characters)', () => {
      const longName = 'T'.repeat(256);
      const result = validateTaskName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return valid for name at max length (255 characters)', () => {
      const maxName = 'T'.repeat(255);
      const result = validateTaskName(maxName);
      expect(result).toEqual({ valid: true });
    });
  });

  describe('validateTimeEntryDescription', () => {
    it('should return valid for a normal description', () => {
      const result = validateTimeEntryDescription('Working on feature implementation');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid for an empty string (description is optional)', () => {
      const result = validateTimeEntryDescription('');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid for whitespace only (treated as empty)', () => {
      const result = validateTimeEntryDescription('   ');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid for a single character description', () => {
      const result = validateTimeEntryDescription('W');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid for a description with special characters', () => {
      const result = validateTimeEntryDescription('Meeting with John @ 3pm - discussed Q1 goals');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid for a multiline description', () => {
      const result = validateTimeEntryDescription('Line 1\nLine 2\nLine 3');
      expect(result).toEqual({ valid: true });
    });

    it('should return invalid for description that is too long (over 1000 characters)', () => {
      const longDescription = 'D'.repeat(1001);
      const result = validateTimeEntryDescription(longDescription);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return valid for description at max length (1000 characters)', () => {
      const maxDescription = 'D'.repeat(1000);
      const result = validateTimeEntryDescription(maxDescription);
      expect(result).toEqual({ valid: true });
    });
  });
});
