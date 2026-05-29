import { Tabs } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.tabIconActive,
        tabBarInactiveTintColor: theme.tabIconInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen name="aaj" options={{ title: 'Aaj', tabBarIcon: ({ color, size }) => <Ionicons name="sunny-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="mandir" options={{ title: 'Mandir', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="bhakti" options={{ title: 'Bhakti', tabBarIcon: ({ color, size }) => <Ionicons name="musical-notes-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="jyotish" options={{ title: 'Jyotish', tabBarIcon: ({ color, size }) => <Ionicons name="star-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="seva" options={{ title: 'Seva', tabBarIcon: ({ color, size }) => <Ionicons name="share-social-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}