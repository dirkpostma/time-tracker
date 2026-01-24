import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
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

  useEffect(() => {
    if (visible && projectId) {
      fetchTasks();
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

  const handleSelect = (task: Task) => {
    onSelect(task);
  };

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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks for this project</Text>
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
