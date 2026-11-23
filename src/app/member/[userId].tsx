import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getGym } from '@/services/gymService';
import { getUserProfile } from '@/services/profileService';
import type { UserProfile } from '@/types/user-profile';
import { distanceKm, formatDistanceKm } from '@/utils/geo';
import {
  formatAvailability,
  formatFocus,
  formatLevel,
} from '@/utils/profile-labels';

export default function MemberDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user, profile: viewer } = useAuth();
  const [member, setMember] = useState<UserProfile | null>(null);
  const [boxName, setBoxName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (typeof userId !== 'string' || !userId) {
        setError('Identifiant invalide.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const next = await getUserProfile(userId);
        if (!active) {
          return;
        }
        if (!next) {
          setError('Aucun athlète CrossFit ne correspond à cet identifiant.');
          setMember(null);
          return;
        }
        if (viewer?.gymId && next.gymId && next.gymId !== viewer.gymId && next.uid !== user?.uid) {
          setError('Ce profil n’est pas dans ta box.');
          setMember(null);
          return;
        }
        setMember(next);
        if (next.gymId) {
          const gym = await getGym(next.gymId);
          if (active) {
            setBoxName(gym?.name ?? next.gymId);
          }
        }
      } catch {
        if (active) {
          setError('Impossible de charger ce profil. Réessaie.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [userId, viewer?.gymId, user?.uid]);

  if (loading) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.content}>
          <ActivityIndicator color={Brand.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !member) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Membre introuvable</Text>
          <Text style={styles.body}>{error ?? 'Profil indisponible.'}</Text>
          <PrimaryButton label="Retour découvrir" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const distance =
    viewer?.location && member.location
      ? formatDistanceKm(
          distanceKm(
            { lat: viewer.location.lat, lng: viewer.location.lng },
            { lat: member.location.lat, lng: member.location.lng },
          ),
        )
      : null;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{member.displayName.charAt(0).toUpperCase()}</Text>
        </View>

        <Text style={styles.title}>{member.displayName}</Text>
        <Text style={styles.meta}>{boxName || member.city}</Text>
        <Text style={styles.meta}>Objectif : {formatFocus(member.goal)}</Text>
        <Text style={styles.meta}>Niveau : {formatLevel(member.level)}</Text>
        <Text style={styles.meta}>Dispo : {formatAvailability(member.availability)}</Text>
        {distance ? <Text style={styles.meta}>Distance : {distance}</Text> : null}

        <Text style={styles.sectionLabel}>À propos</Text>
        <Text style={styles.body}>{member.bio || 'Pas encore de bio.'}</Text>

        {member.uid !== user?.uid ? (
          <PrimaryButton
            label="Proposer un WOD"
            onPress={() =>
              router.push({
                pathname: '/request/[userId]',
                params: { userId: member.uid },
              })
            }
            style={styles.cta}
          />
        ) : null}
        <Text style={styles.hint}>
          Une visite de profil ne crée aucune relation. Seule l’acceptation le fera.
        </Text>
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
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
    backgroundColor: Brand.surface,
  },
  avatarText: {
    color: Brand.white,
    fontSize: 28,
    fontWeight: '700',
  },
  title: {
    color: Brand.white,
    fontSize: 28,
    fontWeight: '700',
  },
  meta: {
    color: Brand.muted,
    fontSize: 15,
  },
  sectionLabel: {
    marginTop: Spacing.three,
    color: Brand.white,
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    color: Brand.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  cta: {
    marginTop: Spacing.four,
  },
  hint: {
    color: Brand.faint,
    fontSize: 13,
    lineHeight: 18,
  },
});
