import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from 'firebase/auth';

import { auth } from '@/services/firebase';

function requireAuth() {
  if (!auth) {
    throw new Error('Firebase Auth indisponible. Vérifie .env.local.');
  }
  return auth;
}

/** Opérations Auth préparées pour J5. */
export async function register(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
}

export async function login(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(requireAuth(), email.trim(), password);
}

export async function logout(): Promise<void> {
  await signOut(requireAuth());
}
