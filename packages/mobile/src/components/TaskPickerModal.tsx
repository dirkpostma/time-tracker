import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, typography, spacing } from '../design-system/tokens';

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
      const { data, error } = await supabase
        .from('tasks')
        .insert({ name, project_id: projectId })
        .select('id, name')
        .single();

      if (error) throw error;
      if (data) {
        onSelect(data);
      }
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container} testID="task-picker-modal">
        <View style={styles.header}>
          <Text style={styles.title}>Select Task</Text>
          <TouchableOpacity onPress={onClose} testID="task-picker-close">
            <Text style={styles.closeButton}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={toggleAddForm}
          testID="add-task-button"
        >
          <Text style={styles.addButtonText}>
            {showAddForm ? 'Cancel' : '+ Add New Task'}
          </Text>
        </TouchableOpacity>

        {showAddForm && (
          <View style={styles.addForm} testID="add-task-form">
            <TextInput
              style={styles.addInput}
              placeholder="Task name"
              value={newName}
              onChangeText={setNewName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              testID="new-task-name-input"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity
              style={[styles.submitButton, adding && styles.submitButtonDisabled]}
              onPress={handleAdd}
              disabled={adding}
              testID="submit-new-task-button"
              accessibilityRole="button"
              accessibilityLabel="Add task"
            >
              {adding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : tasks.length === 0 && !showAddForm ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks for this project</Text>
            <Text style={styles.emptyHint}>Add a task above or skip</Text>
            <TouchableOpacity style={styles.skipButton} onPress={onSkip} testID="task-skip">
              <Text style={styles.skipButtonText}>Continue without task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              testID="task-list"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelect(item)}
                  testID={`task-item-${item.id}`}
                >
                  <Text style={styles.itemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <TouchableOpacity style={styles.footerSkip} onPress={onSkip} testID="task-skip">
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  closeButton: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
  },
  addButton: {
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  addButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  addForm: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: 'center',
    gap: spacing.sm,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
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
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  skipButton: {
    padding: spacing.md,
  },
  skipButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
  },
  item: {
    padding: spacing.lg,
  },
  itemText: {
    fontSize: typography.fontSize.md,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  footerSkip: {
    padding: spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  skipText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
  },
});
