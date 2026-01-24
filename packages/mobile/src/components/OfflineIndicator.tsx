import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOffline } from '../contexts/OfflineContext';
import { colors, typography, spacing } from '../design-system/tokens';

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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  offline: {
    backgroundColor: colors.danger,
  },
  syncing: {
    backgroundColor: colors.primary,
  },
  pending: {
    backgroundColor: colors.warning,
  },
  text: {
    color: colors.textInverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  subtext: {
    color: colors.overlayLight,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xxs,
  },
});
