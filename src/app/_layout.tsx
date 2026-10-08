import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { Brand } from '@/constants/brand';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Brand.black },
        headerTintColor: Brand.white,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Brand.black },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="member/[userId]" options={{ title: 'Profil athlète' }} />
      <Stack.Screen name="request/[userId]" options={{ title: 'Proposer un WOD' }} />
      <Stack.Screen name="+not-found" options={{ title: 'Introuvable' }} />
    </Stack>
  );
}
