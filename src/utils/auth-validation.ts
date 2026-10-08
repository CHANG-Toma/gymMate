export type AuthFieldErrors = Partial<
  Record<'displayName' | 'email' | 'password' | 'confirmPassword', string>
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterInput(input: {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const displayName = input.displayName.trim().replace(/\s+/g, ' ');

  if (displayName.length < 2 || displayName.length > 40) {
    errors.displayName = 'Le nom doit contenir entre 2 et 40 caractères.';
  }

  if (!input.email.trim()) {
    errors.email = 'Email requis.';
  } else if (!EMAIL_REGEX.test(input.email.trim())) {
    errors.email = 'Format email invalide.';
  }

  if (input.password.length < 6) {
    errors.password = 'Mot de passe : 6 caractères minimum.';
  }

  if (input.confirmPassword !== input.password) {
    errors.confirmPassword = 'La confirmation ne correspond pas.';
  }

  return errors;
}

export function validateLoginInput(input: {
  email: string;
  password: string;
}): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (!input.email.trim() || !EMAIL_REGEX.test(input.email.trim())) {
    errors.email = 'Email invalide.';
  }

  if (!input.password) {
    errors.password = 'Mot de passe requis.';
  }

  return errors;
}
