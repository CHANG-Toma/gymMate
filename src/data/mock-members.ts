import type { Member } from '@/types/member';

/** Athlètes CrossFit fictifs pour le J1 (données locales, pas Firebase). */
export const MOCK_MEMBERS: Member[] = [
  {
    id: 'sami',
    displayName: 'Sami',
    focus: 'Force & haltéro',
    boxName: 'CrossFit Campus SQY',
    level: 'Scaled',
    bio: 'Cherche un partenaire pour les WOD du soir, focus bar path et back squat.',
  },
  {
    id: 'amine',
    displayName: 'Amine',
    focus: 'Metcon',
    boxName: 'CrossFit Campus SQY',
    level: 'Débutant',
    bio: 'Disponible en fin de journée pour des metcons et travailler l’endurance.',
  },
  {
    id: 'lina',
    displayName: 'Lina',
    focus: 'Gymnastique',
    boxName: 'CrossFit Campus SQY',
    level: 'RX',
    bio: 'Aime les WOD techniques : pull-ups, HSPU, muscle-ups en duo.',
  },
];

export function getMemberById(id: string): Member | undefined {
  return MOCK_MEMBERS.find((member) => member.id === id);
}
