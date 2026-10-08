import type { CrossFitFocus, CrossFitLevel, LocalProfile, LocalProfileDraft } from '@/types/profile';

export type ProfileFieldErrors = Partial<
  Record<
    | 'displayName'
    | 'city'
    | 'level'
    | 'focus'
    | 'bio'
    | 'availabilityDay'
    | 'availabilityStart'
    | 'availabilityEnd',
    string
  >
>;

function parseHourToMinutes(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d{1,2}:\d{2}$/.test(trimmed)) {
    return null;
  }

  const [hoursRaw, minutesRaw] = trimmed.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

export type ProfileStepId = 'identity' | 'level' | 'focus' | 'availability' | 'bio';

export function validateProfileStep(
  step: ProfileStepId,
  draft: LocalProfileDraft,
): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};

  if (step === 'identity') {
    const displayName = draft.displayName.trim().replace(/\s+/g, ' ');
    if (displayName.length < 2 || displayName.length > 40) {
      errors.displayName = 'Le nom doit contenir entre 2 et 40 caractères.';
    }

    const city = draft.city.trim().replace(/\s+/g, ' ');
    if (city.length < 2 || city.length > 60) {
      errors.city = 'La ville doit contenir entre 2 et 60 caractères.';
    }
  }

  if (step === 'level' && !draft.level) {
    errors.level = 'Choisis ton niveau CrossFit.';
  }

  if (step === 'focus' && !draft.focus) {
    errors.focus = 'Choisis un focus de séance.';
  }

  if (step === 'availability') {
    const day = Number(draft.availabilityDay);
    if (!Number.isInteger(day) || day < 1 || day > 7) {
      errors.availabilityDay = 'Choisis un jour de disponibilité.';
    }

    const startMinutes = parseHourToMinutes(draft.availabilityStart);
    if (startMinutes === null) {
      errors.availabilityStart = 'Heure de début invalide (ex. 18:00).';
    }

    const endMinutes = parseHourToMinutes(draft.availabilityEnd);
    if (endMinutes === null) {
      errors.availabilityEnd = 'Heure de fin invalide (ex. 19:30).';
    }

    if (
      startMinutes !== null &&
      endMinutes !== null &&
      !(startMinutes >= 0 && startMinutes < endMinutes && endMinutes <= 1440)
    ) {
      errors.availabilityEnd = 'La fin doit être après le début.';
    }
  }

  if (step === 'bio') {
    const bio = draft.bio.trim();
    if (bio.length > 280) {
      errors.bio = 'La bio ne peut pas dépasser 280 caractères.';
    }
  }

  return errors;
}

export function validateProfileDraft(draft: LocalProfileDraft): {
  errors: ProfileFieldErrors;
  profile: LocalProfile | null;
} {
  const errors: ProfileFieldErrors = {
    ...validateProfileStep('identity', draft),
    ...validateProfileStep('level', draft),
    ...validateProfileStep('focus', draft),
    ...validateProfileStep('availability', draft),
    ...validateProfileStep('bio', draft),
  };

  if (Object.keys(errors).length > 0) {
    return { errors, profile: null };
  }

  const displayName = draft.displayName.trim().replace(/\s+/g, ' ');
  const city = draft.city.trim().replace(/\s+/g, ' ');
  const bio = draft.bio.trim();
  const day = Number(draft.availabilityDay);
  const startMinutes = parseHourToMinutes(draft.availabilityStart) as number;
  const endMinutes = parseHourToMinutes(draft.availabilityEnd) as number;

  return {
    errors: {},
    profile: {
      displayName,
      city,
      level: draft.level as CrossFitLevel,
      focus: draft.focus as CrossFitFocus,
      sports: ['CrossFit'],
      bio,
      availability: {
        day,
        startMinutes,
        endMinutes,
      },
    },
  };
}
