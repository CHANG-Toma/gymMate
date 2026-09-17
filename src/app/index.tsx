import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function WelcomeScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.brand, { color: theme.text }]}>GymMate</Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>
          Trouve ton partenaire de CrossFit.
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Découvre les athlètes de ta box, propose un WOD ou un créneau force, et
          entraînez-vous ensemble.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Découvrir les athlètes CrossFit"
          onPress={() => router.push('/discover')}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.text,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <Text style={[styles.buttonLabel, { color: theme.background }]}>Découvrir</Text>
        </Pressable>
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
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  brand: {
    fontSize: 40,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Spacing.two,
  },
  button: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
});
