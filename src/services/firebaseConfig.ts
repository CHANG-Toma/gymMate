const REQUIRED_ENV_KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
};

export function getMissingFirebaseEnvKeys(): string[] {
  return REQUIRED_ENV_KEYS.filter((key) => !process.env[key]?.trim());
}

export function isFirebaseConfigured(): boolean {
  return getMissingFirebaseEnvKeys().length === 0;
}

/** Paramètres clients Firebase. Les accès réels passent par Auth + règles. */
export function getFirebaseConfig(): FirebaseClientConfig {
  const missing = getMissingFirebaseEnvKeys();
  if (missing.length > 0) {
    throw new Error(
      `Configuration Firebase incomplete (${missing.join(', ')}). Copie .env.example vers .env.local puis relance Expo.`,
    );
  }

  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!.trim(),
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!.trim(),
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!.trim(),
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!.trim(),
  };
}
