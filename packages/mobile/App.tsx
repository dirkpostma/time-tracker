import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { TimerScreen } from './src/screens/TimerScreen';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return user ? <TimerScreen /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
