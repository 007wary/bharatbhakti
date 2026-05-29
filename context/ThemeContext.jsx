import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import colors from '../constants/colors';
import { loadTheme, saveTheme } from '../services/themeService';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeSetting, setThemeSetting] = useState('system');

  useEffect(() => {
    loadTheme().then(setThemeSetting);
  }, []);

  const setTheme = (value) => {
    setThemeSetting(value);
    saveTheme(value);
  };

  const resolvedScheme =
    themeSetting === 'system' ? systemScheme ?? 'light' : themeSetting;

  const theme = colors[resolvedScheme];

  return (
    <ThemeContext.Provider value={{ theme, themeSetting, setTheme, resolvedScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);