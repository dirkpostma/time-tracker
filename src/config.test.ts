import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadLastUsed, saveLastUsed, getConfigPath } from './config.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('config', () => {
  const testConfigPath = path.join(os.tmpdir(), `.tt-config-test-${Date.now()}.json`);

  beforeEach(() => {
    // Clean up before each test
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  describe('getConfigPath', () => {
    it('returns path in home directory', () => {
      const configPath = getConfigPath();
      expect(configPath).toContain('.tt-config.json');
      expect(configPath).toContain(os.homedir());
    });
  });

  describe('loadLastUsed', () => {
    it('returns empty object when config file does not exist', () => {
      const result = loadLastUsed(testConfigPath);
      expect(result).toEqual({});
    });

    it('returns saved data when config file exists', () => {
      const data = { clientId: 'client-123', projectId: 'project-456' };
      fs.writeFileSync(testConfigPath, JSON.stringify(data));

      const result = loadLastUsed(testConfigPath);
      expect(result).toEqual(data);
    });

    it('returns empty object when config file is invalid JSON', () => {
      fs.writeFileSync(testConfigPath, 'not valid json');

      const result = loadLastUsed(testConfigPath);
      expect(result).toEqual({});
    });
  });

  describe('saveLastUsed', () => {
    it('saves data to config file', () => {
      const data = { clientId: 'client-123', projectId: 'project-456' };

      saveLastUsed(data, testConfigPath);

      const savedContent = fs.readFileSync(testConfigPath, 'utf-8');
      expect(JSON.parse(savedContent)).toEqual(data);
    });

    it('overwrites existing config file', () => {
      const initialData = { clientId: 'old-client' };
      const newData = { clientId: 'new-client', projectId: 'new-project' };

      saveLastUsed(initialData, testConfigPath);
      saveLastUsed(newData, testConfigPath);

      const savedContent = fs.readFileSync(testConfigPath, 'utf-8');
      expect(JSON.parse(savedContent)).toEqual(newData);
    });
  });
});
