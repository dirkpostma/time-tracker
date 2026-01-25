/**
 * Themed Components
 * Reusable components that adapt to the current theme
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../themes/ThemeContext';
import { Theme } from '../../themes';

// ============================================================
// THEMED TEXT
// ============================================================
interface ThemedTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'timer' | 'label';
  color?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'accent' | 'inverse' | 'onPrimary';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  children: React.ReactNode;
}

export function ThemedText({
  variant = 'body',
  color = 'primary',
  align = 'left',
  style,
  children,
}: ThemedTextProps) {
  const { theme } = useTheme();
  const { colors, typography } = theme;

  const variantStyles: Record<string, TextStyle> = {
    h1: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tight,
    },
    h2: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: typography.letterSpacing.tight,
    },
    h3: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
    },
    body: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.normal,
    },
    bodySmall: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
    },
    caption: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.normal,
      letterSpacing: typography.letterSpacing.wide,
    },
    timer: {
      fontSize: typography.fontSize.timer,
      fontWeight: typography.fontWeight.thin,
      letterSpacing: typography.letterSpacing.extraWide,
      fontVariant: ['tabular-nums'],
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide,
      textTransform: 'uppercase',
    },
  };

  const colorMap: Record<string, string> = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    muted: colors.textMuted,
    accent: colors.accent,
    inverse: colors.textInverse,
    onPrimary: colors.textOnPrimary,
  };

  return (
    <Text
      style={[
        variantStyles[variant],
        { color: colorMap[color], textAlign: align },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ============================================================
// THEMED BUTTON
// ============================================================
interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function ThemedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
}: ThemedButtonProps) {
  const { theme } = useTheme();
  const { colors, spacing, borderRadius, shadows, special, typography } = theme;

  const getBorderRadius = () => {
    switch (special.buttonStyle) {
      case 'pill':
        return borderRadius.full;
      case 'sharp':
        return borderRadius.none;
      case 'soft':
        return borderRadius.lg;
      case 'outlined':
        return borderRadius.md;
      default:
        return borderRadius.md;
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.backgroundTertiary;
      case 'danger':
        return colors.danger;
      case 'accent':
        return colors.accent;
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textInverse;
    switch (variant) {
      case 'primary':
      case 'danger':
      case 'accent':
        return colors.textOnPrimary;
      case 'secondary':
        return colors.textPrimary;
      case 'ghost':
        return colors.primary;
      default:
        return colors.textOnPrimary;
    }
  };

  const getBorderStyle = (): ViewStyle => {
    if (special.buttonStyle === 'outlined' && variant !== 'primary') {
      return {
        borderWidth: 2,
        borderColor: variant === 'ghost' ? colors.primary : colors.border,
      };
    }
    return {};
  };

  const paddingMap = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
  };

  const fontSizeMap = {
    sm: typography.fontSize.sm,
    md: typography.fontSize.md,
    lg: typography.fontSize.lg,
  };

  const shadowStyle = special.buttonStyle === 'sharp' ? shadows.sm : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: getBackgroundColor(),
          borderRadius: getBorderRadius(),
          ...paddingMap[size],
          ...getBorderStyle(),
          ...shadowStyle,
          opacity: disabled ? 0.6 : 1,
        },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          style={{
            color: getTextColor(),
            fontSize: fontSizeMap[size],
            fontWeight: typography.fontWeight.semibold,
            letterSpacing: special.buttonStyle === 'sharp' ? typography.letterSpacing.wide : 0,
            textTransform: special.buttonStyle === 'sharp' ? 'uppercase' : 'none',
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ============================================================
// THEMED CARD
// ============================================================
interface ThemedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function ThemedCard({
  children,
  variant = 'default',
  padding = 'md',
  style,
}: ThemedCardProps) {
  const { theme } = useTheme();
  const { colors, spacing, borderRadius, shadows, special } = theme;

  const getCardStyle = (): ViewStyle => {
    const base: ViewStyle = {
      backgroundColor: colors.backgroundCard,
      borderRadius: special.buttonStyle === 'sharp' ? 0 : borderRadius.lg,
    };

    switch (special.cardStyle) {
      case 'glass':
        return {
          ...base,
          backgroundColor: colors.backgroundCard,
          borderWidth: 1,
          borderColor: colors.borderLight,
        };
      case 'bordered':
        return {
          ...base,
          borderWidth: 2,
          borderColor: colors.border,
          backgroundColor: colors.backgroundElevated,
        };
      case 'elevated':
        return {
          ...base,
          ...shadows.md,
        };
      case 'gradient':
        return {
          ...base,
          ...shadows.sm,
        };
      default:
        return base;
    }
  };

  const paddingMap = {
    none: 0,
    sm: spacing.sm,
    md: spacing.lg,
    lg: spacing.xl,
  };

  return (
    <View
      style={[
        getCardStyle(),
        { padding: paddingMap[padding] },
        variant === 'elevated' && shadows.md,
        variant === 'outlined' && { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ============================================================
// THEMED INPUT
// ============================================================
interface ThemedInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  style?: ViewStyle;
}

export function ThemedInput({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  disabled = false,
  multiline = false,
  style,
}: ThemedInputProps) {
  const { theme } = useTheme();
  const { colors, spacing, borderRadius, typography, special } = theme;

  const getInputStyle = (): ViewStyle => {
    const base: ViewStyle = {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    };

    switch (special.inputStyle) {
      case 'underline':
        return {
          ...base,
          borderBottomWidth: 2,
          borderBottomColor: error ? colors.danger : colors.border,
          backgroundColor: 'transparent',
          paddingHorizontal: 0,
        };
      case 'outlined':
        return {
          ...base,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: borderRadius.md,
          backgroundColor: 'transparent',
        };
      case 'filled':
        return {
          ...base,
          backgroundColor: colors.backgroundTertiary,
          borderRadius: borderRadius.lg,
          borderWidth: 0,
        };
      case 'minimal':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return base;
    }
  };

  return (
    <View style={[{ width: '100%' }, style]}>
      {label && (
        <Text
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.textSecondary,
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        editable={!disabled}
        multiline={multiline}
        style={[
          getInputStyle(),
          {
            fontSize: typography.fontSize.md,
            color: colors.textPrimary,
            opacity: disabled ? 0.5 : 1,
          },
          multiline && { minHeight: 100, textAlignVertical: 'top' },
        ]}
      />
      {error && (
        <Text
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.danger,
            marginTop: spacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

// ============================================================
// THEMED TIMER DISPLAY
// ============================================================
interface ThemedTimerDisplayProps {
  time: string;
  isRunning?: boolean;
  clientName?: string;
  projectName?: string;
  taskName?: string;
}

export function ThemedTimerDisplay({
  time,
  isRunning = false,
  clientName,
  projectName,
  taskName,
}: ThemedTimerDisplayProps) {
  const { theme } = useTheme();
  const { colors, typography, spacing, shadows, special, borderRadius } = theme;

  const getTimerStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (special.timerStyle) {
      case 'neon':
        return {
          container: {
            padding: spacing.xl,
          },
          text: {
            color: colors.timerText,
            textShadowColor: colors.timerGlow,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: isRunning ? 20 : 10,
          },
        };
      case 'digital':
        return {
          container: {
            backgroundColor: colors.backgroundCard,
            padding: spacing.xl,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.borderLight,
          },
          text: {
            color: colors.timerText,
            fontFamily: typography.fontFamily.mono,
          },
        };
      case 'minimal':
        return {
          container: {
            padding: spacing.lg,
          },
          text: {
            color: colors.timerText,
            fontWeight: typography.fontWeight.thin,
          },
        };
      case 'bold':
        return {
          container: {
            padding: spacing.lg,
          },
          text: {
            color: colors.textPrimary,
            fontWeight: typography.fontWeight.bold,
            letterSpacing: typography.letterSpacing.tight,
          },
        };
      case 'analog':
        return {
          container: {
            backgroundColor: colors.backgroundCard,
            padding: spacing.xxl,
            borderRadius: borderRadius.full,
            ...shadows.md,
          },
          text: {
            color: colors.timerText,
          },
        };
      default:
        return {
          container: {},
          text: { color: colors.timerText },
        };
    }
  };

  const timerStyles = getTimerStyle();
  const hasContext = clientName || projectName || taskName;

  return (
    <View style={[{ alignItems: 'center' }, timerStyles.container]}>
      <Text
        style={[
          {
            fontSize: typography.fontSize.timer,
            fontWeight: typography.fontWeight.thin,
            letterSpacing: typography.letterSpacing.extraWide,
            fontVariant: ['tabular-nums'],
          },
          timerStyles.text,
        ]}
      >
        {time}
      </Text>
      {hasContext && (
        <View style={{ marginTop: spacing.lg, alignItems: 'center', gap: spacing.xs }}>
          {clientName && (
            <Text style={{ fontSize: typography.fontSize.md, color: colors.textSecondary }}>
              {clientName}
            </Text>
          )}
          {projectName && (
            <Text style={{ fontSize: typography.fontSize.sm, color: colors.textTertiary }}>
              {projectName}
            </Text>
          )}
          {taskName && (
            <Text style={{ fontSize: typography.fontSize.xs, color: colors.textMuted }}>
              {taskName}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// ============================================================
// THEMED BADGE
// ============================================================
interface ThemedBadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
  size?: 'sm' | 'md';
}

export function ThemedBadge({
  text,
  variant = 'primary',
  size = 'md',
}: ThemedBadgeProps) {
  const { theme } = useTheme();
  const { colors, spacing, borderRadius, typography, special } = theme;

  const colorMap = {
    primary: { bg: colors.primaryLight, text: colors.primaryDark },
    success: { bg: colors.success + '30', text: colors.success },
    warning: { bg: colors.warning + '30', text: colors.warning },
    danger: { bg: colors.danger + '30', text: colors.danger },
    accent: { bg: colors.accentLight, text: colors.accent },
  };

  const badgeColors = colorMap[variant];

  return (
    <View
      style={{
        backgroundColor: badgeColors.bg,
        paddingVertical: size === 'sm' ? spacing.xxs : spacing.xs,
        paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
        borderRadius: special.buttonStyle === 'sharp' ? 0 : borderRadius.full,
      }}
    >
      <Text
        style={{
          color: badgeColors.text,
          fontSize: size === 'sm' ? typography.fontSize.xs : typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

// ============================================================
// THEMED SCREEN CONTAINER
// ============================================================
interface ThemedScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ThemedScreen({ children, style }: ThemedScreenProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ============================================================
// THEMED HEADER
// ============================================================
interface ThemedHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export function ThemedHeader({ title, subtitle, rightAction }: ThemedHeaderProps) {
  const { theme } = useTheme();
  const { colors, spacing, typography, special } = theme;

  const getHeaderBackground = (): ViewStyle => {
    switch (special.headerStyle) {
      case 'transparent':
        return { backgroundColor: 'transparent' };
      case 'blur':
        return { backgroundColor: colors.backgroundCard };
      case 'gradient':
        return { backgroundColor: colors.primaryLight };
      default:
        return { backgroundColor: colors.background };
    }
  };

  return (
    <View
      style={[
        {
          paddingTop: spacing.xxxl + spacing.xl,
          paddingBottom: spacing.lg,
          paddingHorizontal: spacing.lg,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        },
        getHeaderBackground(),
        special.headerStyle !== 'transparent' && {
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        },
      ]}
    >
      <View>
        <Text
          style={{
            fontSize: typography.fontSize.xxl,
            fontWeight: typography.fontWeight.bold,
            color: special.headerStyle === 'gradient' ? colors.textOnPrimary : colors.textPrimary,
            letterSpacing: typography.letterSpacing.tight,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: typography.fontSize.sm,
              color: special.headerStyle === 'gradient' ? colors.textOnPrimary : colors.textSecondary,
              marginTop: spacing.xxs,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightAction && (
        <TouchableOpacity onPress={rightAction.onPress}>
          <Text
            style={{
              fontSize: typography.fontSize.md,
              color: special.headerStyle === 'gradient' ? colors.textOnPrimary : colors.primary,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            {rightAction.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================================
// THEMED LIST ITEM
// ============================================================
interface ThemedListItemProps {
  title: string;
  subtitle?: string;
  rightText?: string;
  onPress?: () => void;
  selected?: boolean;
}

export function ThemedListItem({
  title,
  subtitle,
  rightText,
  onPress,
  selected = false,
}: ThemedListItemProps) {
  const { theme } = useTheme();
  const { colors, spacing, borderRadius, typography, special } = theme;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: selected ? colors.primaryLight + '20' : colors.backgroundCard,
        borderRadius: special.buttonStyle === 'sharp' ? 0 : borderRadius.md,
        borderLeftWidth: selected ? 3 : 0,
        borderLeftColor: colors.primary,
        marginBottom: spacing.xs,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.fontSize.md,
            fontWeight: selected ? typography.fontWeight.semibold : typography.fontWeight.normal,
            color: colors.textPrimary,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.textTertiary,
              marginTop: spacing.xxs,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightText && (
        <Text
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.textMuted,
            fontVariant: ['tabular-nums'],
          }}
        >
          {rightText}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ============================================================
// THEMED SEPARATOR
// ============================================================
export function ThemedSeparator() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.colors.borderLight,
        marginVertical: theme.spacing.sm,
      }}
    />
  );
}

// ============================================================
// THEMED TAB BAR
// ============================================================
interface ThemedTabBarProps {
  tabs: Array<{ key: string; label: string; icon: string }>;
  activeTab: string;
  onTabPress: (key: string) => void;
}

export function ThemedTabBar({ tabs, activeTab, onTabPress }: ThemedTabBarProps) {
  const { theme } = useTheme();
  const { colors, spacing, borderRadius, typography, special, shadows } = theme;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.isDark ? colors.backgroundSecondary : colors.background,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderTopWidth: special.buttonStyle === 'sharp' ? 2 : 1,
        borderTopColor: colors.borderLight,
        ...(!theme.isDark && shadows.sm),
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            testID={`themed-tab-${tab.key}`}
            accessibilityLabel={`${tab.label} tab`}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: spacing.sm,
              backgroundColor: isActive
                ? (special.buttonStyle === 'sharp' ? colors.primary : colors.primaryLight + '20')
                : 'transparent',
              borderRadius: special.buttonStyle === 'sharp' ? 0 : borderRadius.md,
            }}
          >
            <Text style={{ fontSize: 20, marginBottom: spacing.xxs }}>{tab.icon}</Text>
            <Text
              style={{
                fontSize: typography.fontSize.xs,
                fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.normal,
                color: isActive
                  ? (special.buttonStyle === 'sharp' ? colors.textOnPrimary : colors.primary)
                  : colors.textMuted,
                textTransform: special.buttonStyle === 'sharp' ? 'uppercase' : 'none',
                letterSpacing: special.buttonStyle === 'sharp' ? typography.letterSpacing.wide : 0,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
