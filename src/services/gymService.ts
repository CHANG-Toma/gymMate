import { collection, getDocs } from 'firebase/firestore';

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

export async function listGyms(): Promise<Gym[]> {
  const snapshot = await getDocs(collection(requireDb(), 'gyms'));
  return snapshot.docs
    .map((item) => {
      const data = item.data();
      return {
        id: item.id,
        name: typeof data.name === 'string' ? data.name : item.id,
        city: typeof data.city === 'string' ? data.city : '',
        address: typeof data.address === 'string' ? data.address : '',
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}
