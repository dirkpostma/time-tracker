/**
 * Theme Context
 * Provides theme values throughout the app (single theme, no switching)
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { Theme, defaultTheme } from './index';

interface ThemeContextValue {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const value: ThemeContextValue = {
    theme: defaultTheme,
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
