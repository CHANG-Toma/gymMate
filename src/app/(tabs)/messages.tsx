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
import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { listMyChats } from '@/services/chatService';
import { getUserProfile } from '@/services/profileService';
import type { ChatThread } from '@/types/relation';
import { partnerUid } from '@/utils/profile-labels';

export default function MessagesScreen() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await listMyChats(user.uid);
      setChats(rows);
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
      setError('Impossible de charger les conversations.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Chat ouvert seulement après une demande acceptée.</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Brand.accent} />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
          ListEmptyComponent={
            <EmptyState
              title="Pas de conversation"
              message="Accepte une demande pour ouvrir un chat avec ton partenaire."
              actionLabel="Voir les demandes"
              onAction={() => router.push('/requests')}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const partner = user ? partnerUid(item.members, user.uid) : null;
            const name = partner ? names[partner] ?? 'Partenaire' : 'Partenaire';
            return (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/chat/[chatId]',
                    params: { chatId: item.id },
                  })
                }
                style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}>
                <Text style={styles.cardTitle}>{name}</Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastMessage || 'Aucun message pour l’instant'}
                </Text>
              </Pressable>
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
    gap: Spacing.one,
  },
  title: {
    color: Brand.white,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: Brand.muted,
    fontSize: 13,
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
    height: Spacing.two,
  },
  card: {
    backgroundColor: Brand.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: Spacing.three,
    gap: 4,
  },
  cardTitle: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: '700',
  },
  preview: {
    color: Brand.muted,
    fontSize: 13,
  },
  error: {
    color: '#FF5A3D',
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
});
