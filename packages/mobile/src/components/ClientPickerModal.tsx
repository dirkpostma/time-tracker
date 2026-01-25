import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, typography, spacing } from '../design-system/tokens';

interface Client {
  id: string;
  name: string;
}

interface ClientPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (client: Client) => void;
}

export function ClientPickerModal({ visible, onClose, onSelect }: ClientPickerModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      fetchClients();
      setShowAddForm(false);
      setNewName('');
    }
  }, [visible]);

  const fetchClients = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleSelect = useCallback((client: Client) => {
    onSelect(client);
  }, [onSelect]);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) {
      Alert.alert('Error', 'Please enter a client name');
      return;
    }

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({ name })
        .select('id, name')
        .single();

      if (error) throw error;
      if (data) {
        onSelect(data);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add client';
      Alert.alert('Error', message);
    } finally {
      setAdding(false);
    }
  };

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
      <View style={styles.container} testID="client-picker-modal">
        <View style={styles.header}>
          <Text style={styles.title}>Select Client</Text>
          <TouchableOpacity onPress={onClose} testID="client-picker-close">
            <Text style={styles.closeButton}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={toggleAddForm}
          testID="add-client-button"
        >
          <Text style={styles.addButtonText}>
            {showAddForm ? 'Cancel' : '+ Add New Client'}
          </Text>
        </TouchableOpacity>

        {showAddForm && (
          <View style={styles.addForm} testID="add-client-form">
            <TextInput
              ref={inputRef}
              style={styles.addInput}
              placeholder="Client name"
              value={newName}
              onChangeText={setNewName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              testID="new-client-name-input"
              placeholderTextColor={colors.textMuted}
            />
            <Pressable
              style={[styles.submitButton, adding && styles.submitButtonDisabled]}
              onPress={handleAdd}
              disabled={adding}
              testID="submit-new-client-button"
              accessibilityRole="button"
              accessibilityLabel="Add client"
            >
              {adding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Add</Text>
              )}
            </Pressable>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : clients.length === 0 && !showAddForm ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No clients available</Text>
            <Text style={styles.emptyHint}>Tap "+ Add New Client" above to create one</Text>
          </View>
        ) : (
          <FlatList
            data={clients}
            keyExtractor={(item) => item.id}
            testID="client-list"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
                testID={`client-item-${item.id}`}
              >
                <Text style={styles.itemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
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
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
  },
  emptyHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
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
});
