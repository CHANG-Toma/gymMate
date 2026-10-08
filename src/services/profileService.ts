import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { db } from '@/services/firebase';
import type { UserAvailability, UserLevel, UserProfile } from '@/types/user-profile';

export type ProfileWriteInput = {
  displayName: string;
  city: string;
  level: UserLevel;
  goal: string;
  sports: string[];
  availability: UserAvailability[];
  bio: string;
};

function requireDb() {
  if (!db) {
    throw new Error('Firestore indisponible. Vérifie .env.local.');
  }
  return db;
}

function mapProfile(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    city: typeof data.city === 'string' ? data.city : '',
    level: (data.level as UserLevel) ?? 'beginner',
    goal: typeof data.goal === 'string' ? data.goal : '',
    sports: Array.isArray(data.sports)
      ? data.sports.filter((item): item is string => typeof item === 'string')
      : [],
    availability: Array.isArray(data.availability)
      ? (data.availability as UserAvailability[])
      : [],
    bio: typeof data.bio === 'string' ? data.bio : '',
    gymId: typeof data.gymId === 'string' ? data.gymId : null,
  };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(requireDb(), 'users', uid));
  if (!snapshot.exists()) {
    return null;
  }
  return mapProfile(uid, snapshot.data() as Record<string, unknown>);
}

/** Profil initial juste après inscription (gymId null). */
export async function createInitialProfile(uid: string, displayName: string): Promise<void> {
  const cleanedName = displayName.trim().replace(/\s+/g, ' ');
  await setDoc(doc(requireDb(), 'users', uid), {
    displayName: cleanedName,
    city: '',
    level: 'beginner',
    goal: '',
    sports: ['CrossFit'],
    availability: [],
    bio: '',
    gymId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(uid: string, input: ProfileWriteInput): Promise<void> {
  await updateDoc(doc(requireDb(), 'users', uid), {
    displayName: input.displayName.trim().replace(/\s+/g, ' '),
    city: input.city.trim().replace(/\s+/g, ' '),
    level: input.level,
    goal: input.goal.trim(),
    sports: input.sports,
    availability: input.availability,
    bio: input.bio.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function setUserGym(uid: string, gymId: string): Promise<void> {
  await updateDoc(doc(requireDb(), 'users', uid), {
    gymId,
    updatedAt: serverTimestamp(),
  });
}

export function isProfileReadyForGym(profile: UserProfile | null): boolean {
  if (!profile) {
    return false;
  }

  return (
    profile.displayName.trim().length >= 2 &&
    profile.city.trim().length >= 2 &&
    Boolean(profile.level) &&
    profile.goal.trim().length > 0 &&
    profile.sports.length > 0 &&
    profile.availability.length > 0
  );
}

export function isProfileComplete(profile: UserProfile | null): boolean {
  return isProfileReadyForGym(profile) && Boolean(profile?.gymId);
}
