import React, { useState, useCallback } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { TimeEntryDisplay } from '../hooks/useTimeEntries';
import { useUpdateTimeEntry } from '../hooks/useUpdateTimeEntry';
import {
  DSButton,
  DSText,
  DSTextInput,
  DSScreen,
  DSScreenHeader,
  DSSection,
  DSSpacer,
  spacing,
} from '../design-system';

interface EntryDetailScreenProps {
  entry: TimeEntryDisplay;
  onBack: () => void;
  onSaved: () => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes} minutes`;
  }
  if (minutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${hours}h ${minutes}m`;
}

export function EntryDetailScreen({ entry, onBack, onSaved }: EntryDetailScreenProps) {
  const { updateEntry, loading } = useUpdateTimeEntry();
  
  const [description, setDescription] = useState(entry.description ?? '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleDescriptionChange = useCallback((text: string) => {
    setDescription(text);
    setHasChanges(text !== (entry.description ?? ''));
  }, [entry.description]);

  const handleSave = useCallback(async () => {
    try {
      await updateEntry(entry.id, {
        description: description.trim() || null,
      });
      Alert.alert('Success', 'Time entry updated', [
        { text: 'OK', onPress: onSaved },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save changes';
      Alert.alert('Error', message);
    }
  }, [entry.id, description, updateEntry, onSaved]);

  const handleBack = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onBack },
        ]
      );
    } else {
      onBack();
    }
  }, [hasChanges, onBack]);

  return (
    <DSScreen scrollable variant="secondary" testID="entry-detail-screen">
      <DSScreenHeader 
        title="Entry Details" 
        variant="bordered"
        action={{
          label: 'Back',
          onPress: handleBack,
          variant: 'ghost',
          testID: 'entry-detail-back-button',
        }}
      />

      <DSSection title="Client & Project" testID="entry-detail-client-section">
        <View style={styles.infoRow}>
          <DSText variant="bodySmall" color="secondary">Client</DSText>
          <DSText variant="body" testID="entry-detail-client">{entry.clientName}</DSText>
        </View>
        
        {entry.projectName && (
          <View style={styles.infoRow}>
            <DSText variant="bodySmall" color="secondary">Project</DSText>
            <DSText variant="body" testID="entry-detail-project">{entry.projectName}</DSText>
          </View>
        )}
        
        {entry.taskName && (
          <View style={styles.infoRow}>
            <DSText variant="bodySmall" color="secondary">Task</DSText>
            <DSText variant="body" testID="entry-detail-task">{entry.taskName}</DSText>
          </View>
        )}
      </DSSection>

      <DSSection title="Time" testID="entry-detail-time-section">
        <View style={styles.infoRow}>
          <DSText variant="bodySmall" color="secondary">Date</DSText>
          <DSText variant="body" testID="entry-detail-date">{formatDate(entry.startedAt)}</DSText>
        </View>
        
        <View style={styles.infoRow}>
          <DSText variant="bodySmall" color="secondary">Start Time</DSText>
          <DSText variant="body" testID="entry-detail-start-time">{formatTime(entry.startedAt)}</DSText>
        </View>
        
        <View style={styles.infoRow}>
          <DSText variant="bodySmall" color="secondary">End Time</DSText>
          <DSText variant="body" testID="entry-detail-end-time">{formatTime(entry.endedAt)}</DSText>
        </View>
        
        <View style={styles.infoRow}>
          <DSText variant="bodySmall" color="secondary">Duration</DSText>
          <DSText variant="body" color="primary" testID="entry-detail-duration">
            {formatDuration(entry.duration)}
          </DSText>
        </View>
      </DSSection>

      <DSSection title="Description" testID="entry-detail-description-section">
        <DSTextInput
          value={description}
          onChangeText={handleDescriptionChange}
          placeholder="Add a description..."
          multiline
          numberOfLines={4}
          testID="entry-detail-description-input"
          containerStyle={{ marginBottom: 0 }}
        />
      </DSSection>

      <DSSpacer size="lg" />

      <View style={styles.buttonContainer}>
        <DSButton
          title={loading ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          variant="primary"
          disabled={!hasChanges || loading}
          testID="entry-detail-save-button"
        />
        
        <DSSpacer size="sm" />
        
        <DSButton
          title="Cancel"
          onPress={handleBack}
          variant="ghost"
          disabled={loading}
          testID="entry-detail-cancel-button"
        />
      </View>

      <DSSpacer size="xxl" />
    </DSScreen>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    paddingVertical: spacing.sm,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
  },
});
