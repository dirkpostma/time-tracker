import React from 'react';
import { View } from 'react-native';
import { DSScreen, DSScreenHeader, DSStack, DSRow, DSCenter, DSSection, DSSpacer } from '../../';
import { DSText } from '../../components/DSText';
import { DSButton } from '../../components/DSButton';
import { DSCard } from '../../components/DSCard';
import { StoryWrapper } from '../StoryWrapper';
import { colors, spacing } from '../../tokens';

export const LayoutStories = {
  Screen: () => (
    <StoryWrapper title="DSScreen" description="Screen container with background and optional scrolling">
      <View style={{ height: 200, borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>
        <DSScreen>
          <DSText variant="body" style={{ padding: spacing.lg }}>
            This is content inside DSScreen (default variant)
          </DSText>
        </DSScreen>
      </View>
      <View style={{ height: 200, borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden', marginTop: spacing.lg }}>
        <DSScreen variant="secondary">
          <DSText variant="body" style={{ padding: spacing.lg }}>
            This is content inside DSScreen (secondary variant)
          </DSText>
        </DSScreen>
      </View>
    </StoryWrapper>
  ),

  ScreenHeader: () => (
    <StoryWrapper title="DSScreenHeader" description="Screen header with title and optional action">
      <View style={{ marginHorizontal: -spacing.lg }}>
        <DSScreenHeader title="Page Title" />
      </View>
      <View style={{ marginHorizontal: -spacing.lg, marginTop: spacing.lg }}>
        <DSScreenHeader
          title="With Action"
          action={{ label: 'Logout', onPress: () => {} }}
          variant="bordered"
        />
      </View>
    </StoryWrapper>
  ),

  Stack: () => (
    <StoryWrapper title="DSStack" description="Vertical stack with gap">
      <DSStack gap="md">
        <DSCard variant="outlined" padding="sm">
          <DSText variant="body">Item 1</DSText>
        </DSCard>
        <DSCard variant="outlined" padding="sm">
          <DSText variant="body">Item 2</DSText>
        </DSCard>
        <DSCard variant="outlined" padding="sm">
          <DSText variant="body">Item 3</DSText>
        </DSCard>
      </DSStack>
    </StoryWrapper>
  ),

  Row: () => (
    <StoryWrapper title="DSRow" description="Horizontal row with gap and alignment">
      <DSStack gap="lg">
        <DSText variant="label">Space Between</DSText>
        <DSRow justify="space-between">
          <DSText variant="body">Left</DSText>
          <DSText variant="body">Right</DSText>
        </DSRow>

        <DSText variant="label">With Gap</DSText>
        <DSRow gap="md">
          <DSCard variant="outlined" padding="sm">
            <DSText variant="body">A</DSText>
          </DSCard>
          <DSCard variant="outlined" padding="sm">
            <DSText variant="body">B</DSText>
          </DSCard>
          <DSCard variant="outlined" padding="sm">
            <DSText variant="body">C</DSText>
          </DSCard>
        </DSRow>

        <DSText variant="label">Centered</DSText>
        <DSRow justify="center" gap="sm">
          <DSButton title="Cancel" variant="secondary" fullWidth={false} onPress={() => {}} />
          <DSButton title="Save" variant="primary" fullWidth={false} onPress={() => {}} />
        </DSRow>
      </DSStack>
    </StoryWrapper>
  ),

  Center: () => (
    <StoryWrapper title="DSCenter" description="Centered content container">
      <View style={{ height: 150, borderWidth: 1, borderColor: colors.border, borderRadius: 8 }}>
        <DSCenter>
          <DSText variant="body" color="muted">Centered content</DSText>
        </DSCenter>
      </View>
    </StoryWrapper>
  ),

  Section: () => (
    <StoryWrapper title="DSSection" description="Grouped content with optional title">
      <View style={{ marginHorizontal: -spacing.lg, backgroundColor: colors.backgroundSecondary }}>
        <DSSection title="Settings">
          <DSText variant="body">Section content goes here</DSText>
        </DSSection>
        <DSSection title="Another Section">
          <DSText variant="body">More content</DSText>
        </DSSection>
      </View>
    </StoryWrapper>
  ),

  Spacer: () => (
    <StoryWrapper title="DSSpacer" description="Flexible space or fixed spacing">
      <DSStack>
        <DSCard variant="outlined" padding="sm">
          <DSText variant="body">Top</DSText>
        </DSCard>
        <DSSpacer size="xxl" />
        <DSCard variant="outlined" padding="sm">
          <DSText variant="body">Bottom (xxl gap)</DSText>
        </DSCard>
      </DSStack>
      <DSRow style={{ marginTop: spacing.lg }}>
        <DSText variant="body">Left</DSText>
        <DSSpacer flex={1} />
        <DSText variant="body">Right (flex spacer)</DSText>
      </DSRow>
    </StoryWrapper>
  ),
};
