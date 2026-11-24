import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { notifyNow, scheduleSessionReminder } from '@/services/notificationService';
import { getUserProfile } from '@/services/profileService';
import {
  listReceivedRequests,
  listSentRequests,
  rejectRequest,
} from '@/services/requestService';
import { acceptRequest } from '@/services/relationService';
import { getSession } from '@/services/sessionService';
import type { TrainingRequest } from '@/types/training-request';
import { formatSlotRange } from '@/utils/date-slot';

type TabKey = 'received' | 'sent';

const STATUS_LABEL: Record<TrainingRequest['status'], string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée',
};

export default function RequestsScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>('received');
  const [items, setItems] = useState<TrainingRequest[]>([]);
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
      const rows =
        tab === 'received'
          ? await listReceivedRequests(user.uid)
          : await listSentRequests(user.uid);
      setItems(rows);

      const partnerIds = [
        ...new Set(
          rows.map((row) => (tab === 'received' ? row.senderId : row.receiverId)),
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
      setError('Impossible de charger les demandes.');
    } finally {
      setLoading(false);
    }
  }, [user, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAccept(requestId: string) {
    if (!user || actingId) {
      return;
    }
    setActingId(requestId);
    setError(null);
    try {
      const result = await acceptRequest(requestId, user.uid);
      const partnerName = names[items.find((row) => row.id === requestId)?.senderId ?? ''] ?? 'partenaire';
      await notifyNow(
        'Séance confirmée',
        `WOD accepté avec ${partnerName}. Un rappel sera envoyé 1 h avant.`,
        { type: 'session_accepted', sessionId: result.sessionId },
      );
      const session = await getSession(result.sessionId);
      if (session) {
        await scheduleSessionReminder(session, partnerName);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Acceptation impossible.');
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(requestId: string) {
    if (!user || actingId) {
      return;
    }
    setActingId(requestId);
    setError(null);
    try {
      await rejectRequest(requestId, user.uid);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refus impossible.');
    } finally {
      setActingId(null);
    }
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Demandes</Text>
        <View style={styles.tabs}>
          <Pressable
            onPress={() => setTab('received')}
            style={[styles.tab, tab === 'received' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'received' && styles.tabTextActive]}>
              Reçues
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('sent')}
            style={[styles.tab, tab === 'sent' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'sent' && styles.tabTextActive]}>
              Envoyées
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
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              title="Pas encore de demandes"
              message={
                tab === 'received'
                  ? 'Les propositions reçues apparaîtront ici.'
                  : 'Propose un WOD depuis le profil d’un athlète.'
              }
              actionLabel="Aller découvrir"
              onAction={() => router.push('/discover')}
            />
          }
          ListHeaderComponent={
            error ? <Text style={styles.error}>{error}</Text> : null
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const partnerId = tab === 'received' ? item.senderId : item.receiverId;
            const partnerName = names[partnerId] ?? 'Athlète';
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{partnerName}</Text>
                  <Text style={styles.badge}>{STATUS_LABEL[item.status]}</Text>
                </View>
                <Text style={styles.meta}>{item.sport}</Text>
                <Text style={styles.meta}>
                  {formatSlotRange(item.startsAt, item.endsAt)}
                </Text>
                {item.message ? <Text style={styles.message}>{item.message}</Text> : null}

                {tab === 'received' && item.status === 'pending' ? (
                  <View style={styles.actions}>
                    <PrimaryButton
                      label={actingId === item.id ? '…' : 'Accepter'}
                      onPress={() => void handleAccept(item.id)}
                      loading={actingId === item.id}
                      disabled={Boolean(actingId)}
                      style={styles.actionBtn}
                    />
                    <PrimaryButton
                      label="Refuser"
                      variant="ghost"
                      onPress={() => void handleReject(item.id)}
                      disabled={Boolean(actingId)}
                      style={styles.actionBtn}
                    />
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
    alignItems: 'center',
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
  message: {
    color: Brand.white,
    fontSize: 14,
    marginTop: Spacing.one,
  },
  actions: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  actionBtn: {
    alignSelf: 'stretch',
  },
  error: {
    color: '#FF5A3D',
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
});
