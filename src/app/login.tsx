import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { login, mapAuthError } from '@/services/authService';
import { isProfileComplete, isProfileReadyForGym } from '@/services/profileService';
import { validateLoginInput } from '@/utils/auth-validation';

export default function LoginScreen() {
  const { user, profile, profileLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user && profileLoading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={Brand.accent} size="large" />
      </View>
    );
  }

  if (user && !profileLoading) {
    if (!isProfileReadyForGym(profile)) {
      return <Redirect href="/profile" />;
    }
    if (!isProfileComplete(profile)) {
      return <Redirect href="/choose-gym" />;
    }
    return <Redirect href="/discover" />;
  }

  async function handleLogin() {
    if (loading) {
      return;
    }

    const errors = validateLoginInput({ email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError(null);
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      await login(email, password);
      // AuthContext charge le profil ; les Redirect ci-dessus orientent la suite.
    } catch (error) {
      setFormError(mapAuthError(error));
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
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Retrouve ta box et tes partenaires CrossFit.</Text>

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
            autoComplete="password"
            placeholder="••••••••"
            placeholderTextColor={Brand.faint}
            style={styles.input}
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <PrimaryButton
            label={loading ? 'Connexion…' : 'Se connecter'}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
          />

          <Link href="/register" style={styles.link}>
            Pas encore de compte ? S’inscrire
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
  boot: {
    flex: 1,
    backgroundColor: Brand.black,
    alignItems: 'center',
    justifyContent: 'center',
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
