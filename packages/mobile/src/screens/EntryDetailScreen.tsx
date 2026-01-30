import React, { useState, useCallback } from 'react';
import { Alert, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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

type PickerMode = 'start' | 'end' | null;

export function EntryDetailScreen({ entry, onBack, onSaved }: EntryDetailScreenProps) {
  const { updateEntry, loading } = useUpdateTimeEntry();
  
  const [description, setDescription] = useState(entry.description ?? '');
  const [startTime, setStartTime] = useState(entry.startedAt);
  const [endTime, setEndTime] = useState(entry.endedAt);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
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

  const handleTimeChange = useCallback((
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === 'android') {
      setPickerMode(null);
    }
    
    if (event.type === 'dismissed' || !selectedDate) {
      setPickerMode(null);
      return;
    }

    if (pickerMode === 'start') {
      // Validate: start must be before end
      if (selectedDate >= endTime) {
        Alert.alert('Invalid Time', 'Start time must be before end time');
        return;
      }
      setStartTime(selectedDate);
      checkForChanges(description, selectedDate, endTime);
    } else if (pickerMode === 'end') {
      // Validate: end must be after start
      if (selectedDate <= startTime) {
        Alert.alert('Invalid Time', 'End time must be after start time');
        return;
      }
      setEndTime(selectedDate);
      checkForChanges(description, startTime, selectedDate);
    }
    
    if (Platform.OS === 'ios') {
      // iOS picker stays open, user can adjust
    }
  }, [pickerMode, startTime, endTime, description, checkForChanges]);

  const closePicker = useCallback(() => {
    setPickerMode(null);
  }, []);

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
        
        <TouchableOpacity 
          style={styles.editableRow} 
          onPress={() => setPickerMode('start')}
          testID="entry-detail-start-time-button"
          accessibilityLabel="Edit start time"
          accessibilityHint="Opens time picker to change start time"
        >
          <View style={styles.infoRow}>
            <DSText variant="bodySmall" color="secondary">Start Time</DSText>
            <View style={styles.editableValue}>
              <DSText variant="body" color="primary" testID="entry-detail-start-time">
                {formatTime(startTime)}
              </DSText>
              <DSText variant="bodySmall" color="secondary"> ✎</DSText>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.editableRow} 
          onPress={() => setPickerMode('end')}
          testID="entry-detail-end-time-button"
          accessibilityLabel="Edit end time"
          accessibilityHint="Opens time picker to change end time"
        >
          <View style={styles.infoRow}>
            <DSText variant="bodySmall" color="secondary">End Time</DSText>
            <View style={styles.editableValue}>
              <DSText variant="body" color="primary" testID="entry-detail-end-time">
                {formatTime(endTime)}
              </DSText>
              <DSText variant="bodySmall" color="secondary"> ✎</DSText>
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={styles.infoRow}>
          <DSText variant="bodySmall" color="secondary">Duration</DSText>
          <DSText variant="body" color="primary" testID="entry-detail-duration">
            {formatDuration(currentDuration)}
          </DSText>
        </View>
      </DSSection>

      {/* Time Picker Modal */}
      {pickerMode && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <DSText variant="body">
              {pickerMode === 'start' ? 'Select Start Time' : 'Select End Time'}
            </DSText>
            <TouchableOpacity onPress={closePicker} testID="time-picker-done">
              <DSText variant="body" color="primary">Done</DSText>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={pickerMode === 'start' ? startTime : endTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            testID="time-picker"
          />
        </View>
      )}

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
  editableRow: {
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  editableValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
  },
  pickerContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});
