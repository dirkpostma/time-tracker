import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadRecent, saveRecent, getRecentPath } from './recent.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('recent', () => {
  const testRecentPath = path.join(os.tmpdir(), `.tt-recent-test-${Date.now()}.json`);

  beforeEach(() => {
    // Clean up before each test
    if (fs.existsSync(testRecentPath)) {
      fs.unlinkSync(testRecentPath);
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(testRecentPath)) {
      fs.unlinkSync(testRecentPath);
    }
  });

  describe('getRecentPath', () => {
    it('returns path in home directory', () => {
      const recentPath = getRecentPath();
      expect(recentPath).toContain('.tt-recent.json');
      expect(recentPath).toContain(os.homedir());
    });
  });

  describe('loadRecent', () => {
    it('returns empty object when recent file does not exist', () => {
      const result = loadRecent(testRecentPath);
      expect(result).toEqual({});
    });

    it('returns saved data when recent file exists', () => {
      const data = { clientId: 'client-123', projectId: 'project-456' };
      fs.writeFileSync(testRecentPath, JSON.stringify(data));

      const result = loadRecent(testRecentPath);
      expect(result).toEqual(data);
    });

    it('returns empty object when recent file is invalid JSON', () => {
      fs.writeFileSync(testRecentPath, 'not valid json');

      const result = loadRecent(testRecentPath);
      expect(result).toEqual({});
    });
  });

  describe('saveRecent', () => {
    it('saves data to recent file', () => {
      const data = { clientId: 'client-123', projectId: 'project-456' };

      saveRecent(data, testRecentPath);

      const savedContent = fs.readFileSync(testRecentPath, 'utf-8');
      expect(JSON.parse(savedContent)).toEqual(data);
    });

    it('overwrites existing recent file', () => {
      const initialData = { clientId: 'old-client' };
      const newData = { clientId: 'new-client', projectId: 'new-project' };

      saveRecent(initialData, testRecentPath);
      saveRecent(newData, testRecentPath);

      const savedContent = fs.readFileSync(testRecentPath, 'utf-8');
      expect(JSON.parse(savedContent)).toEqual(newData);
    });
  });
});
