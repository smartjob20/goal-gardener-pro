import { Preferences } from '@capacitor/preferences';

/**
 * Robust data persistence using Capacitor Preferences
 * (Survives OS cache clearing unlike localStorage)
 */

export const storage = {
  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  },

  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  },

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  },

  async clear(): Promise<void> {
    await Preferences.clear();
  },

  async keys(): Promise<string[]> {
    const { keys } = await Preferences.keys();
    return keys;
  },
};

// Specific storage keys for Deep Breath app
export const STORAGE_KEYS = {
  USER_NAME: 'deepbreath_user_name',
  USER_GOAL: 'deepbreath_user_goal',
  THEME: 'deepbreath_theme',
  ONBOARDING_COMPLETED: 'deepbreath_onboarding_completed',
} as const;
