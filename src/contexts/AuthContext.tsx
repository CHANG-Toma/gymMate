import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { auth } from '@/services/firebase';
import { isFirebaseConfigured, getMissingFirebaseEnvKeys } from '@/services/firebaseConfig';
import { getUserProfile } from '@/services/profileService';
import type { UserProfile } from '@/types/user-profile';

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  error: string | null;
  configError: string | null;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    setProfileLoading(true);
    setError(null);

    try {
      const nextProfile = await getUserProfile(uid);
      setProfile(nextProfile);
    } catch {
      setProfile(null);
      setError('Impossible de charger le profil. Vérifie ta connexion puis réessaie.');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    await loadProfile(user.uid);
  }, [loadProfile, user]);

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setConfigError(
        `Firebase non configuré (${getMissingFirebaseEnvKeys().join(', ') || 'auth null'}). Copie .env.example vers .env.local.`,
      );
      setUser(null);
      setInitializing(false);
      return;
    }

    setConfigError(null);

    const stop = onAuthStateChanged(auth, (account) => {
      setUser(account);
      setInitializing(false);
    });

    return stop;
  }, []);

  useEffect(() => {
    setProfile(null);
    setError(null);

    if (!user) {
      setProfileLoading(false);
      return;
    }

    void loadProfile(user.uid);
  }, [user, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      profile,
      profileLoading,
      error,
      configError,
      refreshProfile,
      clearError: () => setError(null),
    }),
    [user, initializing, profile, profileLoading, error, configError, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider.');
  }
  return context;
}
