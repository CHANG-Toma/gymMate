import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getUserProfile } from '@/services/profileService';
import { sendTrainingRequest } from '@/services/requestService';
import type { UserProfile } from '@/types/user-profile';
import { buildSlotTimestamps } from '@/utils/date-slot';

function tomorrowYmd(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function RequestScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user, profile } = useAuth();
  const [member, setMember] = useState<UserProfile | null>(null);
  const [loadingMember, setLoadingMember] = useState(true);
  const [date, setDate] = useState(tomorrowYmd());
  const [start, setStart] = useState('18:00');
  const [end, setEnd] = useState('19:00');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stableIdRef = useRef(`req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    let active = true;
    async function load() {
      if (typeof userId !== 'string') {
        setLoadingMember(false);
        return;
      }
      try {
        const next = await getUserProfile(userId);
        if (active) {
          setMember(next);
        }
      } catch {
        if (active) {
          setMember(null);
        }
      } finally {
        if (active) {
          setLoadingMember(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [userId]);

  async function handleSend() {
    if (sending || !user || !profile?.gymId || !member) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const { startsAt, endsAt } = buildSlotTimestamps(date.trim(), start.trim(), end.trim());
      const result = await sendTrainingRequest(
        {
          senderId: user.uid,
          receiverId: member.uid,
          gymId: profile.gymId,
          startsAt,
          endsAt,
          message,
        },
        stableIdRef.current,
      );
      if (result.alreadyExists) {
        setError('Cette proposition a déjà été envoyée.');
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible. Réessaie.');
    } finally {
      setSending(false);
    }
  }

  if (loadingMember) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.content}>
          <ActivityIndicator color={Brand.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!member) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Athlète introuvable</Text>
          <Text style={styles.body}>Impossible de proposer un WOD sans destinataire valide.</Text>
          <PrimaryButton label="Retour découvrir" onPress={() => router.replace('/discover')} />
        </View>
      </SafeAreaView>
    );
  }

  if (sent) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.kicker}>DEMANDE ENVOYÉE</Text>
          <Text style={styles.title}>Proposition enregistrée</Text>
          <Text style={styles.body}>
            Demande CrossFit pour {member.displayName} ({date}, {start}-{end}). Statut : en
            attente.
          </Text>
          <PrimaryButton label="Voir mes demandes" onPress={() => router.replace('/requests')} />
          <PrimaryButton
            label="Retour découvrir"
            variant="ghost"
            onPress={() => router.replace('/discover')}
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
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>PROPOSER UN WOD</Text>
          <Text style={styles.title}>{member.displayName}</Text>
          <Text style={styles.body}>Sport : CrossFit · même box obligatoire</Text>

          <Text style={styles.label}>Date (AAAA-MM-JJ)</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            autoCapitalize="none"
            placeholder="2026-11-24"
            placeholderTextColor={Brand.faint}
            style={styles.input}
          />

          <Text style={styles.label}>Début (HH:mm)</Text>
          <TextInput
            value={start}
            onChangeText={setStart}
            autoCapitalize="none"
            placeholder="18:00"
            placeholderTextColor={Brand.faint}
            style={styles.input}
          />

          <Text style={styles.label}>Fin (HH:mm)</Text>
          <TextInput
            value={end}
            onChangeText={setEnd}
            autoCapitalize="none"
            placeholder="19:00"
            placeholderTextColor={Brand.faint}
            style={styles.input}
          />

          <Text style={styles.label}>Message (facultatif)</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            placeholder="On enchaîne force + metcon ?"
            placeholderTextColor={Brand.faint}
            style={[styles.input, styles.textarea]}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label={sending ? 'Envoi…' : 'Envoyer la demande'}
            onPress={handleSend}
            loading={sending}
            disabled={sending}
          />
        </ScrollView>
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
  content: {
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
    fontSize: 26,
    fontWeight: '800',
  },
  body: {
    color: Brand.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    marginTop: Spacing.two,
    color: Brand.white,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
    color: Brand.white,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 15,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  error: {
    color: '#FF5A3D',
    fontWeight: '700',
  },
});
