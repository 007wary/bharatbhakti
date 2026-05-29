import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemedText({ style, secondary, ...props }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[{ color: secondary ? theme.textSecondary : theme.text }, style]}
      {...props}
    />
  );
}