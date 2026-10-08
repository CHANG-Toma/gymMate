import { Redirect, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { isProfileComplete, isProfileReadyForGym } from '@/services/profileService';

const HIGHLIGHTS = [
  { label: 'BOX', value: 'Même salle' },
  { label: 'WOD', value: 'Créneau partagé' },
  { label: 'DUO', value: 'Après acceptation' },
] as const;

export default function WelcomeScreen() {
  const { user, profile, profileLoading } = useAuth();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 560,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 560,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeIn, slideUp]);

  if (user && !profileLoading) {
    if (!isProfileReadyForGym(profile)) {
      return <Redirect href="/profile" />;
    }
    if (!isProfileComplete(profile)) {
      return <Redirect href="/choose-gym" />;
    }
    return <Redirect href="/discover" />;
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            },
          ]}>
          <View style={styles.topBar}>
            <Text style={styles.brandMark}>GYMMATE</Text>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>CROSSFIT</Text>
            </View>
          </View>

          <View style={styles.heroPanel}>
            <Text style={styles.heroEyebrow}>CROSSFIT EN DUO</Text>
            <Text style={styles.heroTitle}>
              Trouve ton{'\n'}
              <Text style={styles.heroAccent}>partenaire</Text>
              {'\n'}de box.
            </Text>

            <View style={styles.metricsRow}>
              {HIGHLIGHTS.map((item) => (
                <View key={item.label} style={styles.metricCard}>
                  <Text style={styles.metricLabel}>{item.label}</Text>
                  <Text style={styles.metricValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.bottom}>
            <Text style={styles.support}>
              Propose un WOD, valide un créneau, et le chat s'ouvre seulement si la
              demande est acceptée.
            </Text>

            <PrimaryButton
              label="Créer mon compte"
              onPress={() => router.push('/register')}
            />
            <PrimaryButton
              label="Se connecter"
              variant="ghost"
              onPress={() => router.push('/login')}
              style={styles.secondaryCta}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.black,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandMark: {
    color: Brand.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2.4,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Brand.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.accent,
  },
  liveText: {
    color: Brand.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroPanel: {
    gap: Spacing.four,
  },
  heroEyebrow: {
    color: Brand.faint,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  heroTitle: {
    color: Brand.white,
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  heroAccent: {
    color: Brand.accent,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Brand.surface,
    borderColor: Brand.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    gap: 6,
  },
  metricLabel: {
    color: Brand.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  metricValue: {
    color: Brand.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  bottom: {
    gap: Spacing.two,
  },
  support: {
    color: Brand.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: Spacing.two,
  },
  secondaryCta: {
    marginTop: Spacing.one,
  },
});
