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

interface Project {
  id: string;
  name: string;
}

interface ProjectPickerModalProps {
  visible: boolean;
  clientId: string | null;
  onClose: () => void;
  onSelect: (project: Project) => void;
  onSkip: () => void;
}

export function ProjectPickerModal({
  visible,
  clientId,
  onClose,
  onSelect,
  onSkip,
}: ProjectPickerModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (visible && clientId) {
      fetchProjects();
      setShowAddForm(false);
      setNewName('');
    }
  }, [visible, clientId]);

  const fetchProjects = async () => {
    if (!clientId) return;

    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleSelect = useCallback((project: Project) => {
    onSelect(project);
  }, [onSelect]);

  const handleAdd = useCallback(async () => {
    const name = newName.trim();
    if (!name) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }
    if (!clientId) return;

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({ name, client_id: clientId })
        .select('id, name')
        .single();

      if (error) throw error;
      if (data) {
        onSelect(data);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add project';
      Alert.alert('Error', message);
    } finally {
      setAdding(false);
    }
  }, [newName, clientId, onSelect]);

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
      <View style={styles.container} testID="project-picker-modal">
        <View style={styles.header}>
          <Text style={styles.title}>Select Project</Text>
          <TouchableOpacity onPress={onClose} testID="project-picker-close">
            <Text style={styles.closeButton}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={toggleAddForm}
          testID="add-project-button"
        >
          <Text style={styles.addButtonText}>
            {showAddForm ? 'Cancel' : '+ Add New Project'}
          </Text>
        </TouchableOpacity>

        {showAddForm && (
          <View style={styles.addForm} testID="add-project-form">
            <TextInput
              style={styles.addInput}
              placeholder="Project name"
              value={newName}
              onChangeText={setNewName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              testID="new-project-name-input"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity
              style={[styles.submitButton, adding && styles.submitButtonDisabled]}
              onPress={handleAdd}
              disabled={adding}
              testID="submit-new-project-button"
              accessibilityRole="button"
              accessibilityLabel="Add project"
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
        ) : projects.length === 0 && !showAddForm ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No projects for this client</Text>
            <Text style={styles.emptyHint}>Add a project above or skip</Text>
            <TouchableOpacity style={styles.skipButton} onPress={onSkip} testID="project-skip">
              <Text style={styles.skipButtonText}>Continue without project</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={projects}
              keyExtractor={(item) => item.id}
              testID="project-list"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelect(item)}
                  testID={`project-item-${item.id}`}
                >
                  <Text style={styles.itemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <TouchableOpacity style={styles.footerSkip} onPress={onSkip} testID="project-skip">
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
