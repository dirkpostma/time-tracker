import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
  Button,
} from 'react-native';
import { StoryWrapper } from '../StoryWrapper';
import { colors, typography, spacing } from '../../tokens';

interface Client {
  id: string;
  name: string;
}

// Isolated AddClient form that mimics the real ClientPickerModal behavior
function AddClientFormIsolated() {
  const [clients, setClients] = useState<Client[]>([
    { id: '1', name: 'Existing Client 1' },
    { id: '2', name: 'Existing Client 2' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) {
      Alert.alert('Error', 'Please enter a client name');
      return;
    }

    setAdding(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const newClient: Client = {
      id: Date.now().toString(),
      name,
    };

    setClients(prev => [...prev, newClient]);
    setSelectedClient(newClient);
    setNewName('');
    setShowForm(false);
    setAdding(false);

    Alert.alert('Success', `Client "${name}" created and selected!`);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    setNewName('');
  };

  return (
    <View style={styles.container} testID="add-client-story">
      <Text style={styles.title}>Select Client</Text>

      {/* Toggle add form button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={toggleForm}
        testID="add-client-button"
      >
        <Text style={styles.toggleButtonText}>
          {showForm ? 'Cancel' : '+ Add New Client'}
        </Text>
      </TouchableOpacity>

      {/* Add form */}
      {showForm && (
        <View style={styles.form} testID="add-client-form">
          <TextInput
            style={styles.input}
            placeholder="Client name"
            value={newName}
            onChangeText={setNewName}
            testID="new-client-name-input"
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
          <View testID="submit-new-client-button">
            <Button
              title={adding ? '...' : 'Add'}
              onPress={handleAdd}
              disabled={adding}
            />
          </View>
        </View>
      )}

      {/* Client list */}
      <View style={styles.list}>
        {clients.map(client => (
          <TouchableOpacity
            key={client.id}
            style={[
              styles.clientItem,
              selectedClient?.id === client.id && styles.clientItemSelected,
            ]}
            onPress={() => setSelectedClient(client)}
            testID={`client-item-${client.id}`}
          >
            <Text style={styles.clientText}>{client.name}</Text>
            {selectedClient?.id === client.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected display */}
      <View style={styles.selectedDisplay} testID="selected-display">
        <Text style={styles.selectedLabel}>Selected:</Text>
        <Text style={styles.selectedValue} testID="selected-client-name">
          {selectedClient?.name || 'None'}
        </Text>
      </View>
    </View>
  );
}

export const AddClientStories = {
  Default: () => (
    <StoryWrapper title="Add Client Form" description="Test the add client workflow">
      <AddClientFormIsolated />
    </StoryWrapper>
  ),
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  toggleButton: {
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  toggleButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  form: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
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
  list: {
    maxHeight: 200,
  },
  clientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  clientItemSelected: {
    backgroundColor: colors.primaryLight || '#e6f0ff',
  },
  clientText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  checkmark: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
  },
  selectedDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    gap: spacing.sm,
  },
  selectedLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  selectedValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
});
