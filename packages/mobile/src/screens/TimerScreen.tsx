import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import {
  DSButton,
  DSText,
  DSLoadingIndicator,
  DSScreen,
  DSScreenHeader,
  DSStack,
  DSTimePicker,
  colors,
  spacing,
} from '../design-system';
import { SelectionPickerModal } from '../components/SelectionPickerModal';
import { TimerDisplay } from '../components/TimerDisplay';
import { SelectionCard } from '../components/SelectionCard';
import { SwitchCard } from '../components/SwitchCard';
import { DescriptionInput } from '../components/DescriptionInput';
import { useTimer } from '../hooks/useTimer';
import { useSelectionFlow } from '../hooks/useSelectionFlow';
import { TimerSelection } from '../types/timer';

export function TimerScreen() {
  const { user, signOut } = useAuth();

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
    switchTimer,
    updateStartTime,
    onRefresh,
    handleDescriptionChange,
    formatTime,
  } = useTimer();

  const startedAt = running ? new Date(running.started_at) : new Date();

  const handleStartTimeChange = useCallback(async (newDate: Date) => {
    await updateStartTime(newDate);
  }, [updateStartTime]);

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

  // Handle switch timer flow
  const handleSwitchComplete = useCallback(
    async (newSelection: TimerSelection) => {
      // Check if switching to the same selection
      const isSameSelection =
        running?.client_id === newSelection.clientId &&
        running?.project_id === newSelection.projectId &&
        running?.task_id === newSelection.taskId;

      if (isSameSelection) {
        // No switch needed
        return;
      }

      // Switch directly - user already confirmed by going through selection flow
      await switchTimer(newSelection);
    },
    [running, switchTimer]
  );

  const switchFlow = useSelectionFlow({ onComplete: handleSwitchComplete });

  const handleSwitchPress = useCallback(() => {
    if (running) {
      switchFlow.startFlow();
    }
  }, [running, switchFlow]);

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
      />

      {running && (
        <DSStack paddingHorizontal="lg">
          <DescriptionInput
            value={description}
            onChangeText={handleDescriptionChange}
            editable={true}
          />
        </DSStack>
      )}

      {running && (
        <DSStack paddingHorizontal="lg" style={styles.startTimeContainer}>
          <DSTimePicker
            value={startedAt}
            onChange={handleStartTimeChange}
            label="Started at"
            testID="timer-start-time"
            maximumDate={new Date()}
          />
        </DSStack>
      )}

      {running && (
        <DSStack paddingHorizontal="lg">
          <SwitchCard onPress={handleSwitchPress} disabled={actionLoading} />
        </DSStack>
      )}

      {!running && (
        <DSStack paddingHorizontal="lg">
          <SelectionCard selection={selection} onPress={handleSelectionPress} />
        </DSStack>
      )}

      <DSStack paddingHorizontal="lg" paddingVertical="huge">
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

      <SelectionPickerModal
        visible={switchFlow.showPicker}
        onClose={switchFlow.handleClose}
        onComplete={switchFlow.handleComplete}
      />
    </DSScreen>
  );
}

const styles = StyleSheet.create({
  startTimeContainer: {
    marginTop: spacing.md,
  },
});
