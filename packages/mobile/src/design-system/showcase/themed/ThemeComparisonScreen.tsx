/**
 * Theme Comparison Screen
 * Shows all 5 themes side by side for easy comparison
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { ThemeProvider, useTheme } from '../../themes/ThemeContext';
import { Theme, themeList } from '../../themes';
import {
  ThemedScreen,
  ThemedText,
  ThemedButton,
  ThemedCard,
  ThemedTimerDisplay,
  ThemedBadge,
} from './ThemedComponents';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MINI_SCREEN_WIDTH = SCREEN_WIDTH * 0.75;

// ============================================================
// MINI TIMER PREVIEW
// ============================================================
function MiniTimerPreview() {
  const { theme } = useTheme();
  const { colors, spacing, borderRadius } = theme;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 24,
          paddingBottom: 8,
          paddingHorizontal: 12,
          backgroundColor: colors.backgroundSecondary,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: colors.textPrimary,
          }}
        >
          Timer
        </Text>
      </View>

      {/* Timer */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 12 }}>
        <ThemedTimerDisplay time="01:23:45" isRunning />
        <View style={{ marginTop: 12, width: '100%' }}>
          <ThemedCard padding="sm">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedText variant="bodySmall">Acme Corp</ThemedText>
              <ThemedBadge text="Active" variant="success" size="sm" />
            </View>
          </ThemedCard>
        </View>
        <View style={{ marginTop: 12, width: '100%' }}>
          <ThemedButton title="Stop" variant="danger" size="sm" onPress={() => {}} />
        </View>
      </View>

      {/* Tab Bar Preview */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.backgroundSecondary,
          paddingVertical: 6,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
        }}
      >
        {['⏱', '📋', '⚙️'].map((icon, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 4,
              backgroundColor: i === 0 ? colors.primaryLight + '30' : 'transparent',
              borderRadius: borderRadius.sm,
              marginHorizontal: 2,
            }}
          >
            <Text style={{ fontSize: 14 }}>{icon}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ============================================================
// THEME CARD WITH PREVIEW
// ============================================================
function ThemeCard({ theme }: { theme: Theme }) {
  const { colors, borderRadius, shadows, special } = theme;

  return (
    <View
      style={{
        width: MINI_SCREEN_WIDTH,
        marginRight: 16,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
        ...shadows.lg,
      }}
    >
      {/* Theme Info Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          padding: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textOnPrimary }}>
          {theme.displayName}
        </Text>
        <Text style={{ fontSize: 11, color: colors.textOnPrimary, opacity: 0.8, marginTop: 2 }}>
          {theme.description}
        </Text>
      </View>

      {/* Mini Screen Preview */}
      <View style={{ height: 280 }}>
        <ThemeProvider initialTheme={theme.name}>
          <MiniTimerPreview />
        </ThemeProvider>
      </View>

      {/* Theme Details */}
      <View
        style={{
          padding: 12,
          backgroundColor: '#f8f8f8',
          borderTopWidth: 1,
          borderTopColor: '#eee',
        }}
      >
        {/* Color Palette */}
        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
          {[
            colors.primary,
            colors.accent,
            colors.success,
            colors.danger,
            colors.background,
            colors.textPrimary,
          ].map((color, i) => (
            <View
              key={i}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: color,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.1)',
              }}
            />
          ))}
        </View>

        {/* Theme Features */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          <View
            style={{
              backgroundColor: '#e0e0e0',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 9, color: '#666' }}>{theme.isDark ? 'Dark' : 'Light'}</Text>
          </View>
          <View
            style={{
              backgroundColor: '#e0e0e0',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 9, color: '#666' }}>{special.buttonStyle}</Text>
          </View>
          <View
            style={{
              backgroundColor: '#e0e0e0',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 9, color: '#666' }}>{special.timerStyle}</Text>
          </View>
          <View
            style={{
              backgroundColor: '#e0e0e0',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 9, color: '#666' }}>{special.cardStyle}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================================
// ELEMENT COMPARISON ROW
// ============================================================
function ElementComparisonRow({
  title,
  renderElement,
}: {
  title: string;
  renderElement: () => React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#333',
          marginBottom: 12,
          paddingHorizontal: 16,
        }}
      >
        {title}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {themeList.map((theme) => (
          <View
            key={theme.name}
            style={{
              width: 140,
              marginRight: 12,
              padding: 12,
              backgroundColor: theme.colors.background,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <ThemeProvider initialTheme={theme.name}>
              {renderElement()}
            </ThemeProvider>
            <Text
              style={{
                fontSize: 9,
                color: '#888',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              {theme.displayName}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================================
// BUTTON COMPARISON
// ============================================================
function ButtonComparison() {
  return (
    <View style={{ gap: 8 }}>
      <ThemedButton title="Primary" variant="primary" size="sm" onPress={() => {}} />
      <ThemedButton title="Secondary" variant="secondary" size="sm" onPress={() => {}} />
      <ThemedButton title="Ghost" variant="ghost" size="sm" onPress={() => {}} />
    </View>
  );
}

// ============================================================
// CARD COMPARISON
// ============================================================
function CardComparison() {
  return (
    <ThemedCard padding="sm">
      <ThemedText variant="bodySmall">Card Content</ThemedText>
      <ThemedText variant="caption" color="secondary">Subtitle</ThemedText>
    </ThemedCard>
  );
}

// ============================================================
// TIMER COMPARISON
// ============================================================
function TimerComparison() {
  return <ThemedTimerDisplay time="12:34" isRunning />;
}

// ============================================================
// BADGE COMPARISON
// ============================================================
function BadgeComparison() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
      <ThemedBadge text="Active" variant="success" size="sm" />
      <ThemedBadge text="Pending" variant="warning" size="sm" />
    </View>
  );
}

// ============================================================
// MAIN COMPARISON SCREEN
// ============================================================
interface ThemeComparisonScreenProps {
  onClose: () => void;
}

export function ThemeComparisonScreen({ onClose }: ThemeComparisonScreenProps) {
  const [view, setView] = useState<'carousel' | 'elements'>('carousel');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F0F0' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5E5',
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#333' }}>
            Theme Comparison
          </Text>
          <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
            5 unique visual styles
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={{
            backgroundColor: '#007AFF',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* View Toggle */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#fff',
          padding: 8,
          gap: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => setView('carousel')}
          style={{
            flex: 1,
            paddingVertical: 10,
            backgroundColor: view === 'carousel' ? '#007AFF' : '#f0f0f0',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: view === 'carousel' ? '#fff' : '#666',
            }}
          >
            Full Screens
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setView('elements')}
          style={{
            flex: 1,
            paddingVertical: 10,
            backgroundColor: view === 'elements' ? '#007AFF' : '#f0f0f0',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: view === 'elements' ? '#fff' : '#666',
            }}
          >
            UI Elements
          </Text>
        </TouchableOpacity>
      </View>

      {view === 'carousel' ? (
        // Theme Carousel
        <ScrollView
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={MINI_SCREEN_WIDTH + 16}
          contentContainerStyle={{
            paddingHorizontal: (SCREEN_WIDTH - MINI_SCREEN_WIDTH) / 2,
            paddingVertical: 24,
          }}
        >
          {themeList.map((theme) => (
            <ThemeCard key={theme.name} theme={theme} />
          ))}
        </ScrollView>
      ) : (
        // Element Comparison
        <ScrollView contentContainerStyle={{ paddingVertical: 24 }}>
          <ElementComparisonRow title="Buttons" renderElement={() => <ButtonComparison />} />
          <ElementComparisonRow title="Cards" renderElement={() => <CardComparison />} />
          <ElementComparisonRow title="Timer Display" renderElement={() => <TimerComparison />} />
          <ElementComparisonRow title="Badges" renderElement={() => <BadgeComparison />} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
