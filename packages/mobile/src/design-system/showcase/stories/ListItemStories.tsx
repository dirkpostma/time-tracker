import React from 'react';
import { View, Alert } from 'react-native';
import { DSListItem } from '../../components/DSListItem';
import { DSSeparator } from '../../components/DSSeparator';
import { StoryWrapper } from '../StoryWrapper';

const handlePress = (name: string) => () => Alert.alert('Selected', name);

export const ListItemStories = {
  Default: () => (
    <StoryWrapper title="List Items" description="Tappable list items">
      <View>
        <DSListItem title="Acme Corporation" onPress={handlePress('Acme Corporation')} />
        <DSSeparator />
        <DSListItem title="TechStart Inc" onPress={handlePress('TechStart Inc')} />
        <DSSeparator />
        <DSListItem title="Global Solutions" onPress={handlePress('Global Solutions')} />
      </View>
    </StoryWrapper>
  ),

  Disabled: () => (
    <StoryWrapper title="Disabled List Item" description="Non-interactive item">
      <DSListItem title="Unavailable Option" onPress={() => {}} disabled />
    </StoryWrapper>
  ),
};
