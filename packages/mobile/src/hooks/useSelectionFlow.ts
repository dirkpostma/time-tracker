import { useState, useCallback } from 'react';
import { Client, Project, Task, TimerSelection } from '../types/timer';

interface UseSelectionFlowOptions {
  onComplete: (selection: TimerSelection) => void;
}

export function useSelectionFlow({ onComplete }: UseSelectionFlowOptions) {
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [pendingClient, setPendingClient] = useState<Client | null>(null);
  const [pendingProject, setPendingProject] = useState<Project | null>(null);

  const startFlow = useCallback(() => {
    setShowClientPicker(true);
  }, []);

  const reset = useCallback(() => {
    setShowClientPicker(false);
    setShowProjectPicker(false);
    setShowTaskPicker(false);
    setPendingClient(null);
    setPendingProject(null);
  }, []);

  // Client picker handlers
  const handleClientSelect = useCallback((selectedClient: Client) => {
    setPendingClient(selectedClient);
    setShowClientPicker(false);
    setShowProjectPicker(true);
  }, []);

  const handleClientPickerClose = useCallback(() => {
    setShowClientPicker(false);
    setPendingClient(null);
  }, []);

  // Project picker handlers
  const handleProjectSelect = useCallback((selectedProject: Project) => {
    setPendingProject(selectedProject);
    setShowProjectPicker(false);
    setShowTaskPicker(true);
  }, []);

  const handleProjectSkip = useCallback(() => {
    setShowProjectPicker(false);
    if (pendingClient) {
      onComplete({
        clientId: pendingClient.id,
        clientName: pendingClient.name,
      });
    }
    reset();
  }, [pendingClient, onComplete, reset]);

  const handleProjectPickerClose = useCallback(() => {
    setShowProjectPicker(false);
    setPendingClient(null);
    setPendingProject(null);
  }, []);

  // Task picker handlers
  const handleTaskSelect = useCallback(
    (selectedTask: Task) => {
      setShowTaskPicker(false);
      if (pendingClient && pendingProject) {
        onComplete({
          clientId: pendingClient.id,
          clientName: pendingClient.name,
          projectId: pendingProject.id,
          projectName: pendingProject.name,
          taskId: selectedTask.id,
          taskName: selectedTask.name,
        });
      }
      reset();
    },
    [pendingClient, pendingProject, onComplete, reset]
  );

  const handleTaskSkip = useCallback(() => {
    setShowTaskPicker(false);
    if (pendingClient && pendingProject) {
      onComplete({
        clientId: pendingClient.id,
        clientName: pendingClient.name,
        projectId: pendingProject.id,
        projectName: pendingProject.name,
      });
    }
    reset();
  }, [pendingClient, pendingProject, onComplete, reset]);

  const handleTaskPickerClose = useCallback(() => {
    setShowTaskPicker(false);
    setPendingClient(null);
    setPendingProject(null);
  }, []);

  return {
    // Modal visibility
    showClientPicker,
    showProjectPicker,
    showTaskPicker,

    // Pending selections (for modal props)
    pendingClient,
    pendingProject,

    // Actions
    startFlow,
    reset,

    // Client handlers
    handleClientSelect,
    handleClientPickerClose,

    // Project handlers
    handleProjectSelect,
    handleProjectSkip,
    handleProjectPickerClose,

    // Task handlers
    handleTaskSelect,
    handleTaskSkip,
    handleTaskPickerClose,
  };
}
