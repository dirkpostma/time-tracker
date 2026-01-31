import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, typography, spacing } from '../tokens';
import { DSText } from './DSText';

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

  const handleDone = useCallback(() => {
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
      >
        <DSText 
          variant="body" 
          color={disabled ? 'secondary' : 'primary'}
          testID={testID ? `${testID}-value` : undefined}
        >
          {formatTime(value)}
        </DSText>
        {!disabled && (
          <DSText variant="bodySmall" color="secondary"> ✎</DSText>
        )}
      </TouchableOpacity>

      {/* iOS Modal Picker */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal
          visible={showPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCancel}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel} testID={testID ? `${testID}-cancel` : undefined}>
                <DSText variant="body" color="secondary">Cancel</DSText>
              </TouchableOpacity>
              <DSText variant="body" style={styles.modalTitle}>
                {label || 'Select Time'}
              </DSText>
              <TouchableOpacity onPress={handleDone} testID={testID ? `${testID}-done` : undefined}>
                <DSText variant="body" color="primary">Done</DSText>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerWrapper}>
              <DateTimePicker
                value={tempValue}
                mode="time"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                testID={testID ? `${testID}-picker` : undefined}
              />
            </View>
          </SafeAreaView>
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
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  label: {
    marginBottom: spacing.xs,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: colors.backgroundSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
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
  modalTitle: {
    fontWeight: typography.fontWeight.semibold,
  },
  pickerWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  inlineContainer: {
    marginVertical: spacing.xs,
  },
  inlinePickerWrapper: {
    alignItems: 'center',
  },
  pickerDisabled: {
    opacity: 0.5,
  },
});
