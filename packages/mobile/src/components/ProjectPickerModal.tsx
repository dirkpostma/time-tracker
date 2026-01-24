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

  useEffect(() => {
    if (visible && clientId) {
      fetchProjects();
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

  const handleSelect = (project: Project) => {
    onSelect(project);
  };

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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No projects for this client</Text>
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
