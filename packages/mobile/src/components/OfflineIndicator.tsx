import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOffline } from '../contexts/OfflineContext';

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingActions } = useOffline();

  if (isOnline && !isSyncing && pendingActions === 0) {
    return null;
  }

  if (isSyncing) {
    return (
      <View style={[styles.container, styles.syncing]} testID="sync-indicator">
        <Text style={styles.text}>Syncing...</Text>
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View style={[styles.container, styles.offline]} testID="offline-indicator">
        <Text style={styles.text}>No connection</Text>
        {pendingActions > 0 && (
          <Text style={styles.subtext}>
            {pendingActions} pending {pendingActions === 1 ? 'action' : 'actions'}
          </Text>
        )}
      </View>
    );
  }

  // Online with pending actions
  if (pendingActions > 0) {
    return (
      <View style={[styles.container, styles.pending]} testID="pending-indicator">
        <Text style={styles.text}>
          {pendingActions} pending {pendingActions === 1 ? 'action' : 'actions'}
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offline: {
    backgroundColor: '#FF3B30',
  },
  syncing: {
    backgroundColor: '#007AFF',
  },
  pending: {
    backgroundColor: '#FF9500',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
});
