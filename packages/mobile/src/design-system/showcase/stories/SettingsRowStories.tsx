import React, { useState } from 'react';
import { View } from 'react-native';
import { DSButton } from '../../components/DSButton';
import { DSText } from '../../components/DSText';
import { DSTextInput } from '../../components/DSTextInput';
import { DSRow } from '../../components/DSStack';
import { DSToggle } from '../../components/DSToggle';
import { DSSeparator } from '../../components/DSSeparator';
import { StoryWrapper } from '../StoryWrapper';
import { spacing } from '../../tokens';

/**
 * Settings Row Pattern
 *
 * This showcases the inline input + save button pattern used in Settings.
 * The key is ensuring the row doesn't overflow when the Save button appears.
 */

// Bad: The original broken layout (row overflows)
function BrokenSettingsRow() {
  const [value, setValue] = useState('8');
  const [changed, setChanged] = useState(true);

  return (
    <DSRow gap="md" paddingVertical="sm" style={{ paddingLeft: spacing.lg, alignItems: 'center' }}>
      <DSText variant="bodySmall">Alert after (hours):</DSText>
      <DSTextInput
        value={value}
        onChangeText={(t) => { setValue(t); setChanged(true); }}
        keyboardType="number-pad"
        containerStyle={{ width: 60, marginBottom: 0 }}
      />
      {changed && (
        <DSButton
          title="Save"
          variant="primary"
          size="sm"
          onPress={() => setChanged(false)}
        />
      )}
    </DSRow>
  );
}

// Fixed: Use fullWidth={false} to prevent button from expanding
function FixedSettingsRow() {
  const [value, setValue] = useState('8');
  const [changed, setChanged] = useState(true);

  return (
    <DSRow
      gap="md"
      paddingVertical="sm"
      style={{
        paddingLeft: spacing.lg,
        alignItems: 'center',
      }}
    >
      <DSText variant="bodySmall" style={{ flexShrink: 1 }}>Alert after (hours):</DSText>
      <DSTextInput
        value={value}
        onChangeText={(t) => { setValue(t); setChanged(true); }}
        keyboardType="number-pad"
        containerStyle={{ width: 60, marginBottom: 0 }}
      />
      {changed && (
        <DSButton
          title="Save"
          variant="primary"
          size="sm"
          onPress={() => setChanged(false)}
          fullWidth={false}
        />
      )}
    </DSRow>
  );
}

// Alternative: Stack vertically on narrow space
function StackedSettingsRow() {
  const [value, setValue] = useState('8');
  const [changed, setChanged] = useState(true);

  return (
    <View style={{ paddingLeft: spacing.lg, paddingVertical: spacing.sm }}>
      <DSRow gap="md" style={{ alignItems: 'center', marginBottom: changed ? spacing.sm : 0 }}>
        <DSText variant="bodySmall">Alert after (hours):</DSText>
        <DSTextInput
          value={value}
          onChangeText={(t) => { setValue(t); setChanged(true); }}
          keyboardType="number-pad"
          containerStyle={{ width: 60, marginBottom: 0 }}
        />
      </DSRow>
      {changed && (
        <DSButton
          title="Save"
          variant="primary"
          size="sm"
          onPress={() => setChanged(false)}
          fullWidth={false}
        />
      )}
    </View>
  );
}

// Full settings section mockup
function FullSettingsMockup() {
  const [enabled, setEnabled] = useState(true);
  const [value, setValue] = useState('8');
  const [changed, setChanged] = useState(false);

  const handleChange = (text: string) => {
    setValue(text);
    setChanged(text !== '8');
  };

  return (
    <View>
      <DSToggle
        value={enabled}
        onValueChange={setEnabled}
        label="Alert when timer runs long"
        description="Get notified if your timer runs for too long"
      />

      {enabled && (
        <DSRow
          gap="md"
          paddingVertical="sm"
          style={{
            paddingLeft: spacing.lg,
            alignItems: 'center',
          }}
        >
          <DSText variant="bodySmall" style={{ flexShrink: 1 }}>Alert after (hours):</DSText>
          <DSTextInput
            value={value}
            onChangeText={handleChange}
            keyboardType="number-pad"
            containerStyle={{ width: 60, marginBottom: 0 }}
          />
          {changed && (
            <DSButton
              title="Save"
              variant="primary"
              size="sm"
              onPress={() => setChanged(false)}
              fullWidth={false}
            />
          )}
        </DSRow>
      )}

      <DSSeparator spacing="sm" />

      <DSToggle
        value={false}
        onValueChange={() => {}}
        label="Daily reminder"
        description="Remind me to start tracking each day"
      />
    </View>
  );
}

export const SettingsRowStories = {
  Broken: () => (
    <StoryWrapper
      title="Broken Layout"
      description="Original layout - Save button overflows off screen"
    >
      <BrokenSettingsRow />
    </StoryWrapper>
  ),

  Fixed: () => (
    <StoryWrapper
      title="Fixed Layout"
      description="Using fullWidth={false} on button to prevent expansion"
    >
      <FixedSettingsRow />
    </StoryWrapper>
  ),

  Stacked: () => (
    <StoryWrapper
      title="Stacked Alternative"
      description="Save button on separate line"
    >
      <StackedSettingsRow />
    </StoryWrapper>
  ),

  FullMockup: () => (
    <StoryWrapper
      title="Full Settings Section"
      description="Complete notification settings mockup"
    >
      <FullSettingsMockup />
    </StoryWrapper>
  ),
};
