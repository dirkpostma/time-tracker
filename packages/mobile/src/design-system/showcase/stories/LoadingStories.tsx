import React from 'react';
import { View } from 'react-native';
import { DSLoadingIndicator } from '../../components/DSLoadingIndicator';
import { StoryWrapper, StoryRow } from '../StoryWrapper';
import { spacing, colors } from '../../tokens';

export const LoadingStories = {
  Default: () => (
    <StoryWrapper title="Default Loading" description="Large loading indicator">
      <View style={{ alignItems: 'center', padding: spacing.xl }}>
        <DSLoadingIndicator />
      </View>
    </StoryWrapper>
  ),

  Small: () => (
    <StoryWrapper title="Small Loading" description="Compact loading indicator">
      <View style={{ alignItems: 'center', padding: spacing.xl }}>
        <DSLoadingIndicator size="small" />
      </View>
    </StoryWrapper>
  ),

  FullScreen: () => (
    <StoryWrapper
      title="Full Screen Loading"
      description="Note: The actual full screen loading takes the entire screen"
    >
      <View style={{ height: 200, borderWidth: 1, borderColor: colors.border, borderRadius: 8 }}>
        <DSLoadingIndicator fullScreen />
      </View>
    </StoryWrapper>
  ),
};
