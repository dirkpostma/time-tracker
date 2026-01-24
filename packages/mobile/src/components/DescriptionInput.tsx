import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface DescriptionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  placeholder?: string;
}

export function DescriptionInput({
  value,
  onChangeText,
  editable,
  placeholder = 'Add description...',
}: DescriptionInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        testID="description-input"
        accessibilityLabel="Description"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 60,
    maxHeight: 100,
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
});
