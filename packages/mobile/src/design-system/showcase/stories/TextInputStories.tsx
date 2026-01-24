import React, { useState } from 'react';
import { View } from 'react-native';
import { DSTextInput } from '../../components/DSTextInput';
import { StoryWrapper } from '../StoryWrapper';
import { spacing } from '../../tokens';

export const TextInputStories = {
  Default: () => {
    const [value, setValue] = useState('');
    return (
      <StoryWrapper title="Default Input" description="Basic text input">
        <DSTextInput
          placeholder="Enter text..."
          value={value}
          onChangeText={setValue}
        />
      </StoryWrapper>
    );
  },

  WithLabel: () => {
    const [value, setValue] = useState('');
    return (
      <StoryWrapper title="With Label" description="Input with label">
        <DSTextInput
          label="Email Address"
          placeholder="email@example.com"
          value={value}
          onChangeText={setValue}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </StoryWrapper>
    );
  },

  Disabled: () => (
    <StoryWrapper title="Disabled" description="Non-editable input">
      <DSTextInput
        label="Read Only"
        value="This field is disabled"
        onChangeText={() => {}}
        disabled
      />
    </StoryWrapper>
  ),

  WithError: () => {
    const [value, setValue] = useState('invalid-email');
    return (
      <StoryWrapper title="With Error" description="Validation error state">
        <DSTextInput
          label="Email"
          placeholder="email@example.com"
          value={value}
          onChangeText={setValue}
          error="Please enter a valid email address"
        />
      </StoryWrapper>
    );
  },

  Multiline: () => {
    const [value, setValue] = useState('');
    return (
      <StoryWrapper title="Multiline" description="Text area for longer content">
        <DSTextInput
          label="Description"
          placeholder="Add a description..."
          value={value}
          onChangeText={setValue}
          multiline
          numberOfLines={4}
        />
      </StoryWrapper>
    );
  },
};
