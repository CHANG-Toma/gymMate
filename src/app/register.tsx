import { Link, Redirect, router } from 'expo-router';
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
import { useAuth } from '@/contexts/AuthContext';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  mapAuthError,
  registerWithInitialProfile,
  resumeInitialProfile,
} from '@/services/authService';
import { isProfileComplete, isProfileReadyForGym } from '@/services/profileService';
import { validateRegisterInput } from '@/utils/auth-validation';

export default function RegisterScreen() {
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsProfileResume, setNeedsProfileResume] = useState(false);

  if (user && !profileLoading && !needsProfileResume) {
    if (!isProfileReadyForGym(profile)) {
      return <Redirect href="/profile" />;
    }
    if (!isProfileComplete(profile)) {
      return <Redirect href="/choose-gym" />;
    }
    return <Redirect href="/discover" />;
  }

  async function handleRegister() {
    if (loading) {
      return;
    }

    const errors = validateRegisterInput({
      displayName,
      email,
      password,
      confirmPassword,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError(null);
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const result = await registerWithInitialProfile(email, password, displayName);
      if (!result.profileCreated) {
        setNeedsProfileResume(true);
        setFormError(
          'Compte créé, mais le profil n’a pas pu être écrit. Reprends la création du profil.',
        );
        return;
      }
      await refreshProfile();
      router.replace('/profile');
    } catch (error) {
      setFormError(mapAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleResumeProfile() {
    if (!user || loading) {
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      await resumeInitialProfile(user.uid, displayName || 'Athlète');
      setNeedsProfileResume(false);
      await refreshProfile();
      router.replace('/profile');
    } catch {
      setFormError('Impossible de créer le profil. Réessaie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>Crée ton compte, puis complète ton profil CrossFit.</Text>

          <Text style={styles.label}>Nom affiché</Text>
          {fieldErrors.displayName ? (
            <Text style={styles.fieldError}>{fieldErrors.displayName}</Text>
          ) : null}
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Ex. Lina"
            placeholderTextColor={Brand.faint}
            maxLength={40}
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>
          {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="toi@email.com"
            placeholderTextColor={Brand.faint}
            style={styles.input}
          />

          <Text style={styles.label}>Mot de passe</Text>
          {fieldErrors.password ? (
            <Text style={styles.fieldError}>{fieldErrors.password}</Text>
          ) : null}
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            placeholder="6 caractères minimum"
            placeholderTextColor={Brand.faint}
            style={styles.input}
          />

          <Text style={styles.label}>Confirmation</Text>
          {fieldErrors.confirmPassword ? (
            <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
          ) : null}
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
            placeholder="Retape le mot de passe"
            placeholderTextColor={Brand.faint}
            style={styles.input}
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          {needsProfileResume ? (
            <PrimaryButton
              label={loading ? 'Reprise…' : 'Reprendre la création du profil'}
              onPress={handleResumeProfile}
              loading={loading}
              disabled={loading}
            />
          ) : (
            <PrimaryButton
              label={loading ? 'Création…' : 'Créer mon compte'}
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
            />
          )}

          <Link href="/login" style={styles.link}>
            Déjà un compte ? Se connecter
          </Link>
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
  title: {
    color: Brand.white,
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: Brand.muted,
    fontSize: 15,
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
  fieldError: {
    color: '#FF5A3D',
    fontSize: 13,
  },
  formError: {
    color: '#FF5A3D',
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  link: {
    color: Brand.accent,
    textAlign: 'center',
    marginTop: Spacing.three,
    fontWeight: '700',
  },
});
