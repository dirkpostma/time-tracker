import React from 'react';
import { View } from 'react-native';
import { DSText } from '../../components/DSText';
import { StoryWrapper, StoryRow } from '../StoryWrapper';
import { spacing } from '../../tokens';

export const TextStories = {
  Headings: () => (
    <StoryWrapper title="Headings" description="Typography hierarchy">
      <View style={{ gap: spacing.md }}>
        <StoryRow label="H1">
          <DSText variant="h1">Heading 1</DSText>
        </StoryRow>
        <StoryRow label="H2">
          <DSText variant="h2">Heading 2</DSText>
        </StoryRow>
        <StoryRow label="H3">
          <DSText variant="h3">Heading 3</DSText>
        </StoryRow>
      </View>
    </StoryWrapper>
  ),

  Body: () => (
    <StoryWrapper title="Body Text" description="Content text styles">
      <View style={{ gap: spacing.md }}>
        <StoryRow label="Body">
          <DSText variant="body">
            This is body text used for main content and descriptions.
          </DSText>
        </StoryRow>
        <StoryRow label="Body Small">
          <DSText variant="bodySmall">
            Smaller body text for secondary information.
          </DSText>
        </StoryRow>
        <StoryRow label="Caption">
          <DSText variant="caption">Caption text for timestamps and metadata</DSText>
        </StoryRow>
        <StoryRow label="Label">
          <DSText variant="label">Section Label</DSText>
        </StoryRow>
      </View>
    </StoryWrapper>
  ),

  Colors: () => (
    <StoryWrapper title="Text Colors" description="Available text color variants">
      <View style={{ gap: spacing.sm }}>
        <DSText color="primary">Primary text color</DSText>
        <DSText color="secondary">Secondary text color</DSText>
        <DSText color="tertiary">Tertiary text color</DSText>
        <DSText color="muted">Muted text color</DSText>
        <DSText color="link">Link text color</DSText>
        <DSText color="danger">Danger text color</DSText>
        <DSText color="success">Success text color</DSText>
      </View>
    </StoryWrapper>
  ),

  Timer: () => (
    <StoryWrapper title="Timer Display" description="Large timer typography">
      <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
        <DSText variant="timer">02:34:56</DSText>
      </View>
    </StoryWrapper>
  ),
};
