import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAuthRepository, type AuthUser, type AuthSession, type AuthRepository } from '../lib/repositories';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

// Create auth repository instance
const authRepo: AuthRepository = createAuthRepository();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    authRepo.getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const unsubscribe = authRepo.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await authRepo.signIn(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await authRepo.signUp(email, password);
  };

  const resetPassword = async (email: string) => {
    await authRepo.resetPassword(email);
  };

  const signOut = async () => {
    await authRepo.signOut();
  };

  const deleteAccount = async (password: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    // 1. Delete user account via repository (handles RPC, token cleanup, and sign out)
    await authRepo.deleteAccount(password);

    // 2. Clear local storage
    try {
      await AsyncStorage.multiRemove([
        '@time_tracker/notification_settings',
        '@time_tracker/recent_selection',
      ]);
    } catch {
      // Ignore storage cleanup errors
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, resetPassword, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
