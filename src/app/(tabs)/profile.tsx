import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { logout, mapAuthError } from '@/services/authService';
import { requestCurrentPosition } from '@/services/locationService';
import { updateUserLocation } from '@/services/profileService';

export default function AccountScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

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

  async function handleShareLocation() {
    if (sharingLocation) {
      return;
    }
    setSharingLocation(true);
    setError(null);
    setInfo(null);
    const result = await requestCurrentPosition();
    if (!result.ok) {
      setError(result.message);
      setSharingLocation(false);
      return;
    }
    try {
      await updateUserLocation(user!.uid, result.coords);
      await refreshProfile();
      setInfo('Position partagée pour le filtre distance.');
    } catch {
      setError('Impossible d’enregistrer la position.');
    } finally {
      setSharingLocation(false);
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
        <Text style={styles.meta}>
          {profile?.location ? 'Position partagée' : 'Position non partagée'}
        </Text>

        <PrimaryButton
          label="Modifier mon profil"
          onPress={() => router.push('/profile')}
          style={styles.button}
        />
        <PrimaryButton
          label={sharingLocation ? 'Localisation…' : 'Partager ma position'}
          variant="ghost"
          onPress={handleShareLocation}
          loading={sharingLocation}
          disabled={sharingLocation}
        />
        <PrimaryButton
          label={loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
          variant="ghost"
          onPress={handleLogout}
          loading={loggingOut}
          disabled={loggingOut}
        />
        {info ? <Text style={styles.info}>{info}</Text> : null}
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
  info: {
    color: Brand.accent,
    fontWeight: '700',
  },
  error: {
    color: '#FF5A3D',
    fontWeight: '700',
  },
});
