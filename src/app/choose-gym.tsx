import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { listGyms, type Gym } from '@/services/gymService';
import {
  isProfileComplete,
  isProfileReadyForGym,
  setUserGym,
} from '@/services/profileService';

export default function ChooseGymScreen() {
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const rows = await listGyms();
        if (active) {
          setGyms(rows);
        }
      } catch {
        if (active) {
          setError('Impossible de charger les boxes. Réessaie.');
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
  }, []);

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!profileLoading && !isProfileReadyForGym(profile)) {
    return <Redirect href="/profile" />;
  }

  if (!profileLoading && isProfileComplete(profile)) {
    return <Redirect href="/discover" />;
  }

  async function handleConfirm() {
    if (!user || !selectedId || saving) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await setUserGym(user.uid, selectedId);
      await refreshProfile();
      router.replace('/discover');
    } catch {
      setError('Impossible d’enregistrer la box. Réessaie.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Choisis ta box</Text>
        <Text style={styles.subtitle}>
          Une seule fois en V1. Tu verras ensuite les athlètes de cette salle.
        </Text>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Brand.accent} size="large" />
          </View>
        ) : error && gyms.length === 0 ? (
          <EmptyState
            title="Boxes indisponibles"
            message={error}
            actionLabel="Réessayer"
            onAction={() => router.replace('/choose-gym')}
          />
        ) : (
          <FlatList
            data={gyms}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => {
              const selected = selectedId === item.id;
              return (
                <Pressable
                  onPress={() => setSelectedId(item.id)}
                  style={[
                    styles.card,
                    selected
                      ? { backgroundColor: Brand.accent, borderColor: Brand.accent }
                      : { backgroundColor: Brand.surface, borderColor: Brand.border },
                  ]}>
                  <Text style={[styles.cardTitle, { color: selected ? Brand.onAccent : Brand.white }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[styles.cardMeta, { color: selected ? Brand.onAccent : Brand.muted }]}>
                    {item.city}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}

        {error && gyms.length > 0 ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label={saving ? 'Enregistrement…' : 'Valider ma box'}
          onPress={handleConfirm}
          loading={saving}
          disabled={saving || !selectedId}
        />
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
  title: {
    color: Brand.white,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: Brand.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.two,
  },
  list: {
    paddingVertical: Spacing.two,
  },
  separator: {
    height: Spacing.two,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  cardMeta: {
    fontSize: 14,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#FF5A3D',
    fontWeight: '700',
  },
});
