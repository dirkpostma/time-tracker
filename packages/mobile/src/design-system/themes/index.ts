/**
 * Theme System
 * 5 distinct visual themes for the Time Tracker app
 */

export type ThemeName =
  | 'midnightAurora'
  | 'softBlossom'
  | 'brutalist'
  | 'oceanDepth'
  | 'sunsetWarmth';

export interface ThemeColors {
  // Core
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;

  // Semantic
  success: string;
  danger: string;
  warning: string;

  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundElevated: string;
  backgroundCard: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  textInverse: string;
  textOnPrimary: string;

  // Borders
  border: string;
  borderLight: string;
  borderAccent: string;

  // Effects
  overlay: string;
  glow: string;
  shadow: string;

  // Timer specific
  timerText: string;
  timerGlow: string;
}

export interface ThemeTypography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
    mono: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    timer: number;
  };
  fontWeight: {
    thin: '200' | '300';
    normal: '400';
    medium: '500';
    semibold: '600';
    bold: '700' | '800';
  };
  letterSpacing: {
    tight: number;
    normal: number;
    wide: number;
    extraWide: number;
  };
}

export interface ThemeSpacing {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface ThemeBorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeShadows {
  none: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  glow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface ThemeAnimation {
  duration: {
    instant: number;
    fast: number;
    normal: number;
    slow: number;
  };
  easing: string;
}

export interface ThemeSpecial {
  timerStyle: 'digital' | 'analog' | 'minimal' | 'bold' | 'neon';
  buttonStyle: 'rounded' | 'pill' | 'sharp' | 'soft' | 'outlined';
  cardStyle: 'flat' | 'elevated' | 'glass' | 'bordered' | 'gradient';
  inputStyle: 'underline' | 'outlined' | 'filled' | 'minimal';
  headerStyle: 'transparent' | 'solid' | 'gradient' | 'blur';
}

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  isDark: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  animation: ThemeAnimation;
  special: ThemeSpecial;
}

// ============================================================
// THEME 1: Midnight Aurora
// Dark theme with vibrant gradients and neon accents
// ============================================================
export const midnightAuroraTheme: Theme = {
  name: 'midnightAurora',
  displayName: 'Midnight Aurora',
  description: 'Dark theme with vibrant neon accents and glowing effects',
  isDark: true,
  colors: {
    primary: '#7C3AED',      // Vibrant purple
    primaryLight: '#A78BFA',
    primaryDark: '#5B21B6',
    accent: '#06B6D4',       // Cyan
    accentLight: '#67E8F9',

    success: '#10B981',
    danger: '#F43F5E',
    warning: '#F59E0B',

    background: '#0F0F1A',
    backgroundSecondary: '#1A1A2E',
    backgroundTertiary: '#252542',
    backgroundElevated: '#2D2D4A',
    backgroundCard: 'rgba(37, 37, 66, 0.8)',

    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#0F0F1A',
    textOnPrimary: '#FFFFFF',

    border: '#3B3B5C',
    borderLight: '#2D2D4A',
    borderAccent: '#7C3AED',

    overlay: 'rgba(15, 15, 26, 0.9)',
    glow: 'rgba(124, 58, 237, 0.5)',
    shadow: '#000000',

    timerText: '#A78BFA',
    timerGlow: 'rgba(167, 139, 250, 0.6)',
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      mono: 'Menlo',
    },
    fontSize: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 22,
      xxl: 28,
      timer: 72,
    },
    fontWeight: {
      thin: '200',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      extraWide: 2,
    },
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  borderRadius: {
    none: 0,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    none: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
    glow: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  animation: {
    duration: {
      instant: 100,
      fast: 200,
      normal: 350,
      slow: 500,
    },
    easing: 'ease-out',
  },
  special: {
    timerStyle: 'neon',
    buttonStyle: 'rounded',
    cardStyle: 'glass',
    inputStyle: 'outlined',
    headerStyle: 'blur',
  },
};

// ============================================================
// THEME 2: Soft Blossom
// Light, warm pastels with rounded organic shapes
// ============================================================
export const softBlossomTheme: Theme = {
  name: 'softBlossom',
  displayName: 'Soft Blossom',
  description: 'Warm, gentle pastels with organic, rounded shapes',
  isDark: false,
  colors: {
    primary: '#EC4899',      // Pink
    primaryLight: '#F9A8D4',
    primaryDark: '#BE185D',
    accent: '#8B5CF6',       // Lavender
    accentLight: '#C4B5FD',

    success: '#34D399',
    danger: '#FB7185',
    warning: '#FBBF24',

    background: '#FFF5F7',
    backgroundSecondary: '#FFEEF2',
    backgroundTertiary: '#FFE4EC',
    backgroundElevated: '#FFFFFF',
    backgroundCard: '#FFFFFF',

    textPrimary: '#4A2040',
    textSecondary: '#6B3A5C',
    textTertiary: '#9A6B8C',
    textMuted: '#C9A0B8',
    textInverse: '#FFFFFF',
    textOnPrimary: '#FFFFFF',

    border: '#F9D4E2',
    borderLight: '#FCE7EF',
    borderAccent: '#EC4899',

    overlay: 'rgba(74, 32, 64, 0.4)',
    glow: 'rgba(236, 72, 153, 0.3)',
    shadow: '#D4A5BD',

    timerText: '#BE185D',
    timerGlow: 'rgba(236, 72, 153, 0.2)',
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      mono: 'Menlo',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
      timer: 68,
    },
    fontWeight: {
      thin: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    letterSpacing: {
      tight: -0.3,
      normal: 0,
      wide: 0.3,
      extraWide: 1.5,
    },
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 36,
    xxxl: 52,
  },
  borderRadius: {
    none: 0,
    sm: 12,
    md: 20,
    lg: 28,
    xl: 36,
    full: 9999,
  },
  shadows: {
    none: {
      shadowColor: '#D4A5BD',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#D4A5BD',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#D4A5BD',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 4,
    },
    lg: {
      shadowColor: '#D4A5BD',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 8,
    },
    glow: {
      shadowColor: '#EC4899',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6,
    },
  },
  animation: {
    duration: {
      instant: 100,
      fast: 180,
      normal: 300,
      slow: 450,
    },
    easing: 'ease-in-out',
  },
  special: {
    timerStyle: 'minimal',
    buttonStyle: 'pill',
    cardStyle: 'elevated',
    inputStyle: 'filled',
    headerStyle: 'solid',
  },
};

// ============================================================
// THEME 3: Brutalist
// Raw, bold, high-contrast with sharp edges
// ============================================================
export const brutalistTheme: Theme = {
  name: 'brutalist',
  displayName: 'Brutalist',
  description: 'Bold, raw aesthetics with high contrast and sharp edges',
  isDark: false,
  colors: {
    primary: '#000000',      // Pure black
    primaryLight: '#333333',
    primaryDark: '#000000',
    accent: '#FF0000',       // Pure red
    accentLight: '#FF4444',

    success: '#00FF00',
    danger: '#FF0000',
    warning: '#FFFF00',

    background: '#FFFFFF',
    backgroundSecondary: '#F0F0F0',
    backgroundTertiary: '#E0E0E0',
    backgroundElevated: '#FFFFFF',
    backgroundCard: '#FFFFFF',

    textPrimary: '#000000',
    textSecondary: '#333333',
    textTertiary: '#666666',
    textMuted: '#999999',
    textInverse: '#FFFFFF',
    textOnPrimary: '#FFFFFF',

    border: '#000000',
    borderLight: '#CCCCCC',
    borderAccent: '#FF0000',

    overlay: 'rgba(0, 0, 0, 0.85)',
    glow: 'transparent',
    shadow: '#000000',

    timerText: '#000000',
    timerGlow: 'transparent',
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      mono: 'Courier',
    },
    fontSize: {
      xs: 11,
      sm: 13,
      md: 16,
      lg: 20,
      xl: 28,
      xxl: 40,
      timer: 80,
    },
    fontWeight: {
      thin: '200',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '800',
    },
    letterSpacing: {
      tight: -1,
      normal: 0,
      wide: 2,
      extraWide: 6,
    },
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    none: 0,
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
    full: 0,
  },
  shadows: {
    none: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8,
    },
    glow: {
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
  },
  animation: {
    duration: {
      instant: 0,
      fast: 100,
      normal: 150,
      slow: 200,
    },
    easing: 'linear',
  },
  special: {
    timerStyle: 'bold',
    buttonStyle: 'sharp',
    cardStyle: 'bordered',
    inputStyle: 'underline',
    headerStyle: 'solid',
  },
};

// ============================================================
// THEME 4: Ocean Depth
// Deep blues with glass-morphism effects
// ============================================================
export const oceanDepthTheme: Theme = {
  name: 'oceanDepth',
  displayName: 'Ocean Depth',
  description: 'Deep oceanic blues with translucent glass effects',
  isDark: true,
  colors: {
    primary: '#0EA5E9',      // Sky blue
    primaryLight: '#38BDF8',
    primaryDark: '#0369A1',
    accent: '#14B8A6',       // Teal
    accentLight: '#5EEAD4',

    success: '#22C55E',
    danger: '#EF4444',
    warning: '#EAB308',

    background: '#0C1929',
    backgroundSecondary: '#132337',
    backgroundTertiary: '#1A3047',
    backgroundElevated: 'rgba(26, 48, 71, 0.9)',
    backgroundCard: 'rgba(19, 35, 55, 0.7)',

    textPrimary: '#F0F9FF',
    textSecondary: '#BAE6FD',
    textTertiary: '#7DD3FC',
    textMuted: '#38BDF8',
    textInverse: '#0C1929',
    textOnPrimary: '#FFFFFF',

    border: 'rgba(56, 189, 248, 0.3)',
    borderLight: 'rgba(56, 189, 248, 0.15)',
    borderAccent: '#0EA5E9',

    overlay: 'rgba(12, 25, 41, 0.9)',
    glow: 'rgba(14, 165, 233, 0.4)',
    shadow: '#041525',

    timerText: '#38BDF8',
    timerGlow: 'rgba(56, 189, 248, 0.4)',
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      mono: 'Menlo',
    },
    fontSize: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 18,
      xl: 24,
      xxl: 32,
      timer: 70,
    },
    fontWeight: {
      thin: '200',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    letterSpacing: {
      tight: -0.4,
      normal: 0,
      wide: 0.5,
      extraWide: 3,
    },
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 18,
    xl: 26,
    xxl: 36,
    xxxl: 52,
  },
  borderRadius: {
    none: 0,
    sm: 8,
    md: 14,
    lg: 22,
    xl: 30,
    full: 9999,
  },
  shadows: {
    none: {
      shadowColor: '#041525',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#041525',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: '#041525',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#041525',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 8,
    },
    glow: {
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 10,
    },
  },
  animation: {
    duration: {
      instant: 100,
      fast: 200,
      normal: 400,
      slow: 600,
    },
    easing: 'ease-out',
  },
  special: {
    timerStyle: 'digital',
    buttonStyle: 'soft',
    cardStyle: 'glass',
    inputStyle: 'filled',
    headerStyle: 'blur',
  },
};

// ============================================================
// THEME 5: Sunset Warmth
// Warm oranges/reds with soft shadows
// ============================================================
export const sunsetWarmthTheme: Theme = {
  name: 'sunsetWarmth',
  displayName: 'Sunset Warmth',
  description: 'Warm, inviting tones inspired by golden hour sunsets',
  isDark: false,
  colors: {
    primary: '#EA580C',      // Orange
    primaryLight: '#FB923C',
    primaryDark: '#C2410C',
    accent: '#DC2626',       // Red
    accentLight: '#F87171',

    success: '#16A34A',
    danger: '#DC2626',
    warning: '#CA8A04',

    background: '#FFFBF5',
    backgroundSecondary: '#FFF7ED',
    backgroundTertiary: '#FFEDD5',
    backgroundElevated: '#FFFFFF',
    backgroundCard: '#FFFFFF',

    textPrimary: '#431407',
    textSecondary: '#7C2D12',
    textTertiary: '#9A3412',
    textMuted: '#C2410C',
    textInverse: '#FFFFFF',
    textOnPrimary: '#FFFFFF',

    border: '#FED7AA',
    borderLight: '#FFEDD5',
    borderAccent: '#EA580C',

    overlay: 'rgba(67, 20, 7, 0.5)',
    glow: 'rgba(234, 88, 12, 0.25)',
    shadow: '#9A3412',

    timerText: '#C2410C',
    timerGlow: 'rgba(234, 88, 12, 0.15)',
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      mono: 'Menlo',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 19,
      xl: 26,
      xxl: 34,
      timer: 66,
    },
    fontWeight: {
      thin: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    letterSpacing: {
      tight: -0.2,
      normal: 0,
      wide: 0.4,
      extraWide: 1.8,
    },
  },
  spacing: {
    xxs: 2,
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 38,
    xxxl: 54,
  },
  borderRadius: {
    none: 0,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  shadows: {
    none: {
      shadowColor: '#9A3412',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#9A3412',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: '#9A3412',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#9A3412',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 20,
      elevation: 8,
    },
    glow: {
      shadowColor: '#EA580C',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 18,
      elevation: 6,
    },
  },
  animation: {
    duration: {
      instant: 100,
      fast: 180,
      normal: 320,
      slow: 480,
    },
    easing: 'ease-in-out',
  },
  special: {
    timerStyle: 'analog',
    buttonStyle: 'rounded',
    cardStyle: 'elevated',
    inputStyle: 'outlined',
    headerStyle: 'gradient',
  },
};

// ============================================================
// Theme Registry
// ============================================================
export const themes: Record<ThemeName, Theme> = {
  midnightAurora: midnightAuroraTheme,
  softBlossom: softBlossomTheme,
  brutalist: brutalistTheme,
  oceanDepth: oceanDepthTheme,
  sunsetWarmth: sunsetWarmthTheme,
};

export const themeList: Theme[] = Object.values(themes);
export const defaultTheme = midnightAuroraTheme;
