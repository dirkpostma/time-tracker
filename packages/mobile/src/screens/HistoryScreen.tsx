import React, { useState, useCallback } from 'react';
import { useTimeEntries, TimeEntryDisplay } from '../hooks/useTimeEntries';
import { DaySection } from '../components/DaySection';
import { EntryDetailScreen } from './EntryDetailScreen';
import {
  DSLoadingIndicator,
  DSScreen,
  DSScreenHeader,
  DSList,
} from '../design-system';

export function HistoryScreen() {
  const { groups, loading, refreshing, refresh } = useTimeEntries();
  const [selectedEntry, setSelectedEntry] = useState<TimeEntryDisplay | null>(null);

  const handleEntryPress = useCallback((entry: TimeEntryDisplay) => {
    setSelectedEntry(entry);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  const handleSaved = useCallback(() => {
    setSelectedEntry(null);
    refresh();
  }, [refresh]);

  // Show detail screen if an entry is selected
  if (selectedEntry) {
    return (
      <EntryDetailScreen
        entry={selectedEntry}
        onBack={handleBack}
        onSaved={handleSaved}
      />
    );
  }

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
        renderItem={(item) => (
          <DaySection 
            group={item} 
            onEntryPress={handleEntryPress}
          />
        )}
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
