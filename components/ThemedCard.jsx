import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemedCard({ style, ...props }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.border,
        },
        style,
      ]}
      {...props}
    />
  );
}