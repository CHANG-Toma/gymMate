/** Construit un créneau local (Europe/Paris côté affichage) à partir de date + HH:mm. */
export function buildSlotTimestamps(
  dateYmd: string,
  startHm: string,
  endHm: string,
): { startsAt: Date; endsAt: Date } {
  const start = parseLocalDateTime(dateYmd, startHm);
  const end = parseLocalDateTime(dateYmd, endHm);
  return { startsAt: start, endsAt: end };
}

function parseLocalDateTime(dateYmd: string, hm: string): Date {
  const [year, month, day] = dateYmd.split('-').map(Number);
  const [hours, minutes] = hm.split(':').map(Number);
  if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error('Date ou heure invalide.');
  }
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function formatSlotRange(startsAt: Date, endsAt: Date): string {
  const date = startsAt.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const start = startsAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const end = endsAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${start} – ${end}`;
}

export function isFutureDate(date: Date, now = new Date()): boolean {
  return date.getTime() > now.getTime();
}
