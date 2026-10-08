import type { Member } from '@/types/member';

/** Athlètes CrossFit fictifs de la même box (données locales). */
export const MOCK_MEMBERS: Member[] = [
  {
    id: 'sami',
    displayName: 'Sami',
    focus: 'Force & haltéro',
    boxName: 'CrossFit Campus SQY',
    level: 'Scaled',
    availabilityLabel: 'Mar 18h-19h',
    bio: 'Dispo le soir pour bosser la force et le bar path.',
  },
  {
    id: 'amine',
    displayName: 'Amine',
    focus: 'Metcon',
    boxName: 'CrossFit Campus SQY',
    level: 'Débutant',
    availabilityLabel: 'Jeu 19h-20h',
    bio: 'Je veux progresser sur les metcons, idéalement en fin de journée.',
  },
  {
    id: 'lina',
    displayName: 'Lina',
    focus: 'Gymnastique',
    boxName: 'CrossFit Campus SQY',
    level: 'RX',
    availabilityLabel: 'Lun 12h-13h',
    bio: 'Pull-ups, HSPU, muscle-ups : je cherche quelqu’un pour s’entraîner en duo.',
  },
];

export const CURRENT_BOX_NAME = 'CrossFit Campus SQY';

export function getMemberById(id: string): Member | undefined {
  return MOCK_MEMBERS.find((member) => member.id === id);
}

export function filterMembers(
  members: Member[],
  options: {
    query: string;
    focus: string;
    level: string;
  },
): Member[] {
  const normalizedQuery = options.query.trim().toLowerCase();

  return members.filter((member) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      member.displayName.toLowerCase().includes(normalizedQuery) ||
      member.focus.toLowerCase().includes(normalizedQuery);

    const matchesFocus = options.focus === 'Tous' || member.focus === options.focus;
    const matchesLevel = options.level === 'Tous' || member.level === options.level;

    return matchesQuery && matchesFocus && matchesLevel;
  });
}
