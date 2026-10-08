import { doc, getDoc } from 'firebase/firestore';

import { db } from '@/services/firebase';
import type { UserProfile } from '@/types/user-profile';

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
    level: (data.level as UserProfile['level']) ?? 'beginner',
    goal: typeof data.goal === 'string' ? data.goal : '',
    sports: Array.isArray(data.sports) ? data.sports.filter((item) => typeof item === 'string') : [],
    availability: Array.isArray(data.availability)
      ? (data.availability as UserProfile['availability'])
      : [],
    bio: typeof data.bio === 'string' ? data.bio : '',
    gymId: typeof data.gymId === 'string' ? data.gymId : null,
  };
}

/** Lecture users/{uid}. Les règles users arriveront aux jalons suivants. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(requireDb(), 'users', uid));
  if (!snapshot.exists()) {
    return null;
  }
  return mapProfile(uid, snapshot.data() as Record<string, unknown>);
}
