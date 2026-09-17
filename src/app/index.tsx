import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';

const PALETTE = {
  ink: '#0B0B0C',
  slate: '#171411',
  ember: '#E4572E',
  emberSoft: '#F07A4A',
  cream: '#F4F0EA',
  muted: 'rgba(244, 240, 234, 0.72)',
} as const;

export default function WelcomeScreen() {
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslate = useRef(new Animated.Value(18)).current;
  const bodyOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslate = useRef(new Animated.Value(24)).current;
  const accentScale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(brandTranslate, {
          toValue: 0,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.spring(accentScale, {
          toValue: 1,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(bodyOpacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(ctaOpacity, {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.timing(ctaTranslate, {
          toValue: 0,
          duration: 360,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [accentScale, bodyOpacity, brandOpacity, brandTranslate, ctaOpacity, ctaTranslate]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[PALETTE.ink, PALETTE.slate, '#2A1610']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={styles.atmosphere}>
        <View style={[styles.plate, styles.plateLarge]} />
        <View style={[styles.plate, styles.plateSmall]} />
        <LinearGradient
          colors={['transparent', 'rgba(228, 87, 46, 0.18)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.emberBand}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <Animated.View
              style={[
                styles.accent,
                {
                  backgroundColor: PALETTE.ember,
                  transform: [{ scaleX: accentScale }],
                },
              ]}
            />

            <Animated.Text
              style={[
                styles.brand,
                {
                  color: PALETTE.cream,
                  opacity: brandOpacity,
                  transform: [{ translateY: brandTranslate }],
                },
              ]}>
              GymMate
            </Animated.Text>

            <Animated.View style={{ opacity: bodyOpacity }}>
              <Text style={[styles.headline, { color: PALETTE.cream }]}>
                Trouve ton partenaire de CrossFit.
              </Text>
              <Text style={[styles.support, { color: PALETTE.muted }]}>
                Athlètes de ta box, WOD en duo, créneau partagé.
              </Text>
            </Animated.View>
          </View>

          <Animated.View
            style={{
              opacity: ctaOpacity,
              transform: [{ translateY: ctaTranslate }],
            }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Découvrir les athlètes CrossFit"
              onPress={() => router.push('/discover')}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: pressed ? PALETTE.emberSoft : PALETTE.ember,
                },
              ]}>
              <Text style={styles.buttonLabel}>Découvrir</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.ink,
  },
  atmosphere: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  plate: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 14,
    borderColor: 'rgba(244, 240, 234, 0.06)',
  },
  plateLarge: {
    width: 280,
    height: 280,
    top: -40,
    right: -70,
  },
  plateSmall: {
    width: 160,
    height: 160,
    bottom: 120,
    left: -50,
    borderWidth: 10,
  },
  emberBand: {
    position: 'absolute',
    left: -40,
    right: -40,
    top: '38%',
    height: 120,
    transform: [{ rotate: '-8deg' }],
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.five,
  },
  hero: {
    gap: Spacing.three,
    maxWidth: 360,
  },
  accent: {
    width: 56,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.one,
  },
  brand: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 56,
  },
  headline: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    marginTop: Spacing.two,
  },
  support: {
    marginTop: Spacing.two,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: Spacing.three + 2,
    borderRadius: 14,
  },
  buttonLabel: {
    color: PALETTE.cream,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
