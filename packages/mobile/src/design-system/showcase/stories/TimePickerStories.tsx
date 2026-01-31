import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { DSTimePicker } from '../../components/DSTimePicker';
import { DSText } from '../../components/DSText';
import { DSSpacer } from '../../components/DSSpacer';
import { DSCard } from '../../components/DSCard';
import { spacing } from '../../tokens';

function DefaultStory() {
  const [time, setTime] = useState(new Date());

  return (
    <View style={styles.container}>
      <DSText variant="h3">Default Time Picker</DSText>
      <DSSpacer size="md" />
      <DSCard variant="elevated" style={styles.card}>
        <DSTimePicker
          value={time}
          onChange={setTime}
          label="Select Time"
          testID="time-picker-default"
        />
      </DSCard>
      <DSSpacer size="sm" />
      <DSText variant="bodySmall" color="secondary">
        Selected: {time.toLocaleTimeString()}
      </DSText>
    </View>
  );
}

function WithoutLabelStory() {
  const [time, setTime] = useState(new Date());

  return (
    <View style={styles.container}>
      <DSText variant="h3">Without Label</DSText>
      <DSSpacer size="md" />
      <DSCard variant="elevated" style={styles.card}>
        <DSTimePicker
          value={time}
          onChange={setTime}
          testID="time-picker-no-label"
        />
      </DSCard>
    </View>
  );
}

function DisabledStory() {
  const [time] = useState(new Date());

  return (
    <View style={styles.container}>
      <DSText variant="h3">Disabled State</DSText>
      <DSSpacer size="md" />
      <DSCard variant="elevated" style={styles.card}>
        <DSTimePicker
          value={time}
          onChange={() => {}}
          label="Disabled Time"
          disabled
          testID="time-picker-disabled"
        />
      </DSCard>
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
      <DSSpacer size="md" />
      <DSCard variant="elevated" style={styles.card}>
        <DSTimePicker
          value={startTime}
          onChange={handleStartChange}
          label="Start Time"
          maximumDate={endTime}
          testID="time-picker-start"
        />
        <DSSpacer size="sm" />
        <DSTimePicker
          value={endTime}
          onChange={handleEndChange}
          label="End Time"
          minimumDate={startTime}
          testID="time-picker-end"
        />
      </DSCard>
      <DSSpacer size="sm" />
      <DSText variant="bodySmall" color="secondary">
        Duration: {hours > 0 ? `${hours}h ` : ''}{minutes}m
      </DSText>
    </View>
  );
}

function InlineStory() {
  const [time, setTime] = useState(new Date());

  return (
    <View style={styles.container}>
      <DSText variant="h3">Inline Picker (iOS)</DSText>
      <DSText variant="bodySmall" color="secondary">
        Shows the picker directly without a modal
      </DSText>
      <DSSpacer size="md" />
      <DSCard variant="elevated" style={styles.card}>
        <DSTimePicker.Inline
          value={time}
          onChange={setTime}
          label="Time"
          testID="time-picker-inline"
        />
      </DSCard>
      <DSSpacer size="sm" />
      <DSText variant="bodySmall" color="secondary">
        Selected: {time.toLocaleTimeString()}
      </DSText>
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
  card: {
    padding: spacing.md,
  },
});
