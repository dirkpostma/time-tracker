import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../tokens';
import { StoryWrapper } from '../StoryWrapper';

function ColorSwatch({ name, color }: { name: string; color: string }) {
  const isLight = color === '#FFFFFF' || color === '#F5F5F5' || color === '#F9F9F9' || color === '#F0F0F0';
  return (
    <View style={styles.swatchContainer}>
      <View style={[styles.swatch, { backgroundColor: color }, isLight && styles.swatchBorder]} />
      <Text style={styles.swatchName}>{name}</Text>
      <Text style={styles.swatchValue}>{color}</Text>
    </View>
  );
}

function SpacingBlock({ name, size }: { name: string; size: number }) {
  return (
    <View style={styles.spacingRow}>
      <View style={styles.spacingLabelContainer}>
        <Text style={styles.spacingName}>{name}</Text>
        <Text style={styles.spacingValue}>{size}px</Text>
      </View>
      <View style={[styles.spacingBlock, { width: size, height: 24 }]} />
    </View>
  );
}

export const TokensStories = {
  Colors: () => (
    <StoryWrapper title="Color Tokens" description="Design system color palette">
      <View style={styles.colorGrid}>
        <Text style={styles.colorGroupTitle}>Primary</Text>
        <View style={styles.colorRow}>
          <ColorSwatch name="primary" color={colors.primary} />
          <ColorSwatch name="primaryLight" color={colors.primaryLight} />
        </View>

        <Text style={styles.colorGroupTitle}>Semantic</Text>
        <View style={styles.colorRow}>
          <ColorSwatch name="success" color={colors.success} />
          <ColorSwatch name="danger" color={colors.danger} />
          <ColorSwatch name="warning" color={colors.warning} />
        </View>

        <Text style={styles.colorGroupTitle}>Background</Text>
        <View style={styles.colorRow}>
          <ColorSwatch name="background" color={colors.background} />
          <ColorSwatch name="bgSecondary" color={colors.backgroundSecondary} />
          <ColorSwatch name="bgTertiary" color={colors.backgroundTertiary} />
        </View>

        <Text style={styles.colorGroupTitle}>Text</Text>
        <View style={styles.colorRow}>
          <ColorSwatch name="primary" color={colors.textPrimary} />
          <ColorSwatch name="secondary" color={colors.textSecondary} />
          <ColorSwatch name="muted" color={colors.textMuted} />
        </View>

        <Text style={styles.colorGroupTitle}>Border</Text>
        <View style={styles.colorRow}>
          <ColorSwatch name="border" color={colors.border} />
          <ColorSwatch name="borderLight" color={colors.borderLight} />
        </View>
      </View>
    </StoryWrapper>
  ),

  Typography: () => (
    <StoryWrapper title="Typography Tokens" description="Font sizes and weights">
      <View style={styles.typographySection}>
        <Text style={styles.sectionLabel}>Font Sizes</Text>
        {Object.entries(typography.fontSize).map(([name, size]) => (
          <View key={name} style={styles.typographyRow}>
            <Text style={[styles.typographySample, { fontSize: Math.min(size, 32) }]}>
              {name}
            </Text>
            <Text style={styles.typographyValue}>{size}px</Text>
          </View>
        ))}

        <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>Font Weights</Text>
        {Object.entries(typography.fontWeight).map(([name, weight]) => (
          <View key={name} style={styles.typographyRow}>
            <Text style={[styles.typographySample, { fontWeight: weight }]}>
              {name} ({weight})
            </Text>
          </View>
        ))}
      </View>
    </StoryWrapper>
  ),

  Spacing: () => (
    <StoryWrapper title="Spacing Tokens" description="Consistent spacing scale">
      <View>
        {Object.entries(spacing).map(([name, size]) => (
          <SpacingBlock key={name} name={name} size={size} />
        ))}
      </View>
    </StoryWrapper>
  ),
};

const styles = StyleSheet.create({
  colorGrid: {
    gap: spacing.md,
  },
  colorGroupTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatchContainer: {
    alignItems: 'center',
    width: 80,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  swatchBorder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  swatchName: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  swatchValue: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Courier',
  },
  typographySection: {},
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  typographyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  typographySample: {
    color: colors.textPrimary,
  },
  typographyValue: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: 'Courier',
  },
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  spacingLabelContainer: {
    width: 100,
  },
  spacingName: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  spacingValue: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  spacingBlock: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginLeft: spacing.md,
  },
});
