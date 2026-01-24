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

  useEffect(() => {
    if (visible) {
      fetchClients();
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

  const handleSelect = (client: Client) => {
    onSelect(client);
  };

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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : clients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No clients available</Text>
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
