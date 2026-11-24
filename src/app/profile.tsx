import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
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

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ProfileOptionCard } from '@/components/profile-option-card';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { mapAuthError } from '@/services/authService';
import {
  isProfileComplete,
  isProfileReadyForGym,
  updateUserProfile,
} from '@/services/profileService';
import {
  DAY_OPTIONS,
  FOCUS_OPTIONS,
  LEVEL_OPTIONS,
  type CrossFitFocus,
  type CrossFitLevel,
  type LocalProfileDraft,
} from '@/types/profile';
import { validateProfileDraft, type ProfileFieldErrors } from '@/utils/profile-validation';

const INITIAL_DRAFT: LocalProfileDraft = {
  displayName: '',
  city: '',
  level: '',
  focus: '',
  bio: '',
  availabilityDay: '2',
  availabilityStart: '18:00',
  availabilityEnd: '19:00',
};

function minutesToHm(total: number): string {
  const hours = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (total % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function focusFromGoal(goal: string): CrossFitFocus | '' {
  const byLabel = FOCUS_OPTIONS.find((option) => option.label === goal);
  if (byLabel) {
    return byLabel.value;
  }
  return FOCUS_OPTIONS.find((option) => option.value === goal)?.value ?? '';
}

export default function ProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [draft, setDraft] = useState<LocalProfileDraft>(INITIAL_DRAFT);
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!profile || hydrated) {
      return;
    }
    const slot = profile.availability[0];
    setDraft({
      displayName: profile.displayName || '',
      city: profile.city || '',
      level: (profile.level as CrossFitLevel) || '',
      focus: focusFromGoal(profile.goal),
      bio: profile.bio || '',
      availabilityDay: slot ? String(slot.day) : '2',
      availabilityStart: slot ? minutesToHm(slot.startMinutes) : '18:00',
      availabilityEnd: slot ? minutesToHm(slot.endMinutes) : '19:00',
    });
    setHydrated(true);
  }, [profile, hydrated]);

  if (!user) {
    return <Redirect href="/login" />;
  }

  function updateField<K extends keyof LocalProfileDraft>(key: K, value: LocalProfileDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setFormError(null);
    setErrors((current) => {
      const next = { ...current };
      delete next[key as keyof ProfileFieldErrors];
      return next;
    });
  }

  async function handleSave() {
    if (saving) {
      return;
    }

    const result = validateProfileDraft(draft);
    setErrors(result.errors);
    if (!result.profile) {
      setFormError('Corrige les champs indiqués.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const focusLabel =
        FOCUS_OPTIONS.find((option) => option.value === result.profile!.focus)?.label ??
        result.profile.focus;

      await updateUserProfile(user.uid, {
        displayName: result.profile.displayName,
        city: result.profile.city,
        level: result.profile.level,
        goal: focusLabel,
        sports: ['CrossFit'],
        availability: [result.profile.availability],
        bio: result.profile.bio,
      });
      await refreshProfile();
      setSaved(true);
    } catch (error) {
      setFormError(mapAuthError(error) || 'Enregistrement impossible. Réessaie.');
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    const needsGym = !isProfileComplete(profile) && isProfileReadyForGym(profile);
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.success}>
          <Text style={styles.kicker}>PROFIL ENREGISTRÉ</Text>
          <Text style={styles.title}>C’est bon, {draft.displayName.trim() || 'athlète'}</Text>
          <Text style={styles.subtitle}>Tes infos CrossFit sont à jour.</Text>
          <PrimaryButton
            label={needsGym ? 'Choisir ma box' : 'Aller découvrir'}
            onPress={() => router.replace(needsGym ? '/choose-gym' : '/discover')}
            style={styles.cta}
          />
          <PrimaryButton
            label="Modifier encore"
            variant="ghost"
            onPress={() => setSaved(false)}
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
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>PROFIL CROSSFIT</Text>
          <Text style={styles.title}>Complète ton profil</Text>
          <Text style={styles.subtitle}>Sport fixé : CrossFit</Text>

          <Text style={styles.label}>Prénom</Text>
          {errors.displayName ? <Text style={styles.error}>{errors.displayName}</Text> : null}
          <TextInput
            value={draft.displayName}
            onChangeText={(value) => updateField('displayName', value)}
            placeholder="Ton prénom"
            placeholderTextColor={Brand.faint}
            maxLength={40}
            style={styles.input}
          />

          <Text style={styles.label}>Ville</Text>
          {errors.city ? <Text style={styles.error}>{errors.city}</Text> : null}
          <TextInput
            value={draft.city}
            onChangeText={(value) => updateField('city', value)}
            placeholder="Ta ville"
            placeholderTextColor={Brand.faint}
            maxLength={60}
            style={styles.input}
          />

          <Text style={styles.label}>Niveau</Text>
          {errors.level ? <Text style={styles.error}>{errors.level}</Text> : null}
          <View style={styles.stack}>
            {LEVEL_OPTIONS.map((option) => (
              <ProfileOptionCard
                key={option.value}
                title={option.label}
                description={
                  option.value === 'beginner'
                    ? 'Tu débutes ou tu reprends.'
                    : option.value === 'intermediate'
                      ? 'Bases acquises.'
                      : 'Tu vises du RX.'
                }
                selected={draft.level === option.value}
                onPress={() => updateField('level', option.value)}
              />
            ))}
          </View>

          <Text style={styles.label}>Focus</Text>
          {errors.focus ? <Text style={styles.error}>{errors.focus}</Text> : null}
          <View style={styles.stack}>
            {FOCUS_OPTIONS.map((option) => (
              <ProfileOptionCard
                key={option.value}
                title={option.label}
                description={
                  option.value === 'force'
                    ? 'Haltéro / charges.'
                    : option.value === 'metcon'
                      ? 'Conditioning.'
                      : 'Gymnastique.'
                }
                selected={draft.focus === option.value}
                onPress={() => updateField('focus', option.value)}
              />
            ))}
          </View>

          <Text style={styles.label}>Jour de dispo</Text>
          {errors.availabilityDay ? (
            <Text style={styles.error}>{errors.availabilityDay}</Text>
          ) : null}
          <View style={styles.chips}>
            {DAY_OPTIONS.map((option) => (
              <ChoiceChip
                key={option.value}
                label={option.label.slice(0, 3)}
                selected={draft.availabilityDay === String(option.value)}
                onPress={() => updateField('availabilityDay', String(option.value))}
              />
            ))}
          </View>

          <Text style={styles.label}>Créneau (HH:mm)</Text>
          {(errors.availabilityStart || errors.availabilityEnd) && (
            <Text style={styles.error}>
              {errors.availabilityStart || errors.availabilityEnd}
            </Text>
          )}
          <View style={styles.row}>
            <TextInput
              value={draft.availabilityStart}
              onChangeText={(value) => updateField('availabilityStart', value)}
              placeholder="18:00"
              placeholderTextColor={Brand.faint}
              style={[styles.input, styles.half]}
            />
            <TextInput
              value={draft.availabilityEnd}
              onChangeText={(value) => updateField('availabilityEnd', value)}
              placeholder="19:00"
              placeholderTextColor={Brand.faint}
              style={[styles.input, styles.half]}
            />
          </View>

          <Text style={styles.label}>Bio (optionnel)</Text>
          {errors.bio ? <Text style={styles.error}>{errors.bio}</Text> : null}
          <TextInput
            value={draft.bio}
            onChangeText={(value) => updateField('bio', value)}
            placeholder="Ex. Dispo le soir pour les WOD"
            placeholderTextColor={Brand.faint}
            multiline
            maxLength={280}
            style={[styles.input, styles.bio]}
          />

          {formError ? <Text style={styles.error}>{formError}</Text> : null}

          <PrimaryButton
            label={saving ? 'Enregistrement…' : 'Enregistrer mon profil'}
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.cta}
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
  success: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
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
  subtitle: {
    color: Brand.muted,
    fontSize: 15,
    marginBottom: Spacing.two,
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
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 15,
  },
  bio: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  stack: {
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  half: {
    flex: 1,
  },
  error: {
    color: '#FF5A3D',
    fontWeight: '700',
    fontSize: 13,
  },
  cta: {
    marginTop: Spacing.four,
  },
});
