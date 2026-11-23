import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/services/firebase';
import type { TrainingSession } from '@/types/relation';
import { toDate } from '@/types/training-request';

function requireDb() {
  if (!db) {
    throw new Error('Firestore indisponible. Vérifie .env.local.');
  }
  return db;
}

function mapSession(id: string, data: Record<string, unknown>): TrainingSession {
  return {
    id,
    requestId: String(data.requestId ?? id),
    relationId: String(data.relationId ?? ''),
    members: Array.isArray(data.members)
      ? data.members.filter((item): item is string => typeof item === 'string')
      : [],
    gymId: String(data.gymId ?? ''),
    sport: String(data.sport ?? 'CrossFit'),
    startsAt: toDate(data.startsAt) ?? new Date(0),
    endsAt: toDate(data.endsAt) ?? new Date(0),
    timeZone: String(data.timeZone ?? 'Europe/Paris'),
    status: (data.status as TrainingSession['status']) ?? 'planned',
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function getSession(sessionId: string): Promise<TrainingSession | null> {
  const snapshot = await getDoc(doc(requireDb(), 'trainingSessions', sessionId));
  if (!snapshot.exists()) {
    return null;
  }
  return mapSession(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function listMySessions(uid: string): Promise<TrainingSession[]> {
  const snapshot = await getDocs(
    query(collection(requireDb(), 'trainingSessions'), where('members', 'array-contains', uid)),
  );
  return snapshot.docs
    .map((item) => mapSession(item.id, item.data() as Record<string, unknown>))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

export async function cancelSession(sessionId: string, uid: string): Promise<void> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Séance introuvable.');
  }
  if (!session.members.includes(uid)) {
    throw new Error('Accès refusé.');
  }
  if (session.status !== 'planned') {
    throw new Error('Seule une séance prévue peut être annulée.');
  }
  await updateDoc(doc(requireDb(), 'trainingSessions', sessionId), {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });
}

export async function markSessionDone(sessionId: string, uid: string): Promise<void> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Séance introuvable.');
  }
  if (!session.members.includes(uid)) {
    throw new Error('Accès refusé.');
  }
  if (session.status !== 'planned') {
    throw new Error('Statut incompatible.');
  }
  if (session.endsAt.getTime() > Date.now()) {
    throw new Error('Tu pourras marquer terminé après la fin du créneau.');
  }
  await updateDoc(doc(requireDb(), 'trainingSessions', sessionId), {
    status: 'done',
    updatedAt: serverTimestamp(),
  });
}
