import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { getUserProfile } from '@/services/profileService';
import { cancelSession, listMySessions, markSessionDone } from '@/services/sessionService';
import type { TrainingSession } from '@/types/relation';
import { formatSlotRange } from '@/utils/date-slot';
import { partnerUid } from '@/utils/profile-labels';

type TabKey = 'upcoming' | 'history';

const STATUS_LABEL: Record<TrainingSession['status'], string> = {
  planned: 'Prévue',
  done: 'Terminée',
  cancelled: 'Annulée',
};

export default function SessionsScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>('upcoming');
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await listMySessions(user.uid);
      setSessions(rows);
      const partnerIds = [
        ...new Set(
          rows
            .map((row) => partnerUid(row.members, user.uid))
            .filter((uid): uid is string => Boolean(uid)),
        ),
      ];
      const entries = await Promise.all(
        partnerIds.map(async (uid) => {
          const profile = await getUserProfile(uid);
          return [uid, profile?.displayName ?? 'Athlète'] as const;
        }),
      );
      setNames(Object.fromEntries(entries));
    } catch {
      setError('Impossible de charger les séances.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    if (tab === 'upcoming') {
      return sessions.filter((item) => item.status === 'planned' && item.endsAt.getTime() >= Date.now());
    }
    return sessions.filter(
      (item) => item.status !== 'planned' || item.endsAt.getTime() < Date.now(),
    );
  }, [sessions, tab]);

  async function handleCancel(sessionId: string) {
    if (!user || actingId) {
      return;
    }
    setActingId(sessionId);
    try {
      await cancelSession(sessionId, user.uid);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Annulation impossible.');
    } finally {
      setActingId(null);
    }
  }

  async function handleDone(sessionId: string) {
    if (!user || actingId) {
      return;
    }
    setActingId(sessionId);
    try {
      await markSessionDone(sessionId, user.uid);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible.');
    } finally {
      setActingId(null);
    }
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Séances</Text>
        <View style={styles.tabs}>
          <Pressable
            onPress={() => setTab('upcoming')}
            style={[styles.tab, tab === 'upcoming' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>
              À venir
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('history')}
            style={[styles.tab, tab === 'history' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>
              Historique
            </Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Brand.accent} />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
          ListEmptyComponent={
            <EmptyState
              title={tab === 'upcoming' ? 'Aucune séance prévue' : 'Historique vide'}
              message="Les séances apparaissent après une demande acceptée."
              actionLabel="Recharger"
              onAction={() => void load()}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const partner = user ? partnerUid(item.members, user.uid) : null;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>
                    {partner ? names[partner] ?? 'Partenaire' : 'Partenaire'}
                  </Text>
                  <Text style={styles.badge}>{STATUS_LABEL[item.status]}</Text>
                </View>
                <Text style={styles.meta}>{item.sport}</Text>
                <Text style={styles.meta}>{formatSlotRange(item.startsAt, item.endsAt)}</Text>
                {item.status === 'planned' ? (
                  <View style={styles.actions}>
                    <PrimaryButton
                      label="Annuler"
                      variant="ghost"
                      onPress={() => void handleCancel(item.id)}
                      disabled={Boolean(actingId)}
                      loading={actingId === item.id}
                    />
                    {item.endsAt.getTime() <= Date.now() ? (
                      <PrimaryButton
                        label="Marquer terminée"
                        onPress={() => void handleDone(item.id)}
                        disabled={Boolean(actingId)}
                        loading={actingId === item.id}
                      />
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.black,
  },
  header: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  title: {
    color: Brand.white,
    fontSize: 24,
    fontWeight: '800',
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  tab: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
    backgroundColor: Brand.surface,
  },
  tabActive: {
    backgroundColor: Brand.accent,
  },
  tabText: {
    color: Brand.muted,
    fontWeight: '700',
  },
  tabTextActive: {
    color: Brand.black,
  },
  list: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: Spacing.three,
  },
  card: {
    backgroundColor: Brand.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cardTitle: {
    color: Brand.white,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    color: Brand.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  meta: {
    color: Brand.muted,
    fontSize: 14,
  },
  actions: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  error: {
    color: '#FF5A3D',
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
});
