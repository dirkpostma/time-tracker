/**
 * Design System Tokens
 * Centralized design values for the Time Tracker mobile app
 */

export const colors = {
  // Primary
  primary: '#007AFF',
  primaryLight: '#4DA3FF',

  // Semantic
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#F9F9F9',
  backgroundDisabled: '#F0F0F0',

  // Text
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#888888',
  textMuted: '#999999',
  textInverse: '#FFFFFF',

  // Borders
  border: '#DDDDDD',
  borderLight: '#EEEEEE',
  borderInput: '#E0E0E0',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.8)',
} as const;

export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    timer: 64,
  },

  // Font weights
  fontWeight: {
    thin: '200' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  headerTop: 60,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
} as const;

export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
} as const;

// Component-specific tokens
export const componentTokens = {
  button: {
    paddingVertical: spacing.md + 2, // 14
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  input: {
    paddingVertical: spacing.md + 2, // 14
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  modal: {
    headerPadding: spacing.lg,
    borderWidth: 1,
  },
} as const;

// Theme type for type safety
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
