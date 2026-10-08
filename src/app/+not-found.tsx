import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cette page n’existe pas</Text>
      <Text style={styles.body}>Vérifie le lien, ou reviens à l’accueil GymMate.</Text>
      <PrimaryButton label="Retour à l’accueil" onPress={() => router.replace('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.black,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    color: Brand.white,
    fontSize: 28,
    fontWeight: '800',
  },
  body: {
    color: Brand.muted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Spacing.two,
  },
});
