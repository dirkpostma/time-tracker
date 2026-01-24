import React from 'react';
import { DSText, DSCenter, DSSpacer } from '../design-system';
import { DescriptionInput } from './DescriptionInput';

interface TimerDisplayProps {
  formattedTime: string;
  clientName?: string;
  description: string;
  onDescriptionChange: (text: string) => void;
  isRunning: boolean;
}

export function TimerDisplay({
  formattedTime,
  clientName,
  description,
  onDescriptionChange,
  isRunning,
}: TimerDisplayProps) {
  return (
    <DSCenter>
      <DSText variant="timer" testID="timer-display" accessibilityLabel="Timer">
        {formattedTime}
      </DSText>
      {clientName && (
        <>
          <DSSpacer size="lg" />
          <DSText variant="body" color="secondary" testID="client-name">
            {clientName}
          </DSText>
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
