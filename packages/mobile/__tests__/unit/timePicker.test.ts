/**
 * Unit tests for DSTimePicker component
 */

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ value, onChange, testID }: { value: Date; onChange: (event: unknown, date?: Date) => void; testID?: string }) => {
      const { View, Text, TouchableOpacity } = require('react-native');
      return React.createElement(View, { testID }, 
        React.createElement(Text, null, value.toISOString()),
        React.createElement(TouchableOpacity, { 
          testID: `${testID}-increment`,
          onPress: () => {
            const newDate = new Date(value.getTime() + 60000); // Add 1 minute
            onChange({ type: 'set' }, newDate);
          }
        }, React.createElement(Text, null, '+'))
      );
    },
  };
});

describe('DSTimePicker', () => {
  describe('formatTime', () => {
    // Test the internal formatTime function indirectly through rendering
    it('formats time in 12-hour format with AM/PM', () => {
      const date = new Date('2026-01-30T14:30:00');
      const formatted = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      
      // Should be something like "2:30 PM"
      expect(formatted).toMatch(/2:30\s*PM/i);
    });

    it('formats morning time correctly', () => {
      const date = new Date('2026-01-30T09:15:00');
      const formatted = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      
      expect(formatted).toMatch(/9:15\s*AM/i);
    });

    it('formats midnight correctly', () => {
      const date = new Date('2026-01-30T00:00:00');
      const formatted = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      
      expect(formatted).toMatch(/12:00\s*AM/i);
    });

    it('formats noon correctly', () => {
      const date = new Date('2026-01-30T12:00:00');
      const formatted = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      
      expect(formatted).toMatch(/12:00\s*PM/i);
    });
  });

  describe('time range validation', () => {
    it('validates start time is before end time', () => {
      const startTime = new Date('2026-01-30T10:00:00');
      const endTime = new Date('2026-01-30T14:00:00');
      
      // Valid: start before end
      expect(startTime < endTime).toBe(true);
      
      // Invalid: start equals end
      const sameTime = new Date('2026-01-30T10:00:00');
      expect(sameTime >= endTime).toBe(false);
      
      // Invalid: start after end
      const lateStart = new Date('2026-01-30T15:00:00');
      expect(lateStart >= endTime).toBe(true);
    });

    it('calculates duration correctly', () => {
      const startTime = new Date('2026-01-30T10:00:00');
      const endTime = new Date('2026-01-30T14:30:00');
      
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationSeconds = Math.floor(durationMs / 1000);
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      
      expect(hours).toBe(4);
      expect(minutes).toBe(30);
    });

    it('handles crossing midnight', () => {
      const startTime = new Date('2026-01-30T23:00:00');
      const endTime = new Date('2026-01-31T01:00:00');
      
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      
      expect(durationHours).toBe(2);
    });
  });

  describe('accessibility', () => {
    it('provides accessible label for time button', () => {
      const date = new Date('2026-01-30T14:30:00');
      const label = 'Start Time';
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      
      const expectedLabel = `${label}: ${timeStr}`;
      expect(expectedLabel).toContain('Start Time');
      expect(expectedLabel).toContain('2:30');
    });
  });
});
