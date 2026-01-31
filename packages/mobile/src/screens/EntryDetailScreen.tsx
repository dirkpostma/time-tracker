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
  DSTimePicker,
  spacing,
} from '../design-system';

interface EntryDetailScreenProps {
  entry: TimeEntryDisplay;
  onBack: () => void;
  onSaved: () => void;
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
  const [startTime, setStartTime] = useState(entry.startedAt);
  const [endTime, setEndTime] = useState(entry.endedAt);
  const [hasChanges, setHasChanges] = useState(false);

  const checkForChanges = useCallback((
    newDescription: string,
    newStart: Date,
    newEnd: Date
  ) => {
    const descChanged = newDescription !== (entry.description ?? '');
    const startChanged = newStart.getTime() !== entry.startedAt.getTime();
    const endChanged = newEnd.getTime() !== entry.endedAt.getTime();
    setHasChanges(descChanged || startChanged || endChanged);
  }, [entry.description, entry.startedAt, entry.endedAt]);

  const currentDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

  const handleDescriptionChange = useCallback((text: string) => {
    setDescription(text);
    checkForChanges(text, startTime, endTime);
  }, [checkForChanges, startTime, endTime]);

  const handleStartTimeChange = useCallback((date: Date) => {
    // Validate: start must be before end
    if (date >= endTime) {
      Alert.alert('Invalid Time', 'Start time must be before end time');
      return;
    }
    setStartTime(date);
    checkForChanges(description, date, endTime);
  }, [description, endTime, checkForChanges]);

  const handleEndTimeChange = useCallback((date: Date) => {
    // Validate: end must be after start
    if (date <= startTime) {
      Alert.alert('Invalid Time', 'End time must be after start time');
      return;
    }
    setEndTime(date);
    checkForChanges(description, startTime, date);
  }, [description, startTime, checkForChanges]);

  const handleSave = useCallback(async () => {
    try {
      await updateEntry(entry.id, {
        description: description.trim() || null,
        started_at: startTime.toISOString(),
        ended_at: endTime.toISOString(),
      });
      Alert.alert('Success', 'Time entry updated', [
        { text: 'OK', onPress: onSaved },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save changes';
      Alert.alert('Error', message);
    }
  }, [entry.id, description, startTime, endTime, updateEntry, onSaved]);

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
          <DSText variant="body" testID="entry-detail-date">{formatDate(startTime)}</DSText>
        </View>
        
        <DSTimePicker
          value={startTime}
          onChange={handleStartTimeChange}
          label="Start Time"
          maximumDate={endTime}
          testID="entry-detail-start-time"
        />
        
        <DSTimePicker
          value={endTime}
          onChange={handleEndTimeChange}
          label="End Time"
          minimumDate={startTime}
          testID="entry-detail-end-time"
        />
        
        <View style={styles.infoRow}>
          <DSText variant="bodySmall" color="secondary">Duration</DSText>
          <DSText variant="body" color="primary" testID="entry-detail-duration">
            {formatDuration(currentDuration)}
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
