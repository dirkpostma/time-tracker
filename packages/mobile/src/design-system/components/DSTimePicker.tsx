import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, typography, spacing } from '../tokens';
import { DSText } from './DSText';
import { DSButton } from './DSButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface DSTimePickerProps {
  /**
   * The current time value
   */
  value: Date;
  /**
   * Called when the time changes
   */
  onChange: (date: Date) => void;
  /**
   * Label shown above the time value
   */
  label?: string;
  /**
   * Whether the picker is disabled
   */
  disabled?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
  /**
   * Minimum allowed time (optional)
   */
  minimumDate?: Date;
  /**
   * Maximum allowed time (optional)
   */
  maximumDate?: Date;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function DSTimePicker({
  value,
  onChange,
  label,
  disabled = false,
  testID,
  minimumDate,
  maximumDate,
}: DSTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handlePress = useCallback(() => {
    if (!disabled) {
      setTempValue(value);
      setShowPicker(true);
    }
  }, [disabled, value]);

  const handleChange = useCallback((
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
    } else {
      // iOS: Update temp value while picker is open
      if (selectedDate) {
        setTempValue(selectedDate);
      }
    }
  }, [onChange]);

  const handleConfirm = useCallback(() => {
    setShowPicker(false);
    onChange(tempValue);
  }, [onChange, tempValue]);

  const handleCancel = useCallback(() => {
    setShowPicker(false);
    setTempValue(value);
  }, [value]);

  return (
    <View style={styles.container} testID={testID}>
      {label && (
        <DSText variant="bodySmall" color="secondary" style={styles.label}>
          {label}
        </DSText>
      )}
      
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={handlePress}
        disabled={disabled}
        testID={testID ? `${testID}-button` : undefined}
        accessibilityLabel={label ? `${label}: ${formatTime(value)}` : formatTime(value)}
        accessibilityHint="Opens time picker"
        accessibilityRole="button"
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          <DSText 
            variant="h3" 
            color={disabled ? 'secondary' : 'primary'}
            testID={testID ? `${testID}-value` : undefined}
          >
            {formatTime(value)}
          </DSText>
          {!disabled && (
            <View style={styles.editIcon}>
              <DSText variant="bodySmall" color="primary">Edit</DSText>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* iOS Modal Picker */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal
          visible={showPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  onPress={handleCancel} 
                  style={styles.headerButton}
                  testID={testID ? `${testID}-cancel` : undefined}
                >
                  <DSText variant="body" color="secondary">Cancel</DSText>
                </TouchableOpacity>
                
                <DSText variant="body" style={styles.modalTitle}>
                  {label || 'Select Time'}
                </DSText>
                
                <TouchableOpacity 
                  onPress={handleConfirm} 
                  style={styles.headerButton}
                  testID={testID ? `${testID}-done` : undefined}
                >
                  <DSText variant="body" color="primary" style={styles.doneText}>Done</DSText>
                </TouchableOpacity>
              </View>

              {/* Picker */}
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={tempValue}
                  mode="time"
                  display="spinner"
                  onChange={handleChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  testID={testID ? `${testID}-picker` : undefined}
                  textColor={colors.textPrimary}
                  themeVariant="dark"
                  style={styles.picker}
                />
              </View>

              {/* Confirm Button */}
              <View style={styles.confirmButtonContainer}>
                <DSButton
                  title="Confirm"
                  onPress={handleConfirm}
                  variant="primary"
                  testID={testID ? `${testID}-confirm` : undefined}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Android inline picker */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={value}
          mode="time"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          testID={testID ? `${testID}-picker` : undefined}
        />
      )}
    </View>
  );
}

/**
 * Inline variant that shows the picker directly without modal (iOS only)
 */
DSTimePicker.Inline = function DSTimePickerInline({
  value,
  onChange,
  label,
  disabled = false,
  testID,
  minimumDate,
  maximumDate,
}: DSTimePickerProps) {
  const handleChange = useCallback((
    _event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (selectedDate) {
      onChange(selectedDate);
    }
  }, [onChange]);

  return (
    <View style={styles.inlineContainer} testID={testID}>
      {label && (
        <DSText variant="bodySmall" color="secondary" style={styles.label}>
          {label}
        </DSText>
      )}
      <View style={[styles.inlinePickerWrapper, disabled && styles.pickerDisabled]}>
        <DateTimePicker
          value={value}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          disabled={disabled}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          testID={testID ? `${testID}-picker` : undefined}
          textColor={colors.textPrimary}
          themeVariant="dark"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    marginBottom: spacing.xs,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  buttonDisabled: {
    backgroundColor: colors.backgroundSecondary,
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editIcon: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    minWidth: 70,
  },
  modalTitle: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  doneText: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'right',
  },
  pickerContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  picker: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    height: 200,
  },
  confirmButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  // Inline styles
  inlineContainer: {
    marginVertical: spacing.xs,
  },
  inlinePickerWrapper: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: spacing.sm,
  },
  pickerDisabled: {
    opacity: 0.5,
  },
});
