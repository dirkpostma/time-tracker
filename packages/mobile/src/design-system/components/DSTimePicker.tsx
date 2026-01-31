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
import { defaultTheme } from '../themes';
import { spacing } from '../tokens';
import { DSText } from './DSText';
import { DSButton } from './DSButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Use theme colors for dark mode
const themeColors = defaultTheme.colors;

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
            style={styles.timeText}
          >
            {formatTime(value)}
          </DSText>
          {!disabled && (
            <View style={styles.editBadge}>
              <DSText variant="bodySmall" style={styles.editText}>Edit</DSText>
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
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalContent}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity 
                    onPress={handleCancel} 
                    style={styles.headerButton}
                    testID={testID ? `${testID}-cancel` : undefined}
                  >
                    <DSText variant="body" style={styles.cancelText}>Cancel</DSText>
                  </TouchableOpacity>
                  
                  <DSText variant="body" style={styles.modalTitle}>
                    {label || 'Select Time'}
                  </DSText>
                  
                  <TouchableOpacity 
                    onPress={handleConfirm} 
                    style={styles.headerButton}
                    testID={testID ? `${testID}-done` : undefined}
                  >
                    <DSText variant="body" style={styles.doneText}>Done</DSText>
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
                    textColor={themeColors.textPrimary}
                    themeVariant="dark"
                    style={styles.picker}
                  />
                </View>

                {/* Confirm Button */}
                <View style={styles.confirmButtonContainer}>
                  <DSButton
                    title="Confirm Time"
                    onPress={handleConfirm}
                    variant="primary"
                    testID={testID ? `${testID}-confirm` : undefined}
                  />
                </View>
              </View>
            </SafeAreaView>
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
          textColor={themeColors.textPrimary}
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
    backgroundColor: themeColors.backgroundCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  buttonDisabled: {
    backgroundColor: themeColors.backgroundTertiary,
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    color: themeColors.textPrimary,
    fontSize: 24,
    fontWeight: '600',
  },
  editBadge: {
    backgroundColor: themeColors.primary + '25',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 8,
  },
  editText: {
    color: themeColors.primary,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalSafeArea: {
    backgroundColor: themeColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalContent: {
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 4,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  headerButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    minWidth: 70,
  },
  cancelText: {
    color: themeColors.textSecondary,
    fontSize: 16,
  },
  modalTitle: {
    fontWeight: '600',
    color: themeColors.textPrimary,
    textAlign: 'center',
    flex: 1,
    fontSize: 17,
  },
  doneText: {
    color: themeColors.primary,
    fontWeight: '600',
    textAlign: 'right',
    fontSize: 16,
  },
  pickerContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    backgroundColor: themeColors.backgroundSecondary,
  },
  picker: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    height: 200,
  },
  confirmButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  // Inline styles
  inlineContainer: {
    marginVertical: spacing.xs,
  },
  inlinePickerWrapper: {
    alignItems: 'center',
    backgroundColor: themeColors.backgroundCard,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  pickerDisabled: {
    opacity: 0.5,
  },
});
