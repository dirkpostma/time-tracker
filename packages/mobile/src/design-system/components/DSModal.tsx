import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ModalProps,
} from 'react-native';
import { colors, typography, spacing, componentTokens } from '../tokens';

export interface DSModalProps extends Omit<ModalProps, 'children'> {
  title: string;
  onClose: () => void;
  closeText?: string;
  children: React.ReactNode;
  testID?: string;
}

export function DSModal({
  title,
  onClose,
  closeText = 'Cancel',
  children,
  testID,
  visible,
  ...props
}: DSModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      {...props}
    >
      <SafeAreaView style={styles.container} testID={testID}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} testID={testID ? `${testID}-close` : undefined}>
            <Text style={styles.closeButton}>{closeText}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    </Modal>
  );
}

// Sub-components for common modal patterns
DSModal.LoadingState = function ModalLoadingState({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={styles.centeredContent}>{children}</View>;
};

DSModal.EmptyState = function ModalEmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.centeredContent}>
      <Text style={styles.emptyText}>{message}</Text>
      {action}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: componentTokens.modal.headerPadding,
    borderBottomWidth: componentTokens.modal.borderWidth,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  closeButton: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
  },
  content: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
