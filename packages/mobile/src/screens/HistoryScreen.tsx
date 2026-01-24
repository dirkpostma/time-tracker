import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { DaySection } from '../components/DaySection';

export function HistoryScreen() {
  const { groups, loading, refreshing, refresh } = useTimeEntries();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="history-screen">
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyContainer} testID="history-empty">
          <Text style={styles.emptyText}>No time entries yet</Text>
          <Text style={styles.emptySubtext}>
            Start tracking time to see your history here
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.date}
          testID="history-list"
          renderItem={({ item }) => <DaySection group={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
});
