import { useState, useCallback } from 'react';
import { TimerSelection } from '../types/timer';

interface UseSelectionFlowOptions {
  onComplete: (selection: TimerSelection) => void;
}

export function useSelectionFlow({ onComplete }: UseSelectionFlowOptions) {
  const [showPicker, setShowPicker] = useState(false);

  const startFlow = useCallback(() => {
    setShowPicker(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowPicker(false);
  }, []);

  const handleComplete = useCallback(
    (selection: TimerSelection) => {
      setShowPicker(false);
      onComplete(selection);
    },
    [onComplete]
  );

  return {
    // Modal visibility
    showPicker,

    // Actions
    startFlow,
    handleClose,
    handleComplete,
  };
}
