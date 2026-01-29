/**
 * Theme System
 * Single theme for the Time Tracker app (Midnight Aurora)
 */

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
  name: string;
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
// Midnight Aurora Theme
// Dark theme with vibrant gradients and neon accents
// ============================================================
export const defaultTheme: Theme = {
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
