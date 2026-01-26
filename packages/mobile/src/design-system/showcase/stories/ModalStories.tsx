import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { DSModal } from '../../components/DSModal';
import { DSButton } from '../../components/DSButton';
import { DSText } from '../../components/DSText';
import { DSLoadingIndicator } from '../../components/DSLoadingIndicator';
import { DSSeparator } from '../../components/DSSeparator';
import { StoryWrapper } from '../StoryWrapper';
import { colors, spacing } from '../../tokens';

export const ModalStories = {
  Basic: () => {
    const [visible, setVisible] = useState(false);
    return (
      <StoryWrapper title="Basic Modal" description="Simple modal with header">
        <DSButton title="Open Modal" onPress={() => setVisible(true)} />
        <DSModal
          visible={visible}
          title="Modal Title"
          onClose={() => setVisible(false)}
          testID="basic-modal"
        >
          <View style={{ padding: spacing.lg }}>
            <DSText variant="body">
              This is the modal content. You can put any content here.
            </DSText>
          </View>
        </DSModal>
      </StoryWrapper>
    );
  },

  WithList: () => {
    const [visible, setVisible] = useState(false);
    const items = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: '3', name: 'Item 3' },
      { id: '4', name: 'Item 4' },
      { id: '5', name: 'Item 5' },
    ];

    return (
      <StoryWrapper title="Modal with List" description="Modal containing a selectable list">
        <DSButton title="Open List Modal" onPress={() => setVisible(true)} />
        <DSModal
          visible={visible}
          title="Select Item"
          onClose={() => setVisible(false)}
          testID="list-modal"
        >
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setVisible(false);
                }}
              >
                <Text style={styles.listItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <DSSeparator />}
          />
        </DSModal>
      </StoryWrapper>
    );
  },
};

const styles = StyleSheet.create({
  listItem: {
    padding: spacing.lg,
  },
  listItemText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
});
