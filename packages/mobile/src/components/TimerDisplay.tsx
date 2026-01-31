import React from 'react';
import { DSText, DSCenter, DSSpacer } from '../design-system';

interface TimerDisplayProps {
  formattedTime: string;
  clientName?: string;
  projectName?: string;
  taskName?: string;
}

export function TimerDisplay({
  formattedTime,
  clientName,
  projectName,
  taskName,
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
    </DSCenter>
  );
}
