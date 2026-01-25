/**
 * Theme Context
 * Provides theme values throughout the app
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Theme, ThemeName, themes, defaultTheme } from './index';

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeName;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme || defaultTheme.name);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
  }, []);

  const cycleTheme = useCallback(() => {
    const themeNames = Object.keys(themes) as ThemeName[];
    const currentIndex = themeNames.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    setThemeName(themeNames[nextIndex]);
  }, [themeName]);

  const value: ThemeContextValue = {
    theme: themes[themeName],
    themeName,
    setTheme,
    cycleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Convenience hook for just the theme values
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

export function useThemeTypography() {
  const { theme } = useTheme();
  return theme.typography;
}

export function useThemeSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}
