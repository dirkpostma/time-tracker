/**
 * Unit tests for formatTime function from useTimer hook
 * Tests the time formatting logic: seconds -> HH:MM:SS
 */

// Extract the pure function logic for testing
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

describe('formatTime', () => {
  describe('zero and small values', () => {
    it('formats 0 seconds as 00:00:00', () => {
      expect(formatTime(0)).toBe('00:00:00');
    });

    it('formats 1 second as 00:00:01', () => {
      expect(formatTime(1)).toBe('00:00:01');
    });

    it('formats 59 seconds as 00:00:59', () => {
      expect(formatTime(59)).toBe('00:00:59');
    });
  });

  describe('minutes', () => {
    it('formats 60 seconds as 00:01:00', () => {
      expect(formatTime(60)).toBe('00:01:00');
    });

    it('formats 61 seconds as 00:01:01', () => {
      expect(formatTime(61)).toBe('00:01:01');
    });

    it('formats 599 seconds as 00:09:59', () => {
      expect(formatTime(599)).toBe('00:09:59');
    });

    it('formats 3599 seconds as 00:59:59', () => {
      expect(formatTime(3599)).toBe('00:59:59');
    });
  });

  describe('hours', () => {
    it('formats 3600 seconds as 01:00:00', () => {
      expect(formatTime(3600)).toBe('01:00:00');
    });

    it('formats 3661 seconds as 01:01:01', () => {
      expect(formatTime(3661)).toBe('01:01:01');
    });

    it('formats 7200 seconds as 02:00:00', () => {
      expect(formatTime(7200)).toBe('02:00:00');
    });

    it('formats 36000 seconds (10 hours) as 10:00:00', () => {
      expect(formatTime(36000)).toBe('10:00:00');
    });
  });

  describe('large values', () => {
    it('formats 86399 seconds (23:59:59) correctly', () => {
      expect(formatTime(86399)).toBe('23:59:59');
    });

    it('formats 86400 seconds (24 hours) as 24:00:00', () => {
      expect(formatTime(86400)).toBe('24:00:00');
    });

    it('formats values over 24 hours correctly', () => {
      expect(formatTime(90000)).toBe('25:00:00'); // 25 hours
    });

    it('formats 100 hours correctly', () => {
      expect(formatTime(360000)).toBe('100:00:00');
    });
  });

  describe('edge cases', () => {
    it('handles typical work session (8 hours)', () => {
      expect(formatTime(28800)).toBe('08:00:00');
    });

    it('handles mid-session time (1:30:45)', () => {
      expect(formatTime(5445)).toBe('01:30:45');
    });
  });
});
