import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
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
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getMemberById } from '@/data/mock-members';

/** Formulaire local J3. L’écriture Firestore arrive au J7. */
export default function RequestScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const member = typeof userId === 'string' ? getMemberById(userId) : undefined;

  const [date, setDate] = useState('2026-10-15');
  const [start, setStart] = useState('18:00');
  const [end, setEnd] = useState('19:00');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (sending || !member) {
      return;
    }

    if (!date.trim() || !start.trim() || !end.trim()) {
      setError('Indique une date et un créneau.');
      return;
    }

    if (start >= end) {
      setError('La fin doit être après le début.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSent(true);
    } catch {
      setError('Envoi impossible. Réessaie.');
    } finally {
      setSending(false);
    }
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
          <Text style={styles.kicker}>DEMANDE LOCALE</Text>
          <Text style={styles.title}>Proposition prête</Text>
          <Text style={styles.body}>
            Demande simulée pour {member.displayName} ({date}, {start}-{end}). L’envoi réel
            arrivera au J7.
          </Text>
          <PrimaryButton label="Voir les demandes" onPress={() => router.replace('/requests')} />
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
          <Text style={styles.kicker}>DESTINATAIRE</Text>
          <Text style={styles.title}>{member.displayName}</Text>
          <Text style={styles.body}>
            {member.focus}, {member.level}, sport CrossFit
          </Text>

          <Text style={styles.label}>Date (AAAA-MM-JJ)</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="2026-10-15"
            placeholderTextColor={Brand.faint}
            style={styles.input}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Début</Text>
              <TextInput
                value={start}
                onChangeText={setStart}
                placeholder="18:00"
                placeholderTextColor={Brand.faint}
                style={styles.input}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Fin</Text>
              <TextInput
                value={end}
                onChangeText={setEnd}
                placeholder="19:00"
                placeholderTextColor={Brand.faint}
                style={styles.input}
              />
            </View>
          </View>

          <Text style={styles.label}>Message (optionnel)</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="On fait le WOD du jour ?"
            placeholderTextColor={Brand.faint}
            multiline
            maxLength={500}
            style={[styles.input, styles.message]}
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
    fontSize: 28,
    fontWeight: '800',
  },
  body: {
    color: Brand.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.two,
  },
  label: {
    color: Brand.white,
    fontSize: 13,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
    color: Brand.white,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  message: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  half: {
    flex: 1,
    gap: Spacing.two,
  },
  error: {
    color: '#FF5A3D',
    fontSize: 14,
    fontWeight: '700',
  },
});
