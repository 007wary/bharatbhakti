import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'bharatbhakti_theme';

export const saveTheme = async (theme) => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.log('Error saving theme:', e);
  }
};

export const loadTheme = async () => {
  try {
    const theme = await AsyncStorage.getItem(THEME_KEY);
    return theme ?? 'system';
  } catch (e) {
    return 'system';
  }
};