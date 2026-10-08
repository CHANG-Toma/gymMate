import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

import { getFirebaseConfig, isFirebaseConfigured } from '@/services/firebaseConfig';

function createApp() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase non configuré. Copie .env.example vers .env.local, renseigne les 4 clés EXPO_PUBLIC_FIREBASE_*, puis relance npx expo start --clear.',
    );
  }

  return getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
}

function createAuth(app: ReturnType<typeof createApp>) {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  try {
    const authModule = require('firebase/auth') as {
      getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown;
    };
    const getReactNativePersistence = authModule.getReactNativePersistence;
    if (!getReactNativePersistence) {
      return getAuth(app);
    }
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage) as never,
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'auth/already-initialized') {
      return getAuth(app);
    }
    throw error;
  }
}

const app = isFirebaseConfigured() ? createApp() : null;

/**
 * Instances partagées (PDF p.15).
 * Si .env.local manque, auth/db restent null : AuthContext affiche un message de config.
 */
export const auth = app ? createAuth(app) : null;
export const db = app ? getFirestore(app) : null;
