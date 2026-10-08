/**
 * Catalogue gyms à créer manuellement dans la console Firestore (écriture app = false).
 * IDs stables pour les tests A/B/C du PDF.
 */
export const SEED_GYMS = [
  {
    id: 'gym_sqy',
    name: 'CrossFit Campus SQY',
    city: 'Guyancourt',
    address: 'Adresse fictive - Campus SQY',
  },
  {
    id: 'gym_versailles',
    name: 'CrossFit Studio Versailles',
    city: 'Versailles',
    address: 'Adresse fictive - Versailles',
  },
  {
    id: 'gym_paris',
    name: 'CrossFit Campus Paris',
    city: 'Paris',
    address: 'Adresse fictive - Paris',
  },
] as const;
