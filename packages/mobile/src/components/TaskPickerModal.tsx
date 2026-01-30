import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { createTaskRepository, type TaskRepository } from '../lib/repositories';
import { typography, spacing } from '../design-system/tokens';
import { useTheme } from '../design-system/themes/ThemeContext';

interface Task {
  id: string;
  name: string;
}

interface TaskPickerModalProps {
  visible: boolean;
  projectId: string | null;
  onClose: () => void;
  onSelect: (task: Task) => void;
  onSkip: () => void;
}

export function TaskPickerModal({
  visible,
  projectId,
  onClose,
  onSelect,
  onSkip,
}: TaskPickerModalProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (visible && projectId) {
      fetchTasks();
      setShowAddForm(false);
      setNewName('');
    }
  }, [visible, projectId]);

  const fetchTasks = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const taskRepo = createTaskRepository();
      const data = await taskRepo.findByProjectId(projectId);
      setTasks(data.map(t => ({ id: t.id, name: t.name })));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = useCallback((task: Task) => {
    onSelect(task);
  }, [onSelect]);

  const handleAdd = useCallback(async () => {
    const name = newName.trim();
    if (!name) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }
    if (!projectId) return;

    setAdding(true);
    try {
      const taskRepo = createTaskRepository();
      const data = await taskRepo.create({ name, project_id: projectId });
      onSelect({ id: data.id, name: data.name });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add task';
      Alert.alert('Error', message);
    } finally {
      setAdding(false);
    }
  }, [newName, projectId, onSelect]);

  const toggleAddForm = useCallback(() => {
    setShowAddForm(prev => !prev);
    setNewName('');
  }, []);

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

  const titleStyle: TextStyle = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  };

  const closeButtonStyle: TextStyle = {
    color: colors.primary,
    fontSize: typography.fontSize.md,
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={containerStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        testID="task-picker-modal"
      >
        <View style={headerStyle}>
          <Text style={titleStyle}>Select Task</Text>
          <TouchableOpacity onPress={onClose} testID="task-picker-close">
            <Text style={closeButtonStyle}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            style={addButtonStyle}
            onPress={toggleAddForm}
            testID="add-task-button"
          >
            <Text style={addButtonTextStyle}>
              {showAddForm ? 'Cancel' : '+ Add New Task'}
            </Text>
          </TouchableOpacity>

          {showAddForm && (
            <View style={addFormStyle} testID="add-task-form">
              <TextInput
                style={addInputStyle}
                placeholder="Task name"
                value={newName}
                onChangeText={setNewName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAdd}
                testID="new-task-name-input"
                placeholderTextColor={colors.textMuted}
              />
              <Pressable
                style={[submitButtonStyle, adding && styles.submitButtonDisabled]}
                onPress={handleAdd}
                disabled={adding}
                testID="submit-new-task-button"
                accessibilityRole="button"
                accessibilityLabel="Add task"
              >
                {adding ? (
                  <ActivityIndicator size="small" color={colors.textOnPrimary} />
                ) : (
                  <Text style={submitButtonTextStyle}>Add</Text>
                )}
              </Pressable>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : tasks.length === 0 && !showAddForm ? (
            <View style={styles.emptyContainer}>
              <Text style={emptyTextStyle}>No tasks for this project</Text>
              <Text style={emptyHintStyle}>Add a task above or skip</Text>
              <TouchableOpacity style={styles.skipButton} onPress={onSkip} testID="task-skip">
                <Text style={skipButtonTextStyle}>Continue without task</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {tasks.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={itemStyle}
                  onPress={() => handleSelect(item)}
                  testID={`task-item-${item.id}`}
                >
                  <Text style={itemTextStyle}>{item.name}</Text>
                  <View style={separatorStyle} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={footerSkipStyle} onPress={onSkip} testID="task-skip">
                <Text style={skipButtonTextStyle}>Skip</Text>
              </TouchableOpacity>
            </>
          )}
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  skipButton: {
    padding: spacing.md,
  },
});
