import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { isProfileComplete, isProfileReadyForGym } from '@/services/profileService';

export default function TabsLayout() {
  const { user, profile, profileLoading, initializing } = useAuth();

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
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
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
