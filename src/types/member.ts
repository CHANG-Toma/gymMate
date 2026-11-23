import type { UserLevel, UserLocation, UserProfile } from '@/types/user-profile';

export type GymMember = UserProfile & {
  distanceKm: number | null;
};

export const FOCUS_FILTERS = ['Tous', 'Force & haltéro', 'Metcon', 'Gymnastique'] as const;
export const LEVEL_FILTERS = ['Tous', 'Débutant', 'Scaled', 'RX'] as const;
export const DISTANCE_FILTERS = ['Tous', '< 2 km', '< 5 km', '< 10 km'] as const;

export type FocusFilter = (typeof FOCUS_FILTERS)[number];
export type LevelFilter = (typeof LEVEL_FILTERS)[number];
export type DistanceFilter = (typeof DISTANCE_FILTERS)[number];

const LEVEL_BY_LABEL: Record<Exclude<LevelFilter, 'Tous'>, UserLevel> = {
  Débutant: 'beginner',
  Scaled: 'intermediate',
  RX: 'advanced',
};

const DISTANCE_MAX_KM: Record<Exclude<DistanceFilter, 'Tous'>, number> = {
  '< 2 km': 2,
  '< 5 km': 5,
  '< 10 km': 10,
};

export function filterGymMembers(
  members: GymMember[],
  options: {
    query: string;
    focus: FocusFilter;
    level: LevelFilter;
    distance: DistanceFilter;
  },
): GymMember[] {
  const normalizedQuery = options.query.trim().toLowerCase();
  const maxKm =
    options.distance === 'Tous' ? null : DISTANCE_MAX_KM[options.distance];

  return members.filter((member) => {
    const focusLabel = member.goal.toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 ||
      member.displayName.toLowerCase().includes(normalizedQuery) ||
      focusLabel.includes(normalizedQuery);

    const matchesFocus =
      options.focus === 'Tous' ||
      focusMatches(member.goal, options.focus);

    const matchesLevel =
      options.level === 'Tous' || member.level === LEVEL_BY_LABEL[options.level];

    const matchesDistance =
      maxKm == null ||
      (member.distanceKm != null && member.distanceKm <= maxKm);

    return matchesQuery && matchesFocus && matchesLevel && matchesDistance;
  });
}

function focusMatches(goal: string, focus: Exclude<FocusFilter, 'Tous'>): boolean {
  const value = goal.toLowerCase();
  if (focus === 'Force & haltéro') {
    return value.includes('force') || value.includes('halt');
  }
  if (focus === 'Gymnastique') {
    return value.includes('gym');
  }
  return value.includes('metcon') || value.includes('cardio') || value.includes('wod');
}

export type { UserLocation };
