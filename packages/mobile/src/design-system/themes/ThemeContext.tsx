/**
 * Theme Context
 * Provides theme values throughout the app with persistence
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeName, themes, defaultTheme } from './index';

const THEME_STORAGE_KEY = '@time_tracker/theme';

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  cycleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeName;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [themeName, setThemeNameState] = useState<ThemeName>(initialTheme || defaultTheme.name);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && savedTheme in themes) {
          setThemeNameState(savedTheme as ThemeName);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTheme();
  }, []);

  const setThemeName = useCallback(async (name: ThemeName) => {
    setThemeNameState(name);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
  }, [setThemeName]);

  const cycleTheme = useCallback(() => {
    const themeNames = Object.keys(themes) as ThemeName[];
    const currentIndex = themeNames.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    setThemeName(themeNames[nextIndex]);
  }, [themeName, setThemeName]);

  const value: ThemeContextValue = {
    theme: themes[themeName],
    themeName,
    setTheme,
    cycleTheme,
    isLoading,
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
