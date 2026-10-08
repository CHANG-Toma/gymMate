export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export type UserAvailability = {
  day: number;
  startMinutes: number;
  endMinutes: number;
};

/** Profil sportif Firestore users/{uid} (séparé du User Auth Firebase). */
export type UserProfile = {
  uid: string;
  displayName: string;
  city: string;
  level: UserLevel;
  goal: string;
  sports: string[];
  availability: UserAvailability[];
  bio: string;
  gymId: string | null;
};
