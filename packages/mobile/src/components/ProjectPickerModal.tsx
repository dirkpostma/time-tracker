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
import { createProjectRepository, type ProjectRepository } from '../lib/repositories';
import { typography, spacing } from '../design-system/tokens';
import { useTheme } from '../design-system/themes/ThemeContext';

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
  const { theme } = useTheme();
  const { colors } = theme;

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
      const projectRepo = createProjectRepository();
      const data = await projectRepo.findByClientId(clientId);
      setProjects(data.map(p => ({ id: p.id, name: p.name })));
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
      const projectRepo = createProjectRepository();
      const data = await projectRepo.create({ name, client_id: clientId });
      onSelect({ id: data.id, name: data.name });
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
        testID="project-picker-modal"
      >
        <View style={headerStyle}>
          <Text style={titleStyle}>Select Project</Text>
          <TouchableOpacity onPress={onClose} testID="project-picker-close">
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
            testID="add-project-button"
          >
            <Text style={addButtonTextStyle}>
              {showAddForm ? 'Cancel' : '+ Add New Project'}
            </Text>
          </TouchableOpacity>

          {showAddForm && (
            <View style={addFormStyle} testID="add-project-form">
              <TextInput
                style={addInputStyle}
                placeholder="Project name"
                value={newName}
                onChangeText={setNewName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAdd}
                testID="new-project-name-input"
                placeholderTextColor={colors.textMuted}
              />
              <Pressable
                style={[submitButtonStyle, adding && styles.submitButtonDisabled]}
                onPress={handleAdd}
                disabled={adding}
                testID="submit-new-project-button"
                accessibilityRole="button"
                accessibilityLabel="Add project"
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
          ) : projects.length === 0 && !showAddForm ? (
            <View style={styles.emptyContainer}>
              <Text style={emptyTextStyle}>No projects for this client</Text>
              <Text style={emptyHintStyle}>Add a project above or skip</Text>
              <TouchableOpacity style={styles.skipButton} onPress={onSkip} testID="project-skip">
                <Text style={skipButtonTextStyle}>Continue without project</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {projects.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={itemStyle}
                  onPress={() => handleSelect(item)}
                  testID={`project-item-${item.id}`}
                >
                  <Text style={itemTextStyle}>{item.name}</Text>
                  <View style={separatorStyle} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={footerSkipStyle} onPress={onSkip} testID="project-skip">
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
