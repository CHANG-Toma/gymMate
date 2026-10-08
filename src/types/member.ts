export type Member = {
  id: string;
  displayName: string;
  /** Spécialité / objectif de séance CrossFit. */
  focus: 'Force & haltéro' | 'Metcon' | 'Gymnastique';
  boxName: string;
  level: 'Débutant' | 'Scaled' | 'RX';
  availabilityLabel: string;
  bio: string;
};

export const FOCUS_FILTERS = ['Tous', 'Force & haltéro', 'Metcon', 'Gymnastique'] as const;
export const LEVEL_FILTERS = ['Tous', 'Débutant', 'Scaled', 'RX'] as const;

export type FocusFilter = (typeof FOCUS_FILTERS)[number];
export type LevelFilter = (typeof LEVEL_FILTERS)[number];
