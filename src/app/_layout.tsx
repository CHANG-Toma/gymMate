import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Spacing } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { initializing, configError } = useAuth();

  useEffect(() => {
    if (!initializing) {
      SplashScreen.hideAsync();
    }
  }, [initializing]);

  if (initializing) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={Brand.accent} />
        <Text style={styles.bootText}>Chargement de la session…</Text>
      </View>
    );
  }

  return (
    <>
      {configError ? (
        <View style={styles.configBanner}>
          <Text style={styles.configText}>{configError}</Text>
        </View>
      ) : null}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Brand.black },
          headerTintColor: Brand.white,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Brand.black },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Connexion' }} />
        <Stack.Screen name="register" options={{ title: 'Inscription' }} />
        <Stack.Screen name="profile" options={{ title: 'Mon profil' }} />
        <Stack.Screen name="choose-gym" options={{ title: 'Choisir une box' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="member/[userId]" options={{ title: 'Profil athlète' }} />
        <Stack.Screen name="request/[userId]" options={{ title: 'Proposer un WOD' }} />
        <Stack.Screen name="+not-found" options={{ title: 'Introuvable' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: Brand.black,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  bootText: {
    color: Brand.muted,
    fontSize: 14,
  },
  configBanner: {
    backgroundColor: Brand.surface,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  configText: {
    color: Brand.accent,
    fontSize: 12,
    lineHeight: 16,
  },
});
