import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { Brand } from '@/constants/brand';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  DAY_OPTIONS,
  FOCUS_OPTIONS,
  LEVEL_OPTIONS,
  type CrossFitFocus,
  type CrossFitLevel,
  type LocalProfile,
  type LocalProfileDraft,
} from '@/types/profile';
import {
  validateProfileDraft,
  validateProfileStep,
  type ProfileFieldErrors,
  type ProfileStepId,
} from '@/utils/profile-validation';

const STEPS: {
  id: ProfileStepId;
  title: string;
  subtitle: string;
  optional?: boolean;
}[] = [
  {
    id: 'identity',
    title: 'Comment on t’appelle ?',
    subtitle: 'Prénom et ville, on y va tranquillement.',
  },
  {
    id: 'level',
    title: 'Ton niveau CrossFit',
    subtitle: 'Celui qui te va le mieux aujourd’hui.',
  },
  {
    id: 'focus',
    title: 'Tu viens pour quoi ?',
    subtitle: 'Pour croiser des gens sur le même focus.',
  },
  {
    id: 'availability',
    title: 'Quand tu disposes ?',
    subtitle: 'Un créneau habituel, c’est déjà bien.',
  },
  {
    id: 'bio',
    title: 'Un mot sur toi ?',
    subtitle: 'Pas obligatoire, tu pourras modifier plus tard.',
    optional: true,
  },
];

const TIME_PRESETS = [
  { label: 'Midi 12-13 h', start: '12:00', end: '13:00' },
  { label: 'Soir 18-19 h', start: '18:00', end: '19:00' },
  { label: 'Soir 19-20 h', start: '19:00', end: '20:00' },
] as const;

const INITIAL_DRAFT: LocalProfileDraft = {
  displayName: '',
  city: '',
  level: '',
  focus: '',
  bio: '',
  availabilityDay: '1',
  availabilityStart: '18:00',
  availabilityEnd: '19:00',
};

function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (total % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function ProfileScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<LocalProfileDraft>(INITIAL_DRAFT);
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [savedProfile, setSavedProfile] = useState<LocalProfile | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const step = STEPS[stepIndex];
  const progress = useMemo(() => (stepIndex + 1) / STEPS.length, [stepIndex]);
  const isLastStep = stepIndex === STEPS.length - 1;

  function updateField<K extends keyof LocalProfileDraft>(key: K, value: LocalProfileDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setStepError(null);
    setErrors((current) => {
      const next = { ...current };
      delete next[key as keyof ProfileFieldErrors];
      return next;
    });
  }

  async function persistProfile(override?: Partial<LocalProfileDraft>) {
    const nextDraft = { ...draft, ...override };
    if (override) {
      setDraft(nextDraft);
    }

    const result = validateProfileDraft(nextDraft);
    if (!result.profile) {
      setStepError('Il manque une info. Reviens en arrière pour corriger.');
      return;
    }

    setSaving(true);
    setStepError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSavedProfile(result.profile);
    } catch {
      setStepError('Impossible d’enregistrer. Réessaie.');
    } finally {
      setSaving(false);
    }
  }

  function goNext() {
    if (saving) {
      return;
    }

    const stepErrors = validateProfileStep(step.id, draft);
    setErrors(stepErrors);

    if (Object.keys(stepErrors).length > 0) {
      setStepError('Il manque une info sur cette étape.');
      return;
    }

    if (isLastStep) {
      void persistProfile();
      return;
    }

    setStepError(null);
    setErrors({});
    setStepIndex((current) => current + 1);
  }

  function goBack() {
    if (saving || stepIndex === 0) {
      return;
    }

    setStepError(null);
    setErrors({});
    setStepIndex((current) => current - 1);
  }

  function skipBio() {
    void persistProfile({ bio: '' });
  }

  if (savedProfile) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.successScreen}>
          <Text style={styles.successKicker}>PROFIL PRÊT</Text>
          <Text style={styles.stepTitle}>Bienvenue, {savedProfile.displayName}</Text>
          <Text style={styles.stepSubtitle}>
            {savedProfile.city}, CrossFit,{' '}
            {FOCUS_OPTIONS.find((item) => item.value === savedProfile.focus)?.label}
          </Text>
          <Text style={styles.stepSubtitle}>
            Dispo {DAY_OPTIONS.find((item) => item.value === savedProfile.availability.day)?.label}{' '}
            {formatMinutes(savedProfile.availability.startMinutes)}-
            {formatMinutes(savedProfile.availability.endMinutes)}
          </Text>
          <PrimaryButton
            label="Modifier mon profil"
            variant="ghost"
            onPress={() => {
              setSavedProfile(null);
              setStepIndex(0);
            }}
            style={styles.footerButton}
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
        <View style={styles.shell}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              ÉTAPE {stepIndex + 1}/{STEPS.length}
              {step.optional ? ' (optionnel)' : ''}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

            {step.id === 'identity' ? (
              <View style={styles.block}>
                <FieldError message={errors.displayName} />
                <TextInput
                  value={draft.displayName}
                  onChangeText={(value) => updateField('displayName', value)}
                  placeholder="Ton prénom"
                  placeholderTextColor={Brand.faint}
                  autoFocus
                  maxLength={40}
                  style={[styles.input, styles.inputLarge, errorBorder(errors.displayName)]}
                />
                <FieldError message={errors.city} />
                <TextInput
                  value={draft.city}
                  onChangeText={(value) => updateField('city', value)}
                  placeholder="Ta ville"
                  placeholderTextColor={Brand.faint}
                  maxLength={60}
                  style={[styles.input, styles.inputLarge, errorBorder(errors.city)]}
                />
              </View>
            ) : null}

            {step.id === 'level' ? (
              <View style={styles.block}>
                <FieldError message={errors.level} />
                {LEVEL_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    title={option.label}
                    description={levelHint(option.value)}
                    selected={draft.level === option.value}
                    onPress={() => updateField('level', option.value as CrossFitLevel)}
                  />
                ))}
              </View>
            ) : null}

            {step.id === 'focus' ? (
              <View style={styles.block}>
                <FieldError message={errors.focus} />
                {FOCUS_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    title={option.label}
                    description={focusHint(option.value)}
                    selected={draft.focus === option.value}
                    onPress={() => updateField('focus', option.value as CrossFitFocus)}
                  />
                ))}
                <Text style={styles.fixedSport}>Sport : CrossFit</Text>
              </View>
            ) : null}

            {step.id === 'availability' ? (
              <View style={styles.block}>
                <Text style={styles.sectionLabel}>Jour</Text>
                <FieldError message={errors.availabilityDay} />
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

                <Text style={styles.sectionLabel}>Créneau rapide</Text>
                <View style={styles.chips}>
                  {TIME_PRESETS.map((preset) => {
                    const selected =
                      draft.availabilityStart === preset.start &&
                      draft.availabilityEnd === preset.end;

                    return (
                      <ChoiceChip
                        key={preset.label}
                        label={preset.label}
                        selected={selected}
                        onPress={() => {
                          updateField('availabilityStart', preset.start);
                          updateField('availabilityEnd', preset.end);
                        }}
                      />
                    );
                  })}
                </View>

                <Text style={styles.sectionLabel}>Ou précise</Text>
                <FieldError message={errors.availabilityStart || errors.availabilityEnd} />
                <View style={styles.row}>
                  <TextInput
                    value={draft.availabilityStart}
                    onChangeText={(value) => updateField('availabilityStart', value)}
                    placeholder="18:00"
                    placeholderTextColor={Brand.faint}
                    keyboardType="numbers-and-punctuation"
                    style={[styles.input, styles.half, errorBorder(errors.availabilityStart)]}
                  />
                  <TextInput
                    value={draft.availabilityEnd}
                    onChangeText={(value) => updateField('availabilityEnd', value)}
                    placeholder="19:00"
                    placeholderTextColor={Brand.faint}
                    keyboardType="numbers-and-punctuation"
                    style={[styles.input, styles.half, errorBorder(errors.availabilityEnd)]}
                  />
                </View>
              </View>
            ) : null}

            {step.id === 'bio' ? (
              <View style={styles.block}>
                <FieldError message={errors.bio} />
                <TextInput
                  value={draft.bio}
                  onChangeText={(value) => updateField('bio', value)}
                  placeholder="Ex. Dispo le soir pour les WOD"
                  placeholderTextColor={Brand.faint}
                  multiline
                  maxLength={280}
                  style={[styles.input, styles.bio, errorBorder(errors.bio)]}
                />
                <Text style={styles.charCount}>{draft.bio.trim().length}/280</Text>
              </View>
            ) : null}

            {stepError ? (
              <Text style={styles.stepError} accessibilityLiveRegion="polite">
                {stepError}
              </Text>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            {stepIndex > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Revenir à l’étape précédente"
                onPress={goBack}
                disabled={saving}
                style={styles.backButton}>
                <Text style={styles.backLabel}>Retour</Text>
              </Pressable>
            ) : (
              <View style={styles.backButton} />
            )}

            <View style={styles.footerActions}>
              {step.optional ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Passer la bio"
                  onPress={skipBio}
                  disabled={saving}
                  style={styles.skipButton}>
                  <Text style={styles.skipLabel}>Passer</Text>
                </Pressable>
              ) : null}
              <PrimaryButton
                label={saving ? 'Enregistrement…' : isLastStep ? 'Terminer' : 'Continuer'}
                onPress={goNext}
                loading={saving}
                disabled={saving}
                style={styles.continueButton}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function errorBorder(hasError?: string) {
  return {
    borderColor: hasError ? '#FF5A3D' : Brand.border,
  };
}

function levelHint(level: CrossFitLevel): string {
  switch (level) {
    case 'beginner':
      return 'Tu débutes ou tu reprends doucement.';
    case 'intermediate':
      return 'Tu connais les mouvements de base.';
    case 'advanced':
      return 'Tu vises du RX et de la technique.';
  }
}

function focusHint(focus: CrossFitFocus): string {
  switch (focus) {
    case 'force':
      return 'Squats, haltéro, charges lourdes.';
    case 'metcon':
      return 'Conditioning, souffle, intensité.';
    case 'gymnastique':
      return 'Pull-ups, HSPU, bar muscle-ups.';
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <Text style={styles.fieldError}>{message}</Text>;
}

function OptionCard({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.optionCard,
        selected
          ? { backgroundColor: Brand.accent, borderColor: Brand.accent }
          : { backgroundColor: Brand.surface, borderColor: Brand.border },
      ]}>
      <Text style={[styles.optionTitle, { color: selected ? Brand.onAccent : Brand.white }]}>
        {title}
      </Text>
      <Text style={[styles.optionDescription, { color: selected ? Brand.onAccent : Brand.muted }]}>
        {description}
      </Text>
    </Pressable>
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
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  progressHeader: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  progressLabel: {
    color: Brand.faint,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: Brand.surfaceElevated,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Brand.accent,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  stepTitle: {
    color: Brand.white,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  stepSubtitle: {
    color: Brand.muted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Spacing.two,
  },
  block: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
    color: Brand.white,
    backgroundColor: Brand.surface,
  },
  inputLarge: {
    minHeight: 58,
    fontSize: 18,
    fontWeight: '600',
  },
  bio: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  sectionLabel: {
    marginTop: Spacing.two,
    color: Brand.white,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  half: {
    flex: 1,
  },
  fixedSport: {
    marginTop: Spacing.one,
    color: Brand.faint,
    fontSize: 13,
    fontWeight: '600',
  },
  charCount: {
    color: Brand.faint,
    fontSize: 12,
    textAlign: 'right',
  },
  fieldError: {
    color: '#FF5A3D',
    fontSize: 13,
  },
  stepError: {
    color: '#FF5A3D',
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    paddingTop: Spacing.two,
  },
  backButton: {
    minWidth: 72,
    paddingVertical: Spacing.three,
  },
  backLabel: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footerActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  skipButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  skipLabel: {
    color: Brand.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  continueButton: {
    minWidth: 148,
  },
  footerButton: {
    marginTop: Spacing.four,
    alignSelf: 'stretch',
  },
  successScreen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  successKicker: {
    color: Brand.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: Spacing.one,
  },
});
