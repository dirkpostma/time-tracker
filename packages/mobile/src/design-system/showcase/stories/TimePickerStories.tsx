import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { DSTimePicker } from '../../components/DSTimePicker';
import { DSText } from '../../components/DSText';
import { DSSpacer } from '../../components/DSSpacer';
import { DSCard } from '../../components/DSCard';
import { colors, spacing } from '../../tokens';

function DefaultStory() {
  const [time, setTime] = useState(new Date());

  return (
    <View style={styles.container}>
      <DSText variant="h3">Default Time Picker</DSText>
      <DSText variant="bodySmall" color="secondary">
        Tap to open the time selection modal
      </DSText>
      <DSSpacer size="lg" />
      
      <DSTimePicker
        value={time}
        onChange={setTime}
        label="Select Time"
        testID="time-picker-default"
      />
      
      <DSSpacer size="md" />
      <View style={styles.resultBox}>
        <DSText variant="bodySmall" color="secondary">Selected:</DSText>
        <DSText variant="body">{time.toLocaleTimeString()}</DSText>
      </View>
    </View>
  );
}

function WithoutLabelStory() {
  const [time, setTime] = useState(new Date());

  return (
    <View style={styles.container}>
      <DSText variant="h3">Without Label</DSText>
      <DSText variant="bodySmall" color="secondary">
        Time picker without a label
      </DSText>
      <DSSpacer size="lg" />
      
      <DSTimePicker
        value={time}
        onChange={setTime}
        testID="time-picker-no-label"
      />
    </View>
  );
}

function DisabledStory() {
  const [time] = useState(new Date());

  return (
    <View style={styles.container}>
      <DSText variant="h3">Disabled State</DSText>
      <DSText variant="bodySmall" color="secondary">
        Non-interactive time picker
      </DSText>
      <DSSpacer size="lg" />
      
      <DSTimePicker
        value={time}
        onChange={() => {}}
        label="Disabled Time"
        disabled
        testID="time-picker-disabled"
      />
    </View>
  );
}

function StartEndStory() {
  const now = new Date();
  const [startTime, setStartTime] = useState(new Date(now.getTime() - 3600000)); // 1 hour ago
  const [endTime, setEndTime] = useState(now);

  const handleStartChange = (date: Date) => {
    if (date < endTime) {
      setStartTime(date);
    }
  };

  const handleEndChange = (date: Date) => {
    if (date > startTime) {
      setEndTime(date);
    }
  };

  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return (
    <View style={styles.container}>
      <DSText variant="h3">Start & End Time</DSText>
      <DSText variant="bodySmall" color="secondary">
        Two linked pickers with duration calculation
      </DSText>
      <DSSpacer size="lg" />
      
      <DSTimePicker
        value={startTime}
        onChange={handleStartChange}
        label="Start Time"
        maximumDate={endTime}
        testID="time-picker-start"
      />
      
      <DSSpacer size="md" />
      
      <DSTimePicker
        value={endTime}
        onChange={handleEndChange}
        label="End Time"
        minimumDate={startTime}
        testID="time-picker-end"
      />
      
      <DSSpacer size="lg" />
      <View style={styles.durationBox}>
        <DSText variant="bodySmall" color="secondary">Duration</DSText>
        <DSText variant="h2" color="primary">
          {hours > 0 ? `${hours}h ` : ''}{minutes}m
        </DSText>
      </View>
    </View>
  );
}

function InlineStory() {
  const [time, setTime] = useState(new Date());

  return (
    <View style={styles.container}>
      <DSText variant="h3">Inline Picker</DSText>
      <DSText variant="bodySmall" color="secondary">
        Shows the picker directly without a modal (iOS spinner)
      </DSText>
      <DSSpacer size="lg" />
      
      <DSTimePicker.Inline
        value={time}
        onChange={setTime}
        label="Time"
        testID="time-picker-inline"
      />
      
      <DSSpacer size="md" />
      <View style={styles.resultBox}>
        <DSText variant="bodySmall" color="secondary">Selected:</DSText>
        <DSText variant="body">{time.toLocaleTimeString()}</DSText>
      </View>
    </View>
  );
}

export const TimePickerStories = {
  Default: DefaultStory,
  WithoutLabel: WithoutLabelStory,
  Disabled: DisabledStory,
  StartEnd: StartEndStory,
  Inline: InlineStory,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resultBox: {
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  durationBox: {
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    alignItems: 'center',
  },
});
