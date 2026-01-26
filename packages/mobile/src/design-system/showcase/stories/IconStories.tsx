import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { StoryWrapper, StoryRow } from '../StoryWrapper';
import { DSText } from '../../components/DSText';
import { spacing, colors } from '../../tokens';

export const IconStories = {
  AppIcon: () => (
    <StoryWrapper title="App Icon" description="1024x1024 icon for App Store">
      <View style={styles.iconContainer}>
        <Image
          source={require('../../../../assets/icon.png')}
          style={styles.appIcon}
          resizeMode="contain"
        />
        <DSText variant="caption" style={styles.caption}>
          icon.png (1024x1024)
        </DSText>
      </View>
    </StoryWrapper>
  ),

  SplashIcon: () => (
    <StoryWrapper title="Splash Icon" description="512x512 icon for splash screen">
      <View style={styles.iconContainer}>
        <View style={styles.splashPreview}>
          <Image
            source={require('../../../../assets/splash-icon.png')}
            style={styles.splashIcon}
            resizeMode="contain"
          />
        </View>
        <DSText variant="caption" style={styles.caption}>
          splash-icon.png (512x512)
        </DSText>
      </View>
    </StoryWrapper>
  ),

  AdaptiveIcon: () => (
    <StoryWrapper title="Adaptive Icon" description="Android adaptive icon foreground">
      <View style={styles.iconContainer}>
        <View style={styles.adaptivePreview}>
          <Image
            source={require('../../../../assets/adaptive-icon.png')}
            style={styles.adaptiveIcon}
            resizeMode="contain"
          />
        </View>
        <DSText variant="caption" style={styles.caption}>
          adaptive-icon.png (1024x1024)
        </DSText>
      </View>
    </StoryWrapper>
  ),

  AllSizes: () => (
    <StoryWrapper title="Icon Sizes" description="Preview at different sizes">
      <View style={styles.sizesContainer}>
        <StoryRow label="180px (iPhone)">
          <Image
            source={require('../../../../assets/icon.png')}
            style={styles.size180}
            resizeMode="contain"
          />
        </StoryRow>
        <StoryRow label="120px">
          <Image
            source={require('../../../../assets/icon.png')}
            style={styles.size120}
            resizeMode="contain"
          />
        </StoryRow>
        <StoryRow label="80px">
          <Image
            source={require('../../../../assets/icon.png')}
            style={styles.size80}
            resizeMode="contain"
          />
        </StoryRow>
        <StoryRow label="60px (Home)">
          <Image
            source={require('../../../../assets/icon.png')}
            style={styles.size60}
            resizeMode="contain"
          />
        </StoryRow>
        <StoryRow label="40px (Spotlight)">
          <Image
            source={require('../../../../assets/icon.png')}
            style={styles.size40}
            resizeMode="contain"
          />
        </StoryRow>
        <StoryRow label="29px (Settings)">
          <Image
            source={require('../../../../assets/icon.png')}
            style={styles.size29}
            resizeMode="contain"
          />
        </StoryRow>
      </View>
    </StoryWrapper>
  ),
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  appIcon: {
    width: 200,
    height: 200,
    borderRadius: 44,
  },
  splashPreview: {
    width: 200,
    height: 200,
    backgroundColor: '#0F0F1A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashIcon: {
    width: 150,
    height: 150,
  },
  adaptivePreview: {
    width: 200,
    height: 200,
    backgroundColor: '#0F0F1A',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  adaptiveIcon: {
    width: 160,
    height: 160,
  },
  caption: {
    color: colors.textMuted,
  },
  sizesContainer: {
    gap: spacing.lg,
  },
  size180: {
    width: 180,
    height: 180,
    borderRadius: 40,
  },
  size120: {
    width: 120,
    height: 120,
    borderRadius: 26,
  },
  size80: {
    width: 80,
    height: 80,
    borderRadius: 18,
  },
  size60: {
    width: 60,
    height: 60,
    borderRadius: 13,
  },
  size40: {
    width: 40,
    height: 40,
    borderRadius: 9,
  },
  size29: {
    width: 29,
    height: 29,
    borderRadius: 6,
  },
});
