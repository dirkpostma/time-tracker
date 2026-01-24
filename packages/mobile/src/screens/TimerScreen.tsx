import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface TimeEntry {
  id: string;
  client_id: string;
  started_at: string;
  ended_at: string | null;
}

interface Client {
  id: string;
  name: string;
}

export function TimerScreen() {
  const { user, signOut } = useAuth();
  const [running, setRunning] = useState<TimeEntry | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch running timer on mount
  const fetchRunningTimer = useCallback(async () => {
    setLoading(true);
    try {
      // Find running time entry (ended_at is null)
      const { data: entries, error } = await supabase
        .from('time_entries')
        .select('*')
        .is('ended_at', null)
        .limit(1);

      if (error) throw error;

      if (entries && entries.length > 0) {
        const entry = entries[0] as TimeEntry;
        setRunning(entry);

        // Fetch client name
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', entry.client_id)
          .single();

        if (clientData) {
          setClient(clientData as Client);
        }
      } else {
        setRunning(null);
        setClient(null);
      }
    } catch (error) {
      console.error('Error fetching timer:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRunningTimer();
  }, [fetchRunningTimer]);

  // Update elapsed time every second
  useEffect(() => {
    if (!running) {
      setElapsed(0);
      return;
    }

    const updateElapsed = () => {
      const started = new Date(running.started_at).getTime();
      const now = Date.now();
      setElapsed(Math.floor((now - started) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      // Get or create a default client
      let clientId: string;

      const { data: existingClients } = await supabase
        .from('clients')
        .select('id, name')
        .limit(1);

      if (existingClients && existingClients.length > 0) {
        clientId = existingClients[0].id;
        setClient(existingClients[0] as Client);
      } else {
        // Create a default client
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert({ name: 'Default Client' })
          .select()
          .single();

        if (error) throw error;
        clientId = newClient.id;
        setClient(newClient as Client);
      }

      // Create new time entry
      const { data: entry, error } = await supabase
        .from('time_entries')
        .insert({
          client_id: clientId,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setRunning(entry as TimeEntry);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start timer';
      Alert.alert('Error', message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    if (!running) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', running.id);

      if (error) throw error;
      setRunning(null);
      setClient(null);
      setElapsed(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to stop timer';
      Alert.alert('Error', message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      Alert.alert('Error', message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Time Tracker</Text>
        <TouchableOpacity onPress={handleLogout} testID="logout-button" accessibilityLabel="Logout">
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timer} testID="timer-display" accessibilityLabel="Timer">
          {formatTime(elapsed)}
        </Text>
        {client && (
          <Text style={styles.clientName} testID="client-name">
            {client.name}
          </Text>
        )}
      </View>

      <View style={styles.controls}>
        {running ? (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStop}
            disabled={actionLoading}
            testID="stop-button"
            accessibilityLabel="Stop Timer"
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Stop</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={handleStart}
            disabled={actionLoading}
            testID="start-button"
            accessibilityLabel="Start Timer"
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Start</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.email} testID="user-email">
        Logged in as {user?.email}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 64,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  clientName: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  controls: {
    paddingBottom: 40,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  email: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    paddingBottom: 20,
  },
});
