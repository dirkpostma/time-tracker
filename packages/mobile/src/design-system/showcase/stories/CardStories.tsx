import React from 'react';
import { View } from 'react-native';
import { DSCard } from '../../components/DSCard';
import { DSText } from '../../components/DSText';
import { StoryWrapper, StoryRow } from '../StoryWrapper';
import { spacing } from '../../tokens';

export const CardStories = {
  Elevated: () => (
    <StoryWrapper title="Elevated Card" description="Card with shadow elevation">
      <DSCard variant="elevated">
        <DSText variant="h3">Card Title</DSText>
        <DSText variant="bodySmall" color="secondary" style={{ marginTop: spacing.sm }}>
          This is an elevated card with a subtle shadow for visual depth.
        </DSText>
      </DSCard>
    </StoryWrapper>
  ),

  Outlined: () => (
    <StoryWrapper title="Outlined Card" description="Card with border">
      <DSCard variant="outlined">
        <DSText variant="h3">Outlined Card</DSText>
        <DSText variant="bodySmall" color="secondary" style={{ marginTop: spacing.sm }}>
          This card uses a border instead of a shadow.
        </DSText>
      </DSCard>
    </StoryWrapper>
  ),

  Flat: () => (
    <StoryWrapper title="Flat Card" description="Card with background color only">
      <DSCard variant="flat">
        <DSText variant="h3">Flat Card</DSText>
        <DSText variant="bodySmall" color="secondary" style={{ marginTop: spacing.sm }}>
          A flat card with a subtle background color.
        </DSText>
      </DSCard>
    </StoryWrapper>
  ),
};
