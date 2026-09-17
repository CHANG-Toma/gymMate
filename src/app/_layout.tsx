import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'GymMate', headerShown: false }} />
      <Stack.Screen name="discover" options={{ title: 'Découvrir' }} />
      <Stack.Screen name="member/[userId]" options={{ title: 'Profil' }} />
    </Stack>
  );
}
