import { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { OfflineProvider } from './src/contexts/OfflineContext';
import { ThemeProvider, useTheme } from './src/design-system/themes/ThemeContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { SignupScreen } from './src/screens/SignupScreen';
import { TimerScreen } from './src/screens/TimerScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TabBar, TabName } from './src/components/TabBar';
import { OfflineIndicator } from './src/components/OfflineIndicator';
import { ShowcaseScreen } from './src/design-system/showcase';
import { ThemeShowcaseScreen } from './src/design-system/showcase/themed';

type AuthScreen = 'login' | 'forgotPassword' | 'signup';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabName>('timer');
  const { theme } = useTheme();

  const renderScreen = () => {
    switch (activeTab) {
      case 'timer':
        return <TimerScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <TimerScreen />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <OfflineIndicator />
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      <TabBar activeTab={activeTab} onTabPress={setActiveTab} showSettings />
    </View>
  );
}

function AuthScreens({
  onOpenShowcase,
  onOpenThemes,
}: {
  onOpenShowcase?: () => void;
  onOpenThemes?: () => void;
}) {
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');

  const goToLogin = useCallback(() => setAuthScreen('login'), []);
  const goToForgotPassword = useCallback(() => setAuthScreen('forgotPassword'), []);
  const goToSignup = useCallback(() => setAuthScreen('signup'), []);

  switch (authScreen) {
    case 'forgotPassword':
      return <ForgotPasswordScreen onBack={goToLogin} />;
    case 'signup':
      return <SignupScreen onBack={goToLogin} />;
    case 'login':
    default:
      return (
        <LoginScreen
          onOpenShowcase={onOpenShowcase}
          onOpenThemes={onOpenThemes}
          onForgotPassword={goToForgotPassword}
          onSignup={goToSignup}
        />
      );
  }
}

type ShowcaseType = 'none' | 'components' | 'themes';

function AppContent() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [showcase, setShowcase] = useState<ShowcaseType>('none');

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (showcase === 'components') {
    return <ShowcaseScreen onClose={() => setShowcase('none')} />;
  }

  if (showcase === 'themes') {
    return <ThemeShowcaseScreen onClose={() => setShowcase('none')} />;
  }

  return user ? (
    <MainApp />
  ) : (
    <AuthScreens
      onOpenShowcase={() => setShowcase('components')}
      onOpenThemes={() => setShowcase('themes')}
    />
  );
}

function ThemedStatusBar() {
  const { theme } = useTheme();
  return <StatusBar style={theme.isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <KeyboardProvider>
      <ThemeProvider>
        <AuthProvider>
          <OfflineProvider>
            <ThemedStatusBar />
            <AppContent />
          </OfflineProvider>
        </AuthProvider>
      </ThemeProvider>
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
