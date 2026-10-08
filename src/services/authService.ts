import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type UserCredential,
} from 'firebase/auth';

import { auth } from '@/services/firebase';
import { createInitialProfile } from '@/services/profileService';

function requireAuth() {
  if (!auth) {
    throw new Error('Firebase Auth indisponible. Vérifie .env.local.');
  }
  return auth;
}

export function mapAuthError(error: unknown): string {
  const code = (error as { code?: string }).code;

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Cet email est déjà utilisé.';
    case 'auth/invalid-email':
      return 'Email invalide.';
    case 'auth/weak-password':
      return 'Mot de passe trop faible (6 caractères minimum).';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'Connexion impossible avec ces identifiants.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessaie plus tard.';
    case 'auth/network-request-failed':
      return 'Problème réseau. Vérifie ta connexion.';
    default:
      return 'Une erreur est survenue. Réessaie.';
  }
}

export async function register(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
}

export async function login(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(requireAuth(), email.trim(), password);
}

export async function logout(): Promise<void> {
  await signOut(requireAuth());
}

/**
 * Inscription + création du document users/{uid}.
 * Si le profil échoue, le compte Auth existe déjà : on pourra reprendre sans réinscrire.
 */
export async function registerWithInitialProfile(
  email: string,
  password: string,
  displayName: string,
): Promise<{ user: User; profileCreated: boolean }> {
  const credential = await register(email, password);

  try {
    await createInitialProfile(credential.user.uid, displayName);
    return { user: credential.user, profileCreated: true };
  } catch {
    return { user: credential.user, profileCreated: false };
  }
}

export async function resumeInitialProfile(uid: string, displayName: string): Promise<void> {
  await createInitialProfile(uid, displayName);
}
