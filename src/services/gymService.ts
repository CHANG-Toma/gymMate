import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

import { db } from '@/services/firebase';

export type Gym = {
  id: string;
  name: string;
  city: string;
  address: string;
};

function requireDb() {
  if (!db) {
    throw new Error('Firestore indisponible. Vérifie .env.local.');
  }
  return db;
}

function mapGym(id: string, data: Record<string, unknown>): Gym {
  return {
    id,
    name: typeof data.name === 'string' ? data.name : id,
    city: typeof data.city === 'string' ? data.city : '',
    address: typeof data.address === 'string' ? data.address : '',
  };
}

export async function listGyms(): Promise<Gym[]> {
  const snapshot = await getDocs(collection(requireDb(), 'gyms'));
  return snapshot.docs
    .map((item) => mapGym(item.id, item.data() as Record<string, unknown>))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

export async function getGym(gymId: string): Promise<Gym | null> {
  const snapshot = await getDoc(doc(requireDb(), 'gyms', gymId));
  if (!snapshot.exists()) {
    return null;
  }
  return mapGym(snapshot.id, snapshot.data() as Record<string, unknown>);
}
