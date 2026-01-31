import React from 'react';
import { DSCard, DSText, DSStack, DSPressable, spacing } from '../design-system';
import { RecentSelection } from '../lib/storage';

interface SelectionCardProps {
  selection: RecentSelection | null;
  onPress: () => void;
}

export function SelectionCard({ selection, onPress }: SelectionCardProps) {
  return (
    <DSPressable onPress={onPress} testID="selection-button">
      <DSCard
        variant="flat"
        style={{ marginBottom: spacing.lg }}
      >
        {selection ? (
          <DSStack align="center">
            <DSText variant="caption">Selected:</DSText>
            <DSText variant="body" weight="semibold" testID="selected-client">
              {selection.clientName}
            </DSText>
            {selection.projectName && (
              <DSText variant="bodySmall" testID="selected-project">
                {selection.projectName}
              </DSText>
            )}
            {selection.taskName && (
              <DSText variant="bodySmall" color="tertiary" testID="selected-task">
                {selection.taskName}
              </DSText>
            )}
          </DSStack>
        ) : (
          <DSText variant="bodySmall" color="muted" align="center">
            Tap to select client...
          </DSText>
        )}
      </DSCard>
    </DSPressable>
  );
}
