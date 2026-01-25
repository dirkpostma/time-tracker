import React from 'react';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { DaySection } from '../components/DaySection';
import {
  DSLoadingIndicator,
  DSScreen,
  DSScreenHeader,
  DSList,
} from '../design-system';

export function HistoryScreen() {
  const { groups, loading, refreshing, refresh } = useTimeEntries();

  if (loading) {
    return (
      <DSLoadingIndicator
        fullScreen
        testID="history-loading"
      />
    );
  }

  return (
    <DSScreen variant="secondary" testID="history-screen">
      <DSScreenHeader title="History" variant="bordered" />

      <DSList
        data={groups}
        keyExtractor={(item) => item.date}
        renderItem={(item) => <DaySection group={item} />}
        refreshing={refreshing}
        onRefresh={refresh}
        showSeparators={false}
        emptyMessage="No time entries yet"
        emptySubMessage="Start tracking time to see your history here"
        testID="history-list"
      />
    </DSScreen>
  );
}
