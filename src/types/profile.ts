export type CrossFitLevel = 'beginner' | 'intermediate' | 'advanced';

export type CrossFitFocus = 'force' | 'metcon' | 'gymnastique';

export type LocalAvailability = {
  /** 1 = lundi … 7 = dimanche */
  day: number;
  /** Minutes depuis minuit */
  startMinutes: number;
  endMinutes: number;
};

export type LocalProfileDraft = {
  displayName: string;
  city: string;
  level: CrossFitLevel | '';
  focus: CrossFitFocus | '';
  bio: string;
  availabilityDay: string;
  availabilityStart: string;
  availabilityEnd: string;
};

export type LocalProfile = {
  displayName: string;
  city: string;
  level: CrossFitLevel;
  focus: CrossFitFocus;
  sports: ['CrossFit'];
  bio: string;
  availability: LocalAvailability;
};

export const LEVEL_OPTIONS: { value: CrossFitLevel; label: string }[] = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Confirmé' },
];

export const FOCUS_OPTIONS: { value: CrossFitFocus; label: string }[] = [
  { value: 'force', label: 'Force & haltéro' },
  { value: 'metcon', label: 'Metcon' },
  { value: 'gymnastique', label: 'Gymnastique' },
];

export const DAY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 7, label: 'Dimanche' },
];
