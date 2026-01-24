import React, { useState } from 'react';
import { View } from 'react-native';
import { DSToggle } from '../../components/DSToggle';
import { StoryWrapper } from '../StoryWrapper';
import { spacing } from '../../tokens';

export const ToggleStories = {
  Default: () => {
    const [value, setValue] = useState(false);
    return (
      <StoryWrapper title="Default Toggle" description="Simple on/off switch">
        <DSToggle
          label="Enable notifications"
          value={value}
          onValueChange={setValue}
        />
      </StoryWrapper>
    );
  },

  WithDescription: () => {
    const [value, setValue] = useState(true);
    return (
      <StoryWrapper title="With Description" description="Toggle with helper text">
        <DSToggle
          label="Alert when timer runs long"
          description="Get notified if your timer runs for too long"
          value={value}
          onValueChange={setValue}
        />
      </StoryWrapper>
    );
  },

  Disabled: () => (
    <StoryWrapper title="Disabled Toggle" description="Non-interactive toggle">
      <View style={{ gap: spacing.md }}>
        <DSToggle
          label="Disabled (off)"
          value={false}
          onValueChange={() => {}}
          disabled
        />
        <DSToggle
          label="Disabled (on)"
          value={true}
          onValueChange={() => {}}
          disabled
        />
      </View>
    </StoryWrapper>
  ),
};
