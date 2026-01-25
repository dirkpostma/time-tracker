import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors, typography, spacing } from '../tokens';

// Import all story files
import { ButtonStories } from './stories/ButtonStories';
import { TextStories } from './stories/TextStories';
import { TextInputStories } from './stories/TextInputStories';
import { CardStories } from './stories/CardStories';
import { ModalStories } from './stories/ModalStories';
import { BadgeStories } from './stories/BadgeStories';
import { ToggleStories } from './stories/ToggleStories';
import { ListItemStories } from './stories/ListItemStories';
import { LoadingStories } from './stories/LoadingStories';
import { TokensStories } from './stories/TokensStories';
import { LayoutStories } from './stories/LayoutStories';
import { AddClientStories } from './stories/AddClientStories';

interface Story {
  name: string;
  component: React.ComponentType;
}

const STORIES: Record<string, Story[]> = {
  'Tokens': [
    { name: 'Colors', component: () => <TokensStories.Colors /> },
    { name: 'Typography', component: () => <TokensStories.Typography /> },
    { name: 'Spacing', component: () => <TokensStories.Spacing /> },
  ],
  'Buttons': [
    { name: 'Primary', component: ButtonStories.Primary },
    { name: 'Secondary', component: ButtonStories.Secondary },
    { name: 'Danger', component: ButtonStories.Danger },
    { name: 'Ghost', component: ButtonStories.Ghost },
    { name: 'Sizes', component: ButtonStories.Sizes },
    { name: 'Loading', component: ButtonStories.Loading },
    { name: 'Disabled', component: ButtonStories.Disabled },
  ],
  'Text': [
    { name: 'Headings', component: TextStories.Headings },
    { name: 'Body', component: TextStories.Body },
    { name: 'Colors', component: TextStories.Colors },
    { name: 'Timer', component: TextStories.Timer },
  ],
  'TextInput': [
    { name: 'Default', component: TextInputStories.Default },
    { name: 'With Label', component: TextInputStories.WithLabel },
    { name: 'Disabled', component: TextInputStories.Disabled },
    { name: 'With Error', component: TextInputStories.WithError },
    { name: 'Multiline', component: TextInputStories.Multiline },
  ],
  'Card': [
    { name: 'Elevated', component: CardStories.Elevated },
    { name: 'Outlined', component: CardStories.Outlined },
    { name: 'Flat', component: CardStories.Flat },
  ],
  'Modal': [
    { name: 'Basic', component: ModalStories.Basic },
    { name: 'With List', component: ModalStories.WithList },
  ],
  'Badge': [
    { name: 'Info', component: BadgeStories.Info },
    { name: 'Success', component: BadgeStories.Success },
    { name: 'Warning', component: BadgeStories.Warning },
    { name: 'Danger', component: BadgeStories.Danger },
    { name: 'With Subtext', component: BadgeStories.WithSubtext },
  ],
  'Toggle': [
    { name: 'Default', component: ToggleStories.Default },
    { name: 'With Description', component: ToggleStories.WithDescription },
    { name: 'Disabled', component: ToggleStories.Disabled },
  ],
  'ListItem': [
    { name: 'Default', component: ListItemStories.Default },
    { name: 'Disabled', component: ListItemStories.Disabled },
  ],
  'Loading': [
    { name: 'Default', component: LoadingStories.Default },
    { name: 'Small', component: LoadingStories.Small },
    { name: 'Full Screen', component: LoadingStories.FullScreen },
  ],
  'Layout': [
    { name: 'Screen', component: LayoutStories.Screen },
    { name: 'Screen Header', component: LayoutStories.ScreenHeader },
    { name: 'Stack', component: LayoutStories.Stack },
    { name: 'Row', component: LayoutStories.Row },
    { name: 'Center', component: LayoutStories.Center },
    { name: 'Section', component: LayoutStories.Section },
    { name: 'Spacer', component: LayoutStories.Spacer },
  ],
  'Forms': [
    { name: 'Add Client', component: AddClientStories.Default },
  ],
};

interface ShowcaseScreenProps {
  onClose: () => void;
}

export function ShowcaseScreen({ onClose }: ShowcaseScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const renderCategoryList = () => (
    <ScrollView style={styles.list}>
      {Object.keys(STORIES).map((category) => (
        <TouchableOpacity
          key={category}
          style={styles.categoryItem}
          onPress={() => setSelectedCategory(category)}
          testID={`category-${category.toLowerCase()}`}
          accessibilityLabel={category}
        >
          <Text style={styles.categoryText}>{category}</Text>
          <Text style={styles.chevron}>{'>'}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStoryList = () => (
    <ScrollView style={styles.list}>
      {STORIES[selectedCategory!].map((story) => (
        <TouchableOpacity
          key={story.name}
          style={styles.storyItem}
          onPress={() => setSelectedStory(story)}
          testID={`story-${story.name.toLowerCase().replace(/\s+/g, '-')}`}
          accessibilityLabel={story.name}
        >
          <Text style={styles.storyText}>{story.name}</Text>
          <Text style={styles.chevron}>{'>'}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStory = () => {
    const StoryComponent = selectedStory!.component;
    return (
      <ScrollView style={styles.storyContainer} contentContainerStyle={styles.storyContent}>
        <StoryComponent />
      </ScrollView>
    );
  };

  const getTitle = () => {
    if (selectedStory) return selectedStory.name;
    if (selectedCategory) return selectedCategory;
    return 'Component Showcase';
  };

  const handleBack = () => {
    if (selectedStory) {
      setSelectedStory(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      onClose();
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="showcase-screen">
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>
            {selectedStory || selectedCategory ? 'Back' : 'Close'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>{getTitle()}</Text>
        <View style={styles.spacer} />
      </View>

      {!selectedCategory && renderCategoryList()}
      {selectedCategory && !selectedStory && renderStoryList()}
      {selectedStory && renderStory()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 60,
  },
  backText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  spacer: {
    width: 60,
  },
  list: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoryText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  storyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  storyText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  chevron: {
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
  },
  storyContainer: {
    flex: 1,
  },
  storyContent: {
    padding: spacing.lg,
  },
});
