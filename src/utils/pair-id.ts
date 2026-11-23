/** Identifiant stable A/B = B/A pour relations et chats (PDF p.25). */
export function buildPairId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('__');
}

export function pairMembers(uidA: string, uidB: string): [string, string] {
  return [uidA, uidB].sort() as [string, string];
}
