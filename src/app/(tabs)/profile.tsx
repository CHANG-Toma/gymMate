import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { logout, mapAuthError } from '@/services/authService';
import { useState } from 'react';

export default function AccountScreen() {
  const { user, profile } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <Redirect href="/login" />;
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }
    setLoggingOut(true);
    setError(null);
    try {
      await logout();
      router.replace('/');
    } catch (err) {
      setError(mapAuthError(err));
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.kicker}>MON COMPTE</Text>
        <Text style={styles.title}>{profile?.displayName || 'Athlète'}</Text>
        <Text style={styles.meta}>{user.email}</Text>
        <Text style={styles.meta}>
          {profile?.city || 'Ville non renseignée'}
          {profile?.gymId ? `, box ${profile.gymId}` : ''}
        </Text>
        <Text style={styles.meta}>
          {profile?.goal || 'Focus non renseigné'}, {profile?.level || 'niveau'}
        </Text>

        <PrimaryButton
          label="Modifier mon profil"
          onPress={() => router.push('/profile')}
          style={styles.button}
        />
        <PrimaryButton
          label={loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
          variant="ghost"
          onPress={handleLogout}
          loading={loggingOut}
          disabled={loggingOut}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.black,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  kicker: {
    color: Brand.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: Brand.white,
    fontSize: 28,
    fontWeight: '800',
  },
  meta: {
    color: Brand.muted,
    fontSize: 15,
  },
  button: {
    marginTop: Spacing.four,
  },
  error: {
    color: '#FF5A3D',
    fontWeight: '700',
  },
});
