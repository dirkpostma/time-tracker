import React from 'react';
import { DSText, DSCenter, DSSpacer } from '../design-system';
import { DescriptionInput } from './DescriptionInput';

interface TimerDisplayProps {
  formattedTime: string;
  clientName?: string;
  projectName?: string;
  taskName?: string;
  description: string;
  onDescriptionChange: (text: string) => void;
  isRunning: boolean;
}

export function TimerDisplay({
  formattedTime,
  clientName,
  projectName,
  taskName,
  description,
  onDescriptionChange,
  isRunning,
}: TimerDisplayProps) {
  const hasContext = clientName || projectName || taskName;

  return (
    <DSCenter>
      <DSText variant="timer" testID="timer-display" accessibilityLabel="Timer">
        {formattedTime}
      </DSText>
      {hasContext && (
        <>
          <DSSpacer size="lg" />
          <DSText variant="body" color="secondary" testID="client-name">
            {clientName}
          </DSText>
          {projectName && (
            <>
              <DSSpacer size="xs" />
              <DSText variant="bodySmall" color="tertiary" testID="project-name">
                {projectName}
              </DSText>
            </>
          )}
          {taskName && (
            <>
              <DSSpacer size="xs" />
              <DSText variant="caption" color="tertiary" testID="task-name">
                {taskName}
              </DSText>
            </>
          )}
        </>
      )}
      <DescriptionInput
        value={description}
        onChangeText={onDescriptionChange}
        editable={isRunning}
      />
    </DSCenter>
  );
}
