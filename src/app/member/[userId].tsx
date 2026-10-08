import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { Brand } from '@/constants/brand';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getMemberById } from '@/data/mock-members';

export default function MemberDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const member = typeof userId === 'string' ? getMemberById(userId) : undefined;

  if (!member) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Membre introuvable</Text>
          <Text style={styles.body}>Aucun athlète CrossFit ne correspond à cet identifiant.</Text>
          <PrimaryButton label="Retour découvrir" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{member.displayName.charAt(0).toUpperCase()}</Text>
        </View>

        <Text style={styles.title}>{member.displayName}</Text>
        <Text style={styles.meta}>{member.boxName}</Text>
        <Text style={styles.meta}>Objectif : {member.focus}</Text>
        <Text style={styles.meta}>Niveau : {member.level}</Text>
        <Text style={styles.meta}>Dispo : {member.availabilityLabel}</Text>

        <Text style={styles.sectionLabel}>À propos</Text>
        <Text style={styles.body}>{member.bio}</Text>

        <PrimaryButton
          label="Proposer un WOD"
          onPress={() =>
            router.push({
              pathname: '/request/[userId]',
              params: { userId: member.id },
            })
          }
          style={styles.cta}
        />
        <Text style={styles.hint}>
          Une visite de profil ne crée aucune relation. Seule l’acceptation le fera (J8).
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
