import React, { useCallback } from 'react';
import { Alert } from 'react-native';
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
    onRefresh,
    handleDescriptionChange,
    formatTime,
  } = useTimer();

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
