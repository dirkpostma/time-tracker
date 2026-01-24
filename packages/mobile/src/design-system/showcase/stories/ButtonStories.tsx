import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { DSButton } from '../../components/DSButton';
import { StoryWrapper, StoryRow } from '../StoryWrapper';
import { spacing } from '../../tokens';

const handlePress = () => Alert.alert('Button Pressed');

export const ButtonStories = {
  Primary: () => (
    <StoryWrapper title="Primary Button" description="Main call-to-action button">
      <DSButton title="Primary Button" onPress={handlePress} variant="primary" />
    </StoryWrapper>
  ),

  Secondary: () => (
    <StoryWrapper title="Secondary Button" description="Secondary actions">
      <DSButton title="Secondary Button" onPress={handlePress} variant="secondary" />
    </StoryWrapper>
  ),

  Danger: () => (
    <StoryWrapper title="Danger Button" description="Destructive actions">
      <DSButton title="Delete" onPress={handlePress} variant="danger" />
    </StoryWrapper>
  ),

  Ghost: () => (
    <StoryWrapper title="Ghost Button" description="Low-emphasis actions">
      <DSButton title="Ghost Button" onPress={handlePress} variant="ghost" />
    </StoryWrapper>
  ),

  Sizes: () => (
    <StoryWrapper title="Button Sizes" description="Small, medium, and large buttons">
      <View style={{ gap: spacing.md }}>
        <StoryRow label="Small">
          <DSButton title="Small" onPress={handlePress} size="sm" />
        </StoryRow>
        <StoryRow label="Medium (default)">
          <DSButton title="Medium" onPress={handlePress} size="md" />
        </StoryRow>
        <StoryRow label="Large">
          <DSButton title="Large" onPress={handlePress} size="lg" />
        </StoryRow>
      </View>
    </StoryWrapper>
  ),

  Loading: () => {
    const [loading, setLoading] = useState(false);
    const handleLoadingPress = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };
    return (
      <StoryWrapper title="Loading State" description="Tap to see loading state">
        <DSButton
          title="Submit"
          onPress={handleLoadingPress}
          loading={loading}
        />
      </StoryWrapper>
    );
  },

  Disabled: () => (
    <StoryWrapper title="Disabled State" description="Inactive button states">
      <View style={{ gap: spacing.md }}>
        <StoryRow label="Primary Disabled">
          <DSButton title="Disabled" onPress={handlePress} disabled />
        </StoryRow>
        <StoryRow label="Ghost Disabled">
          <DSButton title="Disabled Ghost" onPress={handlePress} variant="ghost" disabled />
        </StoryRow>
      </View>
    </StoryWrapper>
  ),
};
