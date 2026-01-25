/**
 * Theme Showcase Screen
 * Demonstrates all 5 themes with example screens
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ThemeProvider, useTheme } from '../../themes/ThemeContext';
import { Theme, ThemeName, themes, themeList } from '../../themes';
import {
  ThemedScreen,
  ThemedHeader,
  ThemedText,
  ThemedButton,
  ThemedCard,
  ThemedInput,
  ThemedTimerDisplay,
  ThemedBadge,
  ThemedListItem,
  ThemedSeparator,
  ThemedTabBar,
} from './ThemedComponents';

// ============================================================
// EXAMPLE: Timer Screen
// ============================================================
function ExampleTimerScreen() {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const [isRunning, setIsRunning] = useState(false);

  return (
    <ThemedScreen>
      <ThemedHeader
        title="Timer"
        rightAction={{ label: 'Settings', onPress: () => {} }}
      />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: spacing.lg,
          gap: spacing.xl,
        }}
      >
        <ThemedTimerDisplay
          time={isRunning ? '01:23:45' : '00:00:00'}
          isRunning={isRunning}
          clientName="Acme Corp"
          projectName="Website Redesign"
          taskName="Homepage mockups"
        />

        <ThemedCard padding="md">
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <ThemedText variant="bodySmall" color="tertiary">Current selection</ThemedText>
              <ThemedText variant="body">Acme Corp / Website Redesign</ThemedText>
            </View>
            <ThemedBadge text="Active" variant="success" size="sm" />
          </View>
        </ThemedCard>

        <View style={{ gap: spacing.md }}>
          {isRunning ? (
            <ThemedButton
              title="Stop Timer"
              variant="danger"
              size="lg"
              onPress={() => setIsRunning(false)}
            />
          ) : (
            <ThemedButton
              title="Start Timer"
              variant="primary"
              size="lg"
              onPress={() => setIsRunning(true)}
            />
          )}
          <ThemedButton
            title="Change Selection"
            variant="ghost"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </ThemedScreen>
  );
}

// ============================================================
// EXAMPLE: History Screen
// ============================================================
function ExampleHistoryScreen() {
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;

  const entries = [
    { id: '1', title: 'Website Redesign', client: 'Acme Corp', duration: '2h 30m', time: '9:00 - 11:30' },
    { id: '2', title: 'Mobile App', client: 'TechStart', duration: '1h 45m', time: '12:00 - 13:45' },
    { id: '3', title: 'API Development', client: 'DataFlow', duration: '3h 15m', time: '14:00 - 17:15' },
  ];

  return (
    <ThemedScreen>
      <ThemedHeader title="History" subtitle="Today's entries" />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          <ThemedText variant="label" color="secondary">TODAY</ThemedText>
          <ThemedBadge text="7h 30m total" variant="primary" />
        </View>

        {entries.map((entry) => (
          <ThemedCard key={entry.id} padding="md">
            <View style={{ gap: spacing.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText variant="body">{entry.title}</ThemedText>
                <ThemedText variant="body" color="accent">{entry.duration}</ThemedText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText variant="bodySmall" color="tertiary">{entry.client}</ThemedText>
                <ThemedText variant="caption" color="muted">{entry.time}</ThemedText>
              </View>
            </View>
          </ThemedCard>
        ))}

        <ThemedSeparator />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          <ThemedText variant="label" color="secondary">YESTERDAY</ThemedText>
          <ThemedBadge text="6h 15m total" variant="accent" />
        </View>

        <ThemedCard padding="md">
          <View style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText variant="body">Code Review</ThemedText>
              <ThemedText variant="body" color="accent">2h 00m</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText variant="bodySmall" color="tertiary">Internal</ThemedText>
              <ThemedText variant="caption" color="muted">10:00 - 12:00</ThemedText>
            </View>
          </View>
        </ThemedCard>
      </ScrollView>
    </ThemedScreen>
  );
}

// ============================================================
// EXAMPLE: Login Screen
// ============================================================
function ExampleLoginScreen() {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ThemedScreen>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: spacing.xxl,
          gap: spacing.lg,
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <ThemedText variant="h1" align="center">Time Tracker</ThemedText>
          <ThemedText variant="body" color="secondary" align="center">
            Sign in to continue
          </ThemedText>
        </View>

        <ThemedInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          label="Email"
        />

        <ThemedInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          label="Password"
        />

        <ThemedButton
          title="Forgot Password?"
          variant="ghost"
          size="sm"
          onPress={() => {}}
        />

        <ThemedButton
          title="Sign In"
          variant="primary"
          size="lg"
          onPress={() => {}}
        />

        <ThemedButton
          title="Create Account"
          variant="secondary"
          onPress={() => {}}
        />
      </ScrollView>
    </ThemedScreen>
  );
}

// ============================================================
// EXAMPLE: Settings Screen
// ============================================================
function ExampleSettingsScreen() {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  return (
    <ThemedScreen>
      <ThemedHeader title="Settings" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <ThemedCard padding="none">
          <ThemedListItem
            title="Notifications"
            subtitle="Manage alerts and reminders"
            onPress={() => {}}
          />
          <ThemedSeparator />
          <ThemedListItem
            title="Appearance"
            subtitle="Theme and display options"
            onPress={() => {}}
          />
          <ThemedSeparator />
          <ThemedListItem
            title="Data & Sync"
            subtitle="Backup and synchronization"
            rightText="Synced"
            onPress={() => {}}
          />
        </ThemedCard>

        <ThemedText variant="label" color="secondary">ACCOUNT</ThemedText>
        <ThemedCard padding="none">
          <ThemedListItem
            title="Profile"
            subtitle="test@example.com"
            onPress={() => {}}
          />
          <ThemedSeparator />
          <ThemedListItem
            title="Subscription"
            subtitle="Pro Plan"
            rightText="Active"
            onPress={() => {}}
          />
        </ThemedCard>

        <View style={{ marginTop: spacing.lg }}>
          <ThemedButton
            title="Sign Out"
            variant="danger"
            onPress={() => {}}
          />
        </View>

        <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
          <ThemedText variant="caption" color="muted">Version 1.0.0</ThemedText>
        </View>
      </ScrollView>
    </ThemedScreen>
  );
}

// ============================================================
// EXAMPLE: Components Gallery
// ============================================================
function ExampleComponentsGallery() {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const [inputValue, setInputValue] = useState('');

  return (
    <ThemedScreen>
      <ThemedHeader title="Components" subtitle="UI Gallery" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        {/* Buttons */}
        <View style={{ gap: spacing.md }}>
          <ThemedText variant="label" color="secondary">BUTTONS</ThemedText>
          <ThemedButton title="Primary Button" variant="primary" onPress={() => {}} />
          <ThemedButton title="Secondary Button" variant="secondary" onPress={() => {}} />
          <ThemedButton title="Danger Button" variant="danger" onPress={() => {}} />
          <ThemedButton title="Accent Button" variant="accent" onPress={() => {}} />
          <ThemedButton title="Ghost Button" variant="ghost" onPress={() => {}} />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <ThemedButton title="Small" size="sm" onPress={() => {}} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedButton title="Medium" size="md" onPress={() => {}} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedButton title="Large" size="lg" onPress={() => {}} />
            </View>
          </View>
        </View>

        <ThemedSeparator />

        {/* Badges */}
        <View style={{ gap: spacing.md }}>
          <ThemedText variant="label" color="secondary">BADGES</ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <ThemedBadge text="Primary" variant="primary" />
            <ThemedBadge text="Success" variant="success" />
            <ThemedBadge text="Warning" variant="warning" />
            <ThemedBadge text="Danger" variant="danger" />
            <ThemedBadge text="Accent" variant="accent" />
          </View>
        </View>

        <ThemedSeparator />

        {/* Typography */}
        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="label" color="secondary">TYPOGRAPHY</ThemedText>
          <ThemedText variant="h1">Heading 1</ThemedText>
          <ThemedText variant="h2">Heading 2</ThemedText>
          <ThemedText variant="h3">Heading 3</ThemedText>
          <ThemedText variant="body">Body text - The quick brown fox jumps over the lazy dog.</ThemedText>
          <ThemedText variant="bodySmall" color="secondary">Body small - Secondary text for descriptions.</ThemedText>
          <ThemedText variant="caption" color="muted">Caption - Additional metadata</ThemedText>
        </View>

        <ThemedSeparator />

        {/* Inputs */}
        <View style={{ gap: spacing.md }}>
          <ThemedText variant="label" color="secondary">INPUTS</ThemedText>
          <ThemedInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Enter text..."
            label="Text Input"
          />
          <ThemedInput
            value=""
            onChangeText={() => {}}
            placeholder="With error"
            label="Error State"
            error="This field is required"
          />
          <ThemedInput
            value="Disabled input"
            onChangeText={() => {}}
            label="Disabled"
            disabled
          />
        </View>

        <ThemedSeparator />

        {/* Cards */}
        <View style={{ gap: spacing.md }}>
          <ThemedText variant="label" color="secondary">CARDS</ThemedText>
          <ThemedCard>
            <ThemedText variant="h3">Card Title</ThemedText>
            <ThemedText variant="body" color="secondary">
              This is a card with default styling that adapts to the theme.
            </ThemedText>
          </ThemedCard>
          <ThemedCard variant="elevated">
            <ThemedText variant="h3">Elevated Card</ThemedText>
            <ThemedText variant="body" color="secondary">
              This card has elevation/shadow effects.
            </ThemedText>
          </ThemedCard>
        </View>

        <ThemedSeparator />

        {/* Timer Styles */}
        <View style={{ gap: spacing.lg }}>
          <ThemedText variant="label" color="secondary">TIMER DISPLAY</ThemedText>
          <ThemedTimerDisplay time="00:00:00" />
          <ThemedTimerDisplay
            time="01:30:00"
            isRunning
            clientName="Demo Client"
            projectName="Demo Project"
          />
        </View>
      </ScrollView>
    </ThemedScreen>
  );
}

// ============================================================
// SCREEN TAB CONTENT
// ============================================================
type ScreenKey = 'timer' | 'history' | 'login' | 'settings' | 'components';

const SCREEN_TABS: Array<{ key: ScreenKey; label: string; icon: string }> = [
  { key: 'timer', label: 'Timer', icon: '⏱' },
  { key: 'history', label: 'History', icon: '📋' },
  { key: 'login', label: 'Login', icon: '🔐' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
  { key: 'components', label: 'Gallery', icon: '🎨' },
];

function ScreenContent({ screenKey }: { screenKey: ScreenKey }) {
  switch (screenKey) {
    case 'timer':
      return <ExampleTimerScreen />;
    case 'history':
      return <ExampleHistoryScreen />;
    case 'login':
      return <ExampleLoginScreen />;
    case 'settings':
      return <ExampleSettingsScreen />;
    case 'components':
      return <ExampleComponentsGallery />;
    default:
      return null;
  }
}

// ============================================================
// THEME PREVIEW CARD
// ============================================================
function ThemePreviewCard({
  theme,
  isSelected,
  onSelect,
}: {
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { colors, borderRadius, spacing } = theme;

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.8}
      testID={`theme-card-${theme.name}`}
      accessibilityLabel={`Select ${theme.displayName} theme`}
      style={{
        width: 100,
        marginRight: spacing.md,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: borderRadius.lg,
          backgroundColor: colors.background,
          borderWidth: isSelected ? 3 : 2,
          borderColor: isSelected ? colors.primary : colors.border,
          overflow: 'hidden',
          padding: spacing.xs,
        }}
      >
        {/* Mini preview */}
        <View style={{ flex: 1, gap: 2 }}>
          <View
            style={{
              height: 8,
              backgroundColor: colors.primary,
              borderRadius: 2,
            }}
          />
          <View
            style={{
              height: 6,
              width: '60%',
              backgroundColor: colors.textSecondary,
              borderRadius: 2,
            }}
          />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: colors.timerText, fontWeight: '200' }}>
              00:00
            </Text>
          </View>
          <View
            style={{
              height: 12,
              backgroundColor: colors.primary,
              borderRadius: borderRadius.sm,
            }}
          />
        </View>
      </View>
      <Text
        style={{
          marginTop: spacing.xs,
          fontSize: 11,
          fontWeight: isSelected ? '600' : '400',
          color: isSelected ? '#007AFF' : '#666',
          textAlign: 'center',
        }}
        numberOfLines={1}
      >
        {theme.displayName}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================
// MAIN SHOWCASE CONTENT
// ============================================================
function ThemeShowcaseContent({ onClose }: { onClose?: () => void }) {
  const { theme, themeName, setTheme } = useTheme();
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('timer');

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      {/* Theme Selector */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingTop: 60,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5E5',
        }}
      >
        {/* Close Button - inside the header */}
        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            testID="theme-showcase-close"
            accessibilityLabel="Close theme showcase"
            accessibilityRole="button"
            activeOpacity={0.7}
            style={{
              position: 'absolute',
              top: 56,
              right: 16,
              backgroundColor: 'rgba(0,0,0,0.5)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              zIndex: 10,
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '500' }}>Close</Text>
          </TouchableOpacity>
        )}
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#333',
            paddingHorizontal: 16,
            marginBottom: 12,
          }}
        >
          Theme Showcase
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {themeList.map((t) => (
            <ThemePreviewCard
              key={t.name}
              theme={t}
              isSelected={t.name === themeName}
              onSelect={() => setTheme(t.name)}
            />
          ))}
        </ScrollView>
        <Text
          style={{
            fontSize: 12,
            color: '#888',
            paddingHorizontal: 16,
            marginTop: 8,
          }}
        >
          {theme.description}
        </Text>
      </View>

      {/* Screen Preview */}
      <View style={{ flex: 1, margin: 12 }}>
        <View
          style={{
            flex: 1,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: theme.colors.background,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <ScreenContent screenKey={activeScreen} />
          <ThemedTabBar
            tabs={SCREEN_TABS}
            activeTab={activeScreen}
            onTabPress={(key) => setActiveScreen(key as ScreenKey)}
          />
        </View>
      </View>

      {/* Theme Info */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          padding: 16,
          paddingBottom: 34,
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
        }}
        testID="theme-info-panel"
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }} testID="active-theme-name">
              {theme.displayName}
            </Text>
            <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }} testID="theme-details">
              {theme.isDark ? 'Dark' : 'Light'} theme • {theme.special.buttonStyle} buttons • {theme.special.cardStyle} cards
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: 4,
            }}
          >
            {[theme.colors.primary, theme.colors.accent, theme.colors.success, theme.colors.danger].map(
              (color, i) => (
                <View
                  key={i}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: color,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.1)',
                  }}
                />
              )
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================
interface ThemeShowcaseScreenProps {
  onClose: () => void;
}

export function ThemeShowcaseScreen({ onClose }: ThemeShowcaseScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }} testID="theme-showcase-screen">
      <ThemeProvider>
        <ThemeShowcaseContent onClose={onClose} />
      </ThemeProvider>
    </View>
  );
}
