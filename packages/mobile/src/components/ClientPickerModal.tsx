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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { createClientRepository, type ClientRepository } from '../lib/repositories';
import { typography, spacing } from '../design-system/tokens';
import { useTheme } from '../design-system/themes/ThemeContext';

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
  const { theme } = useTheme();
  const { colors } = theme;

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
      const clientRepo = createClientRepository();
      const data = await clientRepo.findAll();
      setClients(data.map(c => ({ id: c.id, name: c.name })));
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
      const clientRepo = createClientRepository();
      const data = await clientRepo.create({ name });
      onSelect({ id: data.id, name: data.name });
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
  };

  const emptyHintStyle: TextStyle = {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
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
        testID="client-picker-modal"
      >
        <View style={headerStyle}>
          <Text style={titleStyle}>Select Client</Text>
          <TouchableOpacity onPress={onClose} testID="client-picker-close">
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
            testID="add-client-button"
          >
            <Text style={addButtonTextStyle}>
              {showAddForm ? 'Cancel' : '+ Add New Client'}
            </Text>
          </TouchableOpacity>

          {showAddForm && (
            <View style={addFormStyle} testID="add-client-form">
              <TextInput
                ref={inputRef}
                style={addInputStyle}
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
                style={[submitButtonStyle, adding && styles.submitButtonDisabled]}
                onPress={handleAdd}
                disabled={adding}
                testID="submit-new-client-button"
                accessibilityRole="button"
                accessibilityLabel="Add client"
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
          ) : clients.length === 0 && !showAddForm ? (
            <View style={styles.emptyContainer}>
              <Text style={emptyTextStyle}>No clients available</Text>
              <Text style={emptyHintStyle}>Tap "+ Add New Client" above to create one</Text>
            </View>
          ) : (
            clients.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={itemStyle}
                onPress={() => handleSelect(item)}
                testID={`client-item-${item.id}`}
              >
                <Text style={itemTextStyle}>{item.name}</Text>
                <View style={separatorStyle} />
              </TouchableOpacity>
            ))
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
  },
});
