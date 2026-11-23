import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getChat, sendMessage, subscribeMessages } from '@/services/chatService';
import { getRelation } from '@/services/relationService';
import { getUserProfile } from '@/services/profileService';
import type { ChatMessage } from '@/types/relation';
import { partnerUid } from '@/utils/profile-labels';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [partnerName, setPartnerName] = useState('Chat');
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const pendingIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    let stop: (() => void) | undefined;

    async function boot() {
      if (!user || typeof chatId !== 'string') {
        setAccessError('Conversation invalide.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setAccessError(null);
      setStreamError(null);
      setMessages([]);

      try {
        const chat = await getChat(chatId);
        if (!chat || !chat.members.includes(user.uid)) {
          if (active) {
            setAccessError('Conversation non accessible.');
            setLoading(false);
          }
          return;
        }

        const relation = await getRelation(chat.relationId || chatId);
        if (!relation || !relation.members.includes(user.uid)) {
          if (active) {
            setAccessError('Aucune relation valide pour ce chat.');
            setLoading(false);
          }
          return;
        }

        const partner = partnerUid(chat.members, user.uid);
        if (partner) {
          const profile = await getUserProfile(partner);
          if (active) {
            setPartnerName(profile?.displayName ?? 'Partenaire');
          }
        }

        if (!active) {
          return;
        }

        setLoading(false);
        stop = subscribeMessages(
          chatId,
          (rows) => {
            if (active) {
              setMessages(rows);
              setStreamError(null);
            }
          },
          (message) => {
            if (active) {
              setStreamError(message);
            }
          },
        );
      } catch {
        if (active) {
          setAccessError('Impossible d’ouvrir cette conversation.');
          setLoading(false);
        }
      }
    }

    void boot();

    return () => {
      active = false;
      stop?.();
    };
  }, [chatId, user]);

  const title = useMemo(() => partnerName, [partnerName]);

  async function handleSend() {
    if (!user || typeof chatId !== 'string' || sending) {
      return;
    }
    const text = draft.trim();
    if (!text) {
      return;
    }

    setSending(true);
    setStreamError(null);
    if (!pendingIdRef.current) {
      pendingIdRef.current = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    }

    try {
      await sendMessage(chatId, user.uid, text, pendingIdRef.current);
      setDraft('');
      pendingIdRef.current = null;
    } catch (err) {
      setStreamError(err instanceof Error ? err.message : 'Envoi impossible.');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color={Brand.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (accessError) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.content}>
          <EmptyState
            title="Chat inaccessible"
            message={accessError}
            actionLabel="Retour messages"
            onAction={() => router.replace('/messages')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>Dis bonjour pour démarrer la conversation.</Text>
          }
          renderItem={({ item }) => {
            const mine = item.senderId === user?.uid;
            const time = item.createdAt
              ? item.createdAt.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '…';
            return (
              <View style={[styles.bubbleRow, mine ? styles.mineRow : styles.theirsRow]}>
                <View style={[styles.bubble, mine ? styles.mineBubble : styles.theirsBubble]}>
                  <Text style={[styles.bubbleText, mine ? styles.mineText : styles.theirsText]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.time, mine ? styles.mineTime : styles.theirsTime]}>
                    {time}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {streamError ? <Text style={styles.error}>{streamError}</Text> : null}

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Écrire un message…"
            placeholderTextColor={Brand.faint}
            style={styles.input}
            maxLength={1000}
            editable={!sending}
          />
          <PrimaryButton
            label={sending ? '…' : 'Envoyer'}
            onPress={handleSend}
            loading={sending}
            disabled={sending || draft.trim().length === 0}
            style={styles.send}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.black,
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.four,
  },
  header: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  title: {
    color: Brand.white,
    fontSize: 18,
    fontWeight: '800',
  },
  list: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    flexGrow: 1,
  },
  empty: {
    color: Brand.muted,
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  bubbleRow: {
    marginBottom: Spacing.two,
    flexDirection: 'row',
  },
  mineRow: {
    justifyContent: 'flex-end',
  },
  theirsRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 4,
  },
  mineBubble: {
    backgroundColor: Brand.accent,
  },
  theirsBubble: {
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  mineText: {
    color: Brand.black,
  },
  theirsText: {
    color: Brand.white,
  },
  time: {
    fontSize: 11,
  },
  mineTime: {
    color: 'rgba(0,0,0,0.55)',
    alignSelf: 'flex-end',
  },
  theirsTime: {
    color: Brand.faint,
    alignSelf: 'flex-end',
  },
  composer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
    color: Brand.white,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  send: {
    minWidth: 110,
  },
  error: {
    color: '#FF5A3D',
    fontWeight: '700',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.one,
  },
});
