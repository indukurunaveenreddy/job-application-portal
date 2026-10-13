import { Platform } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../config/api';

export const BACKGROUND_JOB_SYNC_TASK = 'BACKGROUND_JOB_SYNC_TASK';

// Configure notification behavior
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Define background task
  TaskManager.defineTask(BACKGROUND_JOB_SYNC_TASK, async () => {
  try {
    console.log('[BACKGROUND TASK] Checking for fresh daily jobs...');

    // 1. Trigger or check daily sync from API
    const res = await fetch(ENDPOINTS.syncDaily, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 1000 }),
    });

    const data = await res.json();
    const lastSync = new Date().toISOString();
    await AsyncStorage.setItem('last_daily_sync', lastSync);

    // 2. Trigger notification to alert the user of fresh jobs
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Daily Fresh Jobs Alert',
        body: `1,000+ new jobs updated today across Bangalore & Hyderabad from LinkedIn and Naukri!`,
        sound: true,
        data: { screen: 'Explore', timestamp: lastSync },
      },
      trigger: null, // deliver immediately upon task execution
    });

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.warn('[BACKGROUND TASK] Failed to execute background job sync:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
}

// Register background task
export async function registerBackgroundSync() {
  if (Platform.OS === 'web') return;
  try {
    // Request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Register Background Fetch Task
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_JOB_SYNC_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_JOB_SYNC_TASK, {
        minimumInterval: 60 * 60 * 24, // 24 hours in seconds
        stopOnTerminate: false, // Keep running after app terminates
        startOnBoot: true, // Start on device boot
      });
      console.log('[BACKGROUND TASK] Daily job sync background task successfully registered');
    }
  } catch (err) {
    console.warn('[BACKGROUND TASK] Error registering background sync:', err);
  }
}

// Unregister background task if needed
export async function unregisterBackgroundSync() {
  if (Platform.OS === 'web') return;
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_JOB_SYNC_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_JOB_SYNC_TASK);
    }
  } catch (err) {
    console.warn('[BACKGROUND TASK] Error unregistering task:', err);
  }
}
