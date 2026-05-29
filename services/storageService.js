import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';

const KEYS = {
  ONBOARDING_DONE: 'bb_onboarding_done',
  USER_NAME: 'bb_user_name',
  USER_DEITY: 'bb_user_deity',
  USER_LANGUAGE: 'bb_user_language',
  USER_ID: 'bb_user_id',
};

// ─── Device ID ────────────────────────────────────────────────────────────────
export const getDeviceId = async () => {
  try {
    // Use real Android device ID
    const androidId = Application.getAndroidId();
    if (androidId) return androidId;

    // Fallback: generate and persist one
    const stored = await AsyncStorage.getItem(KEYS.USER_ID);
    if (stored) return stored;

    const generated = 'bb_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    await AsyncStorage.setItem(KEYS.USER_ID, generated);
    return generated;
  } catch (e) {
    return 'bb_unknown';
  }
};

// ─── Onboarding ───────────────────────────────────────────────────────────────
export const saveOnboarding = async ({ name, deity, language }) => {
  try {
    const userId = await getDeviceId();
    await AsyncStorage.multiSet([
      [KEYS.ONBOARDING_DONE, 'true'],
      [KEYS.USER_NAME, name],
      [KEYS.USER_DEITY, deity],
      [KEYS.USER_LANGUAGE, language],
      [KEYS.USER_ID, userId],
    ]);
    return userId;
  } catch (e) {
    console.error('[storageService] saveOnboarding error:', e);
  }
};

export const isOnboardingDone = async () => {
  try {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
    return val === 'true';
  } catch (e) {
    return false;
  }
};

export const getUserData = async () => {
  try {
    const values = await AsyncStorage.multiGet([
      KEYS.USER_NAME,
      KEYS.USER_DEITY,
      KEYS.USER_LANGUAGE,
      KEYS.USER_ID,
    ]);
    return {
      name: values[0][1],
      deity: values[1][1],
      language: values[2][1],
      userId: values[3][1],
    };
  } catch (e) {
    return null;
  }
};

// ─── Profile Edit ─────────────────────────────────────────────────────────────
export const updateUserProfile = async ({ name, deity, language }) => {
  try {
    const updates = [];
    if (name !== undefined) updates.push([KEYS.USER_NAME, name]);
    if (deity !== undefined) updates.push([KEYS.USER_DEITY, deity]);
    if (language !== undefined) updates.push([KEYS.USER_LANGUAGE, language]);
    if (updates.length > 0) await AsyncStorage.multiSet(updates);
    return true;
  } catch (e) {
    console.error('[storageService] updateUserProfile error:', e);
    return false;
  }
};

// ─── Streak ───────────────────────────────────────────────────────────────────
const STREAK_KEY = 'bb_streak';
const LAST_OPEN_KEY = 'bb_last_open';

export const updateStreak = async () => {
  try {
    const today = new Date().toDateString();
    const lastOpen = await AsyncStorage.getItem(LAST_OPEN_KEY);
    const streakVal = await AsyncStorage.getItem(STREAK_KEY);
    let streak = parseInt(streakVal ?? '0');

    if (lastOpen === today) return streak;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastOpen === yesterday.toDateString()) {
      streak += 1;
    } else {
      streak = 1;
    }

    await AsyncStorage.multiSet([
      [STREAK_KEY, String(streak)],
      [LAST_OPEN_KEY, today],
    ]);

    return streak;
  } catch (e) {
    return 1;
  }
};

export const getStreak = async () => {
  try {
    const val = await AsyncStorage.getItem(STREAK_KEY);
    return parseInt(val ?? '1');
  } catch (e) {
    return 1;
  }
};

// ─── Japa ─────────────────────────────────────────────────────────────────────
const JAPA_PREFIX = 'bb_japa_';

export const saveJapaSession = async (rounds, beads) => {
  try {
    const today = new Date().toDateString();
    const key = JAPA_PREFIX + today;
    const existing = await AsyncStorage.getItem(key);
    const prev = existing ? JSON.parse(existing) : { rounds: 0, beads: 0 };
    const updated = {
      rounds: prev.rounds + rounds,
      beads: prev.beads + beads,
      lastUpdated: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('[storageService] saveJapaSession error:', e);
  }
};

export const getJapaToday = async () => {
  try {
    const today = new Date().toDateString();
    const val = await AsyncStorage.getItem(JAPA_PREFIX + today);
    return val ? JSON.parse(val) : { rounds: 0, beads: 0 };
  } catch (e) {
    return { rounds: 0, beads: 0 };
  }
};

export const getJapaHistory = async () => {
  try {
    const history = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = JAPA_PREFIX + date.toDateString();
      const val = await AsyncStorage.getItem(key);
      history.push({
        date: date.toDateString(),
        ...(val ? JSON.parse(val) : { rounds: 0, beads: 0 }),
      });
    }
    return history;
  } catch (e) {
    return [];
  }
};