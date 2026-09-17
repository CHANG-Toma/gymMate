import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getMemberById } from '@/data/mock-members';
import { useTheme } from '@/hooks/use-theme';

export default function MemberDetailScreen() {
  const theme = useTheme();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const member = typeof userId === 'string' ? getMemberById(userId) : undefined;

  if (!member) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Membre introuvable</Text>
          <Text style={[styles.body, { color: theme.textSecondary }]}>
            Aucun athlète CrossFit ne correspond à cet identifiant.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.avatarText, { color: theme.text }]}>
            {member.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>{member.displayName}</Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          CrossFit · {member.focus}
        </Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>{member.boxName}</Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>Niveau · {member.level}</Text>

        <Text style={[styles.sectionLabel, { color: theme.text }]}>À propos</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>{member.bio}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  meta: {
    fontSize: 15,
  },
  sectionLabel: {
    marginTop: Spacing.three,
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
});
