import React from 'react';
import { View } from 'react-native';
import { DSBadge } from '../../components/DSBadge';
import { StoryWrapper, StoryRow } from '../StoryWrapper';
import { spacing } from '../../tokens';

export const BadgeStories = {
  Info: () => (
    <StoryWrapper title="Info Badge" description="Information or syncing state">
      <DSBadge text="Syncing..." variant="info" />
    </StoryWrapper>
  ),

  Success: () => (
    <StoryWrapper title="Success Badge" description="Success or completed state">
      <DSBadge text="Connected" variant="success" />
    </StoryWrapper>
  ),

  Warning: () => (
    <StoryWrapper title="Warning Badge" description="Warning or pending state">
      <DSBadge text="3 pending actions" variant="warning" />
    </StoryWrapper>
  ),

  Danger: () => (
    <StoryWrapper title="Danger Badge" description="Error or offline state">
      <DSBadge text="No connection" variant="danger" />
    </StoryWrapper>
  ),

  WithSubtext: () => (
    <StoryWrapper title="Badge with Subtext" description="Additional context below main text">
      <View style={{ gap: spacing.md }}>
        <DSBadge
          text="No connection"
          subtext="2 pending actions"
          variant="danger"
        />
        <DSBadge
          text="Syncing"
          subtext="Please wait..."
          variant="info"
        />
      </View>
    </StoryWrapper>
  ),
};
