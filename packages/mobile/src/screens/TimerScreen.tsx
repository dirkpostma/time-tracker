import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DescriptionInput } from '../components/DescriptionInput';
import { ClientPickerModal } from '../components/ClientPickerModal';
import { ProjectPickerModal } from '../components/ProjectPickerModal';
import { TaskPickerModal } from '../components/TaskPickerModal';
import { useRecentSelection } from '../hooks/useRecentSelection';

interface TimeEntry {
  id: string;
  client_id: string;
  started_at: string;
  ended_at: string | null;
  description?: string | null;
}

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  name: string;
}

export function TimerScreen() {
  const { user, signOut } = useAuth();
  const { selection, updateSelection } = useRecentSelection();
  const [running, setRunning] = useState<TimeEntry | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [description, setDescription] = useState('');
  const descriptionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Picker modal states
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [pendingClient, setPendingClient] = useState<Client | null>(null);
  const [pendingProject, setPendingProject] = useState<Project | null>(null);

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
        setDescription(entry.description || '');

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
        setDescription('');
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchRunningTimer();
    } finally {
      setRefreshing(false);
    }
  }, [fetchRunningTimer]);

  // Save description with debounce
  const saveDescription = useCallback(async (text: string) => {
    if (!running) return;
    try {
      await supabase
        .from('time_entries')
        .update({ description: text || null })
        .eq('id', running.id);
    } catch (error) {
      console.error('Error saving description:', error);
    }
  }, [running]);

  const handleDescriptionChange = useCallback((text: string) => {
    setDescription(text);

    // Clear existing debounce timer
    if (descriptionDebounceRef.current) {
      clearTimeout(descriptionDebounceRef.current);
    }

    // Set new debounce timer
    descriptionDebounceRef.current = setTimeout(() => {
      saveDescription(text);
    }, 500);
  }, [saveDescription]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (descriptionDebounceRef.current) {
        clearTimeout(descriptionDebounceRef.current);
      }
    };
  }, []);

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
    // If we have a recent selection, use it directly
    if (selection) {
      await startTimerWithSelection(
        selection.clientId,
        selection.clientName,
        selection.projectId,
        selection.projectName,
        selection.taskId,
        selection.taskName
      );
    } else {
      // Open client picker to make selection
      setShowClientPicker(true);
    }
  };

  const startTimerWithSelection = async (
    clientId: string,
    clientName: string,
    projectId?: string,
    projectName?: string,
    taskId?: string,
    taskName?: string
  ) => {
    setActionLoading(true);
    try {
      // Create new time entry
      const entryData: Record<string, unknown> = {
        client_id: clientId,
        started_at: new Date().toISOString(),
      };

      if (projectId) entryData.project_id = projectId;
      if (taskId) entryData.task_id = taskId;

      const { data: entry, error } = await supabase
        .from('time_entries')
        .insert(entryData)
        .select()
        .single();

      if (error) throw error;

      setRunning(entry as TimeEntry);
      setClient({ id: clientId, name: clientName });
      if (projectId && projectName) setProject({ id: projectId, name: projectName });
      if (taskId && taskName) setTask({ id: taskId, name: taskName });

      // Save as recent selection
      await updateSelection({
        clientId,
        clientName,
        projectId,
        projectName,
        taskId,
        taskName,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start timer';
      Alert.alert('Error', message);
    } finally {
      setActionLoading(false);
    }
  };

  // Client picker handlers
  const handleClientSelect = (selectedClient: Client) => {
    setPendingClient(selectedClient);
    setShowClientPicker(false);
    setShowProjectPicker(true);
  };

  const handleClientPickerClose = () => {
    setShowClientPicker(false);
    setPendingClient(null);
  };

  // Project picker handlers
  const handleProjectSelect = (selectedProject: Project) => {
    setPendingProject(selectedProject);
    setShowProjectPicker(false);
    setShowTaskPicker(true);
  };

  const handleProjectSkip = () => {
    setShowProjectPicker(false);
    if (pendingClient) {
      startTimerWithSelection(pendingClient.id, pendingClient.name);
    }
    setPendingClient(null);
  };

  const handleProjectPickerClose = () => {
    setShowProjectPicker(false);
    setPendingClient(null);
    setPendingProject(null);
  };

  // Task picker handlers
  const handleTaskSelect = (selectedTask: Task) => {
    setShowTaskPicker(false);
    if (pendingClient && pendingProject) {
      startTimerWithSelection(
        pendingClient.id,
        pendingClient.name,
        pendingProject.id,
        pendingProject.name,
        selectedTask.id,
        selectedTask.name
      );
    }
    setPendingClient(null);
    setPendingProject(null);
  };

  const handleTaskSkip = () => {
    setShowTaskPicker(false);
    if (pendingClient && pendingProject) {
      startTimerWithSelection(
        pendingClient.id,
        pendingClient.name,
        pendingProject.id,
        pendingProject.name
      );
    }
    setPendingClient(null);
    setPendingProject(null);
  };

  const handleTaskPickerClose = () => {
    setShowTaskPicker(false);
    setPendingClient(null);
    setPendingProject(null);
  };

  // Open client picker when selection button is tapped
  const handleSelectionPress = () => {
    if (!running) {
      setShowClientPicker(true);
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
      setProject(null);
      setTask(null);
      setElapsed(0);
      setDescription('');
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          testID="refresh-indicator"
        />
      }
    >
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
        <DescriptionInput
          value={description}
          onChangeText={handleDescriptionChange}
          editable={!!running}
        />
      </View>

      {!running && (
        <TouchableOpacity
          style={styles.selectionButton}
          onPress={handleSelectionPress}
          testID="selection-button"
        >
          {selection ? (
            <View style={styles.selectionContent}>
              <Text style={styles.selectionLabel}>Selected:</Text>
              <Text style={styles.selectionClient} testID="selected-client">
                {selection.clientName}
              </Text>
              {selection.projectName && (
                <Text style={styles.selectionProject} testID="selected-project">
                  {selection.projectName}
                </Text>
              )}
              {selection.taskName && (
                <Text style={styles.selectionTask} testID="selected-task">
                  {selection.taskName}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.selectionPlaceholder}>Tap to select client...</Text>
          )}
        </TouchableOpacity>
      )}

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

      <ClientPickerModal
        visible={showClientPicker}
        onClose={handleClientPickerClose}
        onSelect={handleClientSelect}
      />

      <ProjectPickerModal
        visible={showProjectPicker}
        clientId={pendingClient?.id || null}
        onClose={handleProjectPickerClose}
        onSelect={handleProjectSelect}
        onSkip={handleProjectSkip}
      />

      <TaskPickerModal
        visible={showTaskPicker}
        projectId={pendingProject?.id || null}
        onClose={handleTaskPickerClose}
        onSelect={handleTaskSelect}
        onSkip={handleTaskSkip}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flexGrow: 1,
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
  selectionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  selectionContent: {
    alignItems: 'center',
  },
  selectionLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  selectionClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectionProject: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selectionTask: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  selectionPlaceholder: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
