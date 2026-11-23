import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { isProfileComplete, isProfileReadyForGym } from '@/services/profileService';

const TAB_BAR_CONTENT_HEIGHT = 52;

export default function TabsLayout() {
  const { user, profile, profileLoading, initializing } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);

  if (initializing || profileLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Brand.black, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Brand.accent} size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!isProfileReadyForGym(profile)) {
    return <Redirect href="/profile" />;
  }

  if (!isProfileComplete(profile)) {
    return <Redirect href="/choose-gym" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Brand.black },
        headerTintColor: Brand.white,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        tabBarActiveTintColor: Brand.accent,
        tabBarInactiveTintColor: Brand.faint,
        tabBarStyle: {
          backgroundColor: Brand.black,
          borderTopColor: Brand.border,
          height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: 0,
        },
      }}>
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Découvrir',
          tabBarLabel: 'Découvrir',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Demandes',
          tabBarLabel: 'Demandes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Séances',
          tabBarLabel: 'Séances',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
