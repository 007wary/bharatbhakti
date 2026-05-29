import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Keys ────────────────────────────────────────────────────────────────────
const XP_KEY = 'bb_xp_total';
const LEVEL_KEY = 'bb_level';
const LAST_DAILY_XP_KEY = 'bb_last_daily_xp';

// ─── Levels ───────────────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, name: 'Shishya', hindi: 'शिष्य', xpRequired: 0 },
  { level: 2, name: 'Sadhak', hindi: 'साधक', xpRequired: 100 },
  { level: 3, name: 'Bhakt', hindi: 'भक्त', xpRequired: 250 },
  { level: 4, name: 'Sevak', hindi: 'सेवक', xpRequired: 500 },
  { level: 5, name: 'Gyani', hindi: 'ज्ञानी', xpRequired: 1000 },
  { level: 6, name: 'Yogi', hindi: 'योगी', xpRequired: 2000 },
  { level: 7, name: 'Rishi', hindi: 'ऋषि', xpRequired: 3500 },
  { level: 8, name: 'Mahatma', hindi: 'महात्मा', xpRequired: 5000 },
  { level: 9, name: 'Param Bhakt', hindi: 'परम भक्त', xpRequired: 7500 },
  { level: 10, name: 'Siddha', hindi: 'सिद्ध', xpRequired: 10000 },
];

// ─── XP Rewards ───────────────────────────────────────────────────────────────
export const XP_REWARDS = {
  DAILY_OPEN: 5,
  JAPA_ROUND: 10,
  GRANTH_CHAPTER: 15,
  STREAK_BONUS: 5,
  JAPA_FULL_MALA: 10,
};

// ─── Get Level Info from XP ───────────────────────────────────────────────────
export const getLevelFromXP = (xp) => {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }

  const xpIntoLevel = nextLevel
    ? xp - currentLevel.xpRequired
    : currentLevel.xpRequired;
  const xpNeededForNext = nextLevel
    ? nextLevel.xpRequired - currentLevel.xpRequired
    : 0;
  const progress = nextLevel ? xpIntoLevel / xpNeededForNext : 1;

  return {
    currentLevel,
    nextLevel,
    xpIntoLevel,
    xpNeededForNext,
    progress,
    totalXP: xp,
  };
};

// ─── Get XP Data ──────────────────────────────────────────────────────────────
export const getXPData = async () => {
  try {
    const xp = await AsyncStorage.getItem(XP_KEY);
    return getLevelFromXP(parseInt(xp ?? '0'));
  } catch (e) {
    return getLevelFromXP(0);
  }
};

// ─── Award XP ─────────────────────────────────────────────────────────────────
export const awardXP = async (amount) => {
  try {
    const current = await AsyncStorage.getItem(XP_KEY);
    const currentXP = parseInt(current ?? '0');
    const newXP = currentXP + amount;

    const oldLevelInfo = getLevelFromXP(currentXP);
    const newLevelInfo = getLevelFromXP(newXP);

    await AsyncStorage.setItem(XP_KEY, String(newXP));

    const leveledUp = newLevelInfo.currentLevel.level > oldLevelInfo.currentLevel.level;

    return {
      xpAwarded: amount,
      totalXP: newXP,
      levelInfo: newLevelInfo,
      leveledUp,
      newLevel: leveledUp ? newLevelInfo.currentLevel : null,
    };
  } catch (e) {
    console.error('[xpService] awardXP error:', e);
    return null;
  }
};

// ─── Award Daily Open XP (once per day) ──────────────────────────────────────
export const awardDailyOpenXP = async () => {
  try {
    const today = new Date().toDateString();
    const lastDaily = await AsyncStorage.getItem(LAST_DAILY_XP_KEY);
    if (lastDaily === today) return null; // already awarded today

    await AsyncStorage.setItem(LAST_DAILY_XP_KEY, today);
    return await awardXP(XP_REWARDS.DAILY_OPEN);
  } catch (e) {
    console.error('[xpService] awardDailyOpenXP error:', e);
    return null;
  }
};