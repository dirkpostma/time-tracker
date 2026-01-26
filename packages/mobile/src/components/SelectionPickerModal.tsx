import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { typography, spacing } from '../design-system/tokens';
import { useTheme } from '../design-system/themes/ThemeContext';
import { Client, Project, Task, TimerSelection } from '../types/timer';

type Step = 'client' | 'project' | 'task';

interface SelectionPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (selection: TimerSelection) => void;
}

export function SelectionPickerModal({
  visible,
  onClose,
  onComplete,
}: SelectionPickerModalProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('client');

  // Selection state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Loading state
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentStep('client');
      setSelectedClient(null);
      setSelectedProject(null);
      setShowAddForm(false);
      setNewName('');
      fetchClients();
    }
  }, [visible]);

  // Fetch clients
  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  // Fetch projects for selected client
  const fetchProjects = async (clientId: string) => {
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('client_id', clientId)
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fetch tasks for selected project
  const fetchTasks = async (projectId: string) => {
    setLoadingTasks(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, name')
        .eq('project_id', projectId)
        .order('name');

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Step navigation
  const goToStep = (step: Step) => {
    setShowAddForm(false);
    setNewName('');
    setCurrentStep(step);
  };

  // Handle client selection
  const handleClientSelect = useCallback((client: Client) => {
    setSelectedClient(client);
    setSelectedProject(null);
    setProjects([]);
    setTasks([]);
    fetchProjects(client.id);
    goToStep('project');
  }, []);

  // Handle project selection
  const handleProjectSelect = useCallback((project: Project) => {
    setSelectedProject(project);
    setTasks([]);
    fetchTasks(project.id);
    goToStep('task');
  }, []);

  // Handle project skip
  const handleProjectSkip = useCallback(() => {
    if (selectedClient) {
      onComplete({
        clientId: selectedClient.id,
        clientName: selectedClient.name,
      });
    }
  }, [selectedClient, onComplete]);

  // Handle task selection
  const handleTaskSelect = useCallback((task: Task) => {
    if (selectedClient && selectedProject) {
      onComplete({
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        taskId: task.id,
        taskName: task.name,
      });
    }
  }, [selectedClient, selectedProject, onComplete]);

  // Handle task skip
  const handleTaskSkip = useCallback(() => {
    if (selectedClient && selectedProject) {
      onComplete({
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
      });
    }
  }, [selectedClient, selectedProject, onComplete]);

  // Handle add new item
  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) {
      Alert.alert('Error', `Please enter a ${currentStep} name`);
      return;
    }

    setAdding(true);
    try {
      if (currentStep === 'client') {
        const { data, error } = await supabase
          .from('clients')
          .insert({ name })
          .select('id, name')
          .single();

        if (error) throw error;
        if (data) {
          handleClientSelect(data);
        }
      } else if (currentStep === 'project' && selectedClient) {
        const { data, error } = await supabase
          .from('projects')
          .insert({ name, client_id: selectedClient.id })
          .select('id, name')
          .single();

        if (error) throw error;
        if (data) {
          handleProjectSelect(data);
        }
      } else if (currentStep === 'task' && selectedProject) {
        const { data, error } = await supabase
          .from('tasks')
          .insert({ name, project_id: selectedProject.id })
          .select('id, name')
          .single();

        if (error) throw error;
        if (data) {
          handleTaskSelect(data);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to add ${currentStep}`;
      Alert.alert('Error', message);
    } finally {
      setAdding(false);
      setNewName('');
      setShowAddForm(false);
    }
  };

  const toggleAddForm = useCallback(() => {
    setShowAddForm(prev => !prev);
    setNewName('');
  }, []);

  // Go back to previous step
  const handleBack = useCallback(() => {
    setShowAddForm(false);
    setNewName('');
    if (currentStep === 'project') {
      goToStep('client');
    } else if (currentStep === 'task') {
      goToStep('project');
    }
  }, [currentStep]);

  // Handle close - reset everything
  const handleClose = useCallback(() => {
    setCurrentStep('client');
    setSelectedClient(null);
    setSelectedProject(null);
    setShowAddForm(false);
    setNewName('');
    onClose();
  }, [onClose]);

  // Styles
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  };

  const headerLeftStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  };

  const backButtonStyle: TextStyle = {
    color: colors.primary,
    fontSize: typography.fontSize.md,
  };

  const titleStyle: TextStyle = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  };

  const closeButtonStyle: TextStyle = {
    color: colors.primary,
    fontSize: typography.fontSize.md,
  };

  const stepIndicatorStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  };

  const stepDotStyle = (isActive: boolean, isPast: boolean): ViewStyle => ({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: isActive ? colors.primary : isPast ? colors.primary : colors.borderLight,
    opacity: isActive ? 1 : isPast ? 0.5 : 1,
  });

  const stepLineStyle = (isPast: boolean): ViewStyle => ({
    width: 24,
    height: 2,
    backgroundColor: isPast ? colors.primary : colors.borderLight,
    opacity: isPast ? 0.5 : 1,
  });

  const breadcrumbStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    gap: spacing.xs,
  };

  const breadcrumbTextStyle: TextStyle = {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  };

  const breadcrumbActiveStyle: TextStyle = {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  };

  const chevronStyle: TextStyle = {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  };

  const addButtonStyle: ViewStyle = {
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  };

  const addButtonTextStyle: TextStyle = {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  };

  const addFormStyle: ViewStyle = {
    flexDirection: 'row',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: 'center',
    gap: spacing.sm,
  };

  const addInputStyle: TextStyle = {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  };

  const submitButtonStyle: ViewStyle = {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 60,
    alignItems: 'center',
  };

  const submitButtonTextStyle: TextStyle = {
    color: colors.textOnPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  };

  const emptyTextStyle: TextStyle = {
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  };

  const emptyHintStyle: TextStyle = {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  };

  const skipButtonTextStyle: TextStyle = {
    color: colors.primary,
    fontSize: typography.fontSize.md,
  };

  const itemStyle: ViewStyle = {
    padding: spacing.lg,
  };

  const itemTextStyle: TextStyle = {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  };

  const separatorStyle: ViewStyle = {
    height: 1,
    backgroundColor: colors.borderLight,
  };

  const footerSkipStyle: ViewStyle = {
    padding: spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'client':
        return 'Select Client';
      case 'project':
        return 'Select Project';
      case 'task':
        return 'Select Task';
    }
  };

  const getAddLabel = () => {
    switch (currentStep) {
      case 'client':
        return showAddForm ? 'Cancel' : '+ Add New Client';
      case 'project':
        return showAddForm ? 'Cancel' : '+ Add New Project';
      case 'task':
        return showAddForm ? 'Cancel' : '+ Add New Task';
    }
  };

  const getAddTestId = () => {
    switch (currentStep) {
      case 'client':
        return 'add-client-button';
      case 'project':
        return 'add-project-button';
      case 'task':
        return 'add-task-button';
    }
  };

  const getInputTestId = () => {
    switch (currentStep) {
      case 'client':
        return 'new-client-name-input';
      case 'project':
        return 'new-project-name-input';
      case 'task':
        return 'new-task-name-input';
    }
  };

  const getSubmitTestId = () => {
    switch (currentStep) {
      case 'client':
        return 'submit-new-client-button';
      case 'project':
        return 'submit-new-project-button';
      case 'task':
        return 'submit-new-task-button';
    }
  };

  const getSubmitLabel = () => {
    switch (currentStep) {
      case 'client':
        return 'Add client';
      case 'project':
        return 'Add project';
      case 'task':
        return 'Add task';
    }
  };

  const isStepActive = (step: Step) => currentStep === step;
  const isStepPast = (step: Step) => {
    if (step === 'client') return currentStep !== 'client';
    if (step === 'project') return currentStep === 'task';
    return false;
  };

  const renderStepContent = (step: Step) => {
    const isCurrentStep = currentStep === step;
    let items: { id: string; name: string }[] = [];
    let loading = false;
    let onSelect: (item: { id: string; name: string }) => void = () => {};
    let onSkip: (() => void) | null = null;
    let emptyMessage = '';
    let emptyHint = '';
    let itemTestIdPrefix = '';
    let skipTestId = '';

    switch (step) {
      case 'client':
        items = clients;
        loading = loadingClients;
        onSelect = handleClientSelect;
        emptyMessage = 'No clients available';
        emptyHint = 'Tap "+ Add New Client" above to create one';
        itemTestIdPrefix = 'client-item';
        break;
      case 'project':
        items = projects;
        loading = loadingProjects;
        onSelect = handleProjectSelect;
        onSkip = handleProjectSkip;
        emptyMessage = 'No projects for this client';
        emptyHint = 'Add a project above or skip';
        itemTestIdPrefix = 'project-item';
        skipTestId = 'project-skip';
        break;
      case 'task':
        items = tasks;
        loading = loadingTasks;
        onSelect = handleTaskSelect;
        onSkip = handleTaskSkip;
        emptyMessage = 'No tasks for this project';
        emptyHint = 'Add a task above or skip';
        itemTestIdPrefix = 'task-item';
        skipTestId = 'task-skip';
        break;
    }

    return (
      <View>
        {/* Add button */}
        {isCurrentStep && (
          <TouchableOpacity
            style={addButtonStyle}
            onPress={toggleAddForm}
            testID={getAddTestId()}
          >
            <Text style={addButtonTextStyle}>{getAddLabel()}</Text>
          </TouchableOpacity>
        )}

        {/* Add form */}
        {isCurrentStep && showAddForm && (
          <View style={addFormStyle} testID={`add-${step}-form`}>
            <TextInput
              style={addInputStyle}
              placeholder={`${step.charAt(0).toUpperCase() + step.slice(1)} name`}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              testID={getInputTestId()}
              placeholderTextColor={colors.textMuted}
            />
            <Pressable
              style={[submitButtonStyle, adding && styles.submitButtonDisabled]}
              onPress={handleAdd}
              disabled={adding}
              testID={getSubmitTestId()}
              accessibilityRole="button"
              accessibilityLabel={getSubmitLabel()}
            >
              {adding ? (
                <ActivityIndicator size="small" color={colors.textOnPrimary} />
              ) : (
                <Text style={submitButtonTextStyle}>Add</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : items.length === 0 && !showAddForm ? (
          <View style={styles.emptyContainer}>
            <Text style={emptyTextStyle}>{emptyMessage}</Text>
            <Text style={emptyHintStyle}>{emptyHint}</Text>
            {onSkip && (
              <TouchableOpacity style={styles.skipButton} onPress={onSkip} testID={skipTestId}>
                <Text style={skipButtonTextStyle}>Continue without {step}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={itemStyle}
                onPress={() => onSelect(item)}
                testID={`${itemTestIdPrefix}-${item.id}`}
              >
                <Text style={itemTextStyle}>{item.name}</Text>
                <View style={separatorStyle} />
              </TouchableOpacity>
            ))}
            {onSkip && items.length > 0 && (
              <TouchableOpacity style={footerSkipStyle} onPress={onSkip} testID={skipTestId}>
                <Text style={skipButtonTextStyle}>Skip</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={containerStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        testID="selection-picker-modal"
      >
        {/* Header */}
        <View style={headerStyle}>
          <View style={headerLeftStyle}>
            {currentStep !== 'client' && (
              <TouchableOpacity onPress={handleBack} testID="selection-picker-back">
                <Text style={backButtonStyle}>← Back</Text>
              </TouchableOpacity>
            )}
            <Text style={titleStyle}>{getStepTitle()}</Text>
          </View>
          <TouchableOpacity onPress={handleClose} testID="selection-picker-close">
            <Text style={closeButtonStyle}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Step indicator */}
        <View style={stepIndicatorStyle} testID="step-indicator">
          <View style={stepDotStyle(isStepActive('client'), isStepPast('client'))} />
          <View style={stepLineStyle(isStepPast('client'))} />
          <View style={stepDotStyle(isStepActive('project'), isStepPast('project'))} />
          <View style={stepLineStyle(isStepPast('project'))} />
          <View style={stepDotStyle(isStepActive('task'), isStepPast('task'))} />
        </View>

        {/* Breadcrumb showing selections */}
        {(selectedClient || selectedProject) && (
          <View style={breadcrumbStyle} testID="selection-breadcrumb">
            {selectedClient && (
              <>
                <Text
                  style={currentStep === 'client' ? breadcrumbActiveStyle : breadcrumbTextStyle}
                  testID="breadcrumb-client"
                >
                  {selectedClient.name}
                </Text>
                {selectedProject && <Text style={chevronStyle}>›</Text>}
              </>
            )}
            {selectedProject && (
              <Text
                style={currentStep === 'project' ? breadcrumbActiveStyle : breadcrumbTextStyle}
                testID="breadcrumb-project"
              >
                {selectedProject.name}
              </Text>
            )}
          </View>
        )}

        {/* Step content */}
        <ScrollView
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {renderStepContent(currentStep)}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  skipButton: {
    padding: 12,
  },
});
