import React, { useCallback, useState } from 'react';
import { Alert, View, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import {
  DSButton,
  DSText,
  DSLoadingIndicator,
  DSScreen,
  DSScreenHeader,
  DSStack,
  colors,
  spacing,
} from '../design-system';
import { SelectionPickerModal } from '../components/SelectionPickerModal';
import { TimerDisplay } from '../components/TimerDisplay';
import { SelectionCard } from '../components/SelectionCard';
import { useTimer } from '../hooks/useTimer';
import { useSelectionFlow } from '../hooks/useSelectionFlow';
import { TimerSelection } from '../types/timer';

function formatStartTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function TimerScreen() {
  const { user, signOut } = useAuth();
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);

  const {
    running,
    client,
    project,
    task,
    elapsed,
    loading,
    actionLoading,
    refreshing,
    description,
    selection,
    startTimer,
    stopTimer,
    updateStartTime,
    onRefresh,
    handleDescriptionChange,
    formatTime,
  } = useTimer();

  const startedAt = running ? new Date(running.started_at) : new Date();

  const handleStartTimeChange = useCallback(async (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }
    
    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    const success = await updateStartTime(selectedDate);
    if (success && Platform.OS === 'ios') {
      // Keep picker open on iOS for adjustments
    }
  }, [updateStartTime]);

  const closeStartTimePicker = useCallback(() => {
    setShowStartTimePicker(false);
  }, []);

  const handleTimerStart = useCallback(
    (timerSelection: TimerSelection) => {
      startTimer(timerSelection);
    },
    [startTimer]
  );

  const selectionFlow = useSelectionFlow({ onComplete: handleTimerStart });

  const handleStart = useCallback(() => {
    if (selection) {
      startTimer(selection);
    } else {
      selectionFlow.startFlow();
    }
  }, [selection, startTimer, selectionFlow]);

  const handleSelectionPress = useCallback(() => {
    if (!running) {
      selectionFlow.startFlow();
    }
  }, [running, selectionFlow]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      Alert.alert('Error', message);
    }
  }, [signOut]);

  if (loading) {
    return (
      <DSScreen>
        <DSLoadingIndicator fullScreen />
      </DSScreen>
    );
  }

  return (
    <DSScreen
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentStyle={{ flexGrow: 1 }}
    >
      <DSScreenHeader
        title="Time Tracker"
        action={{
          label: 'Logout',
          onPress: handleLogout,
          variant: 'ghost',
          testID: 'logout-button',
        }}
      />

      <TimerDisplay
        formattedTime={formatTime(elapsed)}
        clientName={client?.name}
        projectName={project?.name}
        taskName={task?.name}
        description={description}
        onDescriptionChange={handleDescriptionChange}
        isRunning={!!running}
      />

      {running && (
        <TouchableOpacity
          style={styles.startTimeContainer}
          onPress={() => setShowStartTimePicker(true)}
          testID="timer-start-time-button"
          accessibilityLabel="Edit start time"
          accessibilityHint="Opens time picker to change when the timer started"
        >
          <DSText 
            variant="bodySmall" 
            color="secondary"
            testID="timer-start-time-display"
          >
            Started at {formatStartTime(startedAt)} ✎
          </DSText>
        </TouchableOpacity>
      )}

      {/* Bottom Sheet Time Picker Modal */}
      <Modal
        visible={showStartTimePicker && !!running}
        transparent
        animationType="slide"
        onRequestClose={closeStartTimePicker}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            onPress={closeStartTimePicker}
            activeOpacity={1}
          />
          <View style={styles.bottomSheet} testID="timer-start-time-picker">
            <View style={styles.bottomSheetHeader}>
              <TouchableOpacity onPress={closeStartTimePicker}>
                <DSText variant="body" color="secondary">Cancel</DSText>
              </TouchableOpacity>
              <DSText variant="body" style={{ fontWeight: '600' }}>Edit Start Time</DSText>
              <TouchableOpacity onPress={closeStartTimePicker} testID="timer-start-time-picker-done">
                <DSText variant="body" color="primary">Done</DSText>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerWrapper}>
              <DateTimePicker
                value={startedAt}
                mode="time"
                display="spinner"
                onChange={handleStartTimeChange}
                themeVariant="dark"
                style={styles.picker}
              />
            </View>
          </View>
        </View>
      </Modal>

      {!running && (
        <SelectionCard selection={selection} onPress={handleSelectionPress} />
      )}

      <DSStack paddingHorizontal="xxl" paddingVertical="huge">
        {running ? (
          <DSButton
            title="Stop"
            variant="danger"
            size="lg"
            onPress={stopTimer}
            disabled={actionLoading}
            loading={actionLoading}
            testID="stop-button"
            accessibilityLabel="Stop Timer"
          />
        ) : (
          <DSButton
            title="Start"
            variant="primary"
            size="lg"
            onPress={handleStart}
            disabled={actionLoading}
            loading={actionLoading}
            testID="start-button"
            accessibilityLabel="Start Timer"
            style={{ backgroundColor: colors.success }}
          />
        )}
      </DSStack>

      <DSText
        variant="caption"
        align="center"
        style={{ paddingBottom: spacing.xl }}
        testID="user-email"
      >
        Logged in as {user?.email}
      </DSText>

      <SelectionPickerModal
        visible={selectionFlow.showPicker}
        onClose={selectionFlow.handleClose}
        onComplete={selectionFlow.handleComplete}
      />
    </DSScreen>
  );
}

const styles = StyleSheet.create({
  startTimeContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Safe area
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3a3a3c',
  },
  pickerWrapper: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  picker: {
    width: '100%',
    height: 200,
  },
});
