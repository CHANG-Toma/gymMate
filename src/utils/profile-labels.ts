import type { UserAvailability, UserLevel, UserProfile } from '@/types/user-profile';

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] as const;

export const LEVEL_LABELS: Record<UserLevel, string> = {
  beginner: 'Débutant',
  intermediate: 'Scaled',
  advanced: 'RX',
};

export function formatLevel(level: UserLevel): string {
  return LEVEL_LABELS[level] ?? level;
}

export function formatFocus(goal: string): string {
  const normalized = goal.trim().toLowerCase();
  if (normalized.includes('force') || normalized.includes('halt')) {
    return 'Force & haltéro';
  }
  if (normalized.includes('gym')) {
    return 'Gymnastique';
  }
  if (normalized.includes('metcon') || normalized.includes('cardio')) {
    return 'Metcon';
  }
  return goal.trim() || 'CrossFit';
}

function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}

export function formatAvailability(items: UserAvailability[]): string {
  if (!items.length) {
    return 'Non renseigné';
  }
  return items
    .slice(0, 2)
    .map((slot) => {
      const day = DAY_LABELS[slot.day % 7] ?? `J${slot.day}`;
      return `${day} ${formatMinutes(slot.startMinutes)}-${formatMinutes(slot.endMinutes)}`;
    })
    .join(' · ');
}

export function partnerUid(members: string[], selfUid: string): string | null {
  return members.find((uid) => uid !== selfUid) ?? null;
}

export function displayNameOf(profile: UserProfile | null | undefined, fallback = 'Athlète'): string {
  return profile?.displayName?.trim() || fallback;
}
