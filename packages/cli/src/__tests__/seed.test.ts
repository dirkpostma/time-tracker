import { describe, it, expect } from 'vitest';
import { isLocalDatabase, looksLikeProduction } from '../seed';

describe('isLocalDatabase', () => {
  describe('returns true for local URLs', () => {
    it('localhost', () => {
      expect(isLocalDatabase('http://localhost:54321')).toBe(true);
      expect(isLocalDatabase('https://localhost:54321')).toBe(true);
      expect(isLocalDatabase('http://localhost')).toBe(true);
    });

    it('127.0.0.1', () => {
      expect(isLocalDatabase('http://127.0.0.1:54321')).toBe(true);
      expect(isLocalDatabase('https://127.0.0.1:54321')).toBe(true);
      expect(isLocalDatabase('http://127.0.0.1')).toBe(true);
    });

    it('192.168.x.x private network', () => {
      expect(isLocalDatabase('http://192.168.1.1:54321')).toBe(true);
      expect(isLocalDatabase('http://192.168.0.100')).toBe(true);
      expect(isLocalDatabase('http://192.168.255.255:8080')).toBe(true);
    });

    it('10.x.x.x private network', () => {
      expect(isLocalDatabase('http://10.0.0.1:54321')).toBe(true);
      expect(isLocalDatabase('http://10.1.2.3')).toBe(true);
      expect(isLocalDatabase('http://10.255.255.255:8080')).toBe(true);
    });

    it('.local domains', () => {
      expect(isLocalDatabase('http://mypc.local:54321')).toBe(true);
      expect(isLocalDatabase('http://supabase.local')).toBe(true);
      expect(isLocalDatabase('http://dev-server.local:3000')).toBe(true);
    });

    it('host.docker.internal', () => {
      expect(isLocalDatabase('http://host.docker.internal:54321')).toBe(true);
      expect(isLocalDatabase('https://host.docker.internal:54321')).toBe(true);
    });
  });

  describe('returns false for remote URLs', () => {
    it('supabase.co domains', () => {
      expect(isLocalDatabase('https://abcdefghij.supabase.co')).toBe(false);
      expect(isLocalDatabase('https://myproject.supabase.co')).toBe(false);
    });

    it('custom domains', () => {
      expect(isLocalDatabase('https://api.mycompany.com')).toBe(false);
      expect(isLocalDatabase('https://db.example.org:5432')).toBe(false);
    });

    it('production-like URLs', () => {
      expect(isLocalDatabase('https://prod-db.mycompany.com')).toBe(false);
      expect(isLocalDatabase('https://production.supabase.co')).toBe(false);
    });
  });

  describe('handles edge cases', () => {
    it('is case insensitive for hostname', () => {
      expect(isLocalDatabase('http://LOCALHOST:54321')).toBe(true);
      expect(isLocalDatabase('http://LocalHost:54321')).toBe(true);
      expect(isLocalDatabase('http://HOST.DOCKER.INTERNAL:54321')).toBe(true);
    });

    it('returns false for invalid URLs', () => {
      expect(isLocalDatabase('not-a-url')).toBe(false);
      expect(isLocalDatabase('')).toBe(false);
      expect(isLocalDatabase('localhost')).toBe(false); // missing protocol
    });

    it('does not match partial hostnames', () => {
      // "localhost" embedded in domain should not match
      expect(isLocalDatabase('https://notlocalhost.com')).toBe(false);
      // "10." at start of domain (not IP) should not match
      expect(isLocalDatabase('https://10domain.com')).toBe(false);
    });
  });
});

describe('looksLikeProduction', () => {
  describe('returns true for production-like URLs', () => {
    it('contains "prod"', () => {
      expect(looksLikeProduction('https://prod.mycompany.com')).toBe(true);
      expect(looksLikeProduction('https://api-prod.example.com')).toBe(true);
      expect(looksLikeProduction('https://myproject-prod.supabase.co')).toBe(true);
    });

    it('contains "production"', () => {
      expect(looksLikeProduction('https://production.mycompany.com')).toBe(true);
      expect(looksLikeProduction('https://api-production.example.com')).toBe(true);
      expect(looksLikeProduction('https://production-db.supabase.co')).toBe(true);
    });

    it('is case insensitive', () => {
      expect(looksLikeProduction('https://PROD.mycompany.com')).toBe(true);
      expect(looksLikeProduction('https://Prod.mycompany.com')).toBe(true);
      expect(looksLikeProduction('https://PRODUCTION.mycompany.com')).toBe(true);
      expect(looksLikeProduction('https://Production.mycompany.com')).toBe(true);
    });

    it('matches anywhere in URL', () => {
      expect(looksLikeProduction('https://mycompany.com/prod/api')).toBe(true);
      expect(looksLikeProduction('https://mycompany.com?env=production')).toBe(true);
    });
  });

  describe('returns false for non-production URLs', () => {
    it('local URLs', () => {
      expect(looksLikeProduction('http://localhost:54321')).toBe(false);
      expect(looksLikeProduction('http://127.0.0.1:54321')).toBe(false);
    });

    it('staging/development URLs', () => {
      expect(looksLikeProduction('https://staging.mycompany.com')).toBe(false);
      expect(looksLikeProduction('https://dev.mycompany.com')).toBe(false);
      expect(looksLikeProduction('https://test.mycompany.com')).toBe(false);
    });

    it('generic supabase URLs', () => {
      expect(looksLikeProduction('https://abcdefghij.supabase.co')).toBe(false);
    });
  });
});
