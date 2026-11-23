import { collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '@/services/firebase';
import { mapProfile } from '@/services/profileService';
import type { GymMember } from '@/types/member';
import type { UserProfile } from '@/types/user-profile';
import { distanceKm, type GeoPoint } from '@/utils/geo';

function requireDb() {
  if (!db) {
    throw new Error('Firestore indisponible. Vérifie .env.local.');
  }
  return db;
}

export async function listGymMembers(
  gymId: string,
  currentUid: string,
  viewerLocation?: GeoPoint | null,
): Promise<GymMember[]> {
  const membersQuery = query(
    collection(requireDb(), 'users'),
    where('gymId', '==', gymId),
  );
  const snapshot = await getDocs(membersQuery);

  return snapshot.docs
    .filter((item) => item.id !== currentUid)
    .map((item) => {
      const profile = mapProfile(item.id, item.data() as Record<string, unknown>);
      return withDistance(profile, viewerLocation);
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'fr'));
}

function withDistance(profile: UserProfile, viewerLocation?: GeoPoint | null): GymMember {
  let distance: number | null = null;
  if (viewerLocation && profile.location) {
    distance = distanceKm(viewerLocation, {
      lat: profile.location.lat,
      lng: profile.location.lng,
    });
  }
  return { ...profile, distanceKm: distance };
}
