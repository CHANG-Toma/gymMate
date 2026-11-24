import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/services/firebase';
import { getUserProfile } from '@/services/profileService';
import {
  toDate,
  type TrainingRequest,
  type TrainingRequestWrite,
} from '@/types/training-request';
import { isFutureDate } from '@/utils/date-slot';
import { pairMembers } from '@/utils/pair-id';

function requireDb() {
  if (!db) {
    throw new Error('Firestore indisponible. Vérifie .env.local.');
  }
  return db;
}

function mapRequest(id: string, data: Record<string, unknown>): TrainingRequest {
  const startsAt = toDate(data.startsAt) ?? new Date(0);
  const endsAt = toDate(data.endsAt) ?? new Date(0);
  return {
    id,
    senderId: String(data.senderId ?? ''),
    receiverId: String(data.receiverId ?? ''),
    members: Array.isArray(data.members)
      ? data.members.filter((item): item is string => typeof item === 'string')
      : [],
    gymId: String(data.gymId ?? ''),
    sport: String(data.sport ?? 'CrossFit'),
    startsAt,
    endsAt,
    timeZone: String(data.timeZone ?? 'Europe/Paris'),
    message: typeof data.message === 'string' ? data.message : '',
    status: (data.status as TrainingRequest['status']) ?? 'pending',
    createdAt: toDate(data.createdAt),
    respondedAt: toDate(data.respondedAt),
  };
}

export async function sendTrainingRequest(
  input: TrainingRequestWrite,
  stableId?: string,
): Promise<{ id: string; alreadyExists: boolean }> {
  if (input.senderId === input.receiverId) {
    throw new Error('Tu ne peux pas t’envoyer une demande.');
  }
  if (!isFutureDate(input.startsAt)) {
    throw new Error('Le créneau doit commencer dans le futur.');
  }
  if (input.endsAt.getTime() <= input.startsAt.getTime()) {
    throw new Error('La fin doit être après le début.');
  }

  const sender = await getUserProfile(input.senderId);
  const receiver = await getUserProfile(input.receiverId);
  if (!sender?.gymId || !receiver?.gymId || sender.gymId !== receiver.gymId) {
    throw new Error('Le destinataire doit être dans la même box.');
  }
  if (sender.gymId !== input.gymId) {
    throw new Error('Salle incohérente.');
  }

  const database = requireDb();
  const requestRef = stableId
    ? doc(database, 'trainingRequests', stableId)
    : doc(collection(database, 'trainingRequests'));

  // Reprise sans doublon : get autorisé même si absent (resource == null).
  // Un 2ᵉ setDoc sur le même id serait un update (interdit au sender).
  if (stableId) {
    const existing = await getDoc(requestRef);
    if (existing.exists()) {
      return { id: requestRef.id, alreadyExists: true };
    }
  }

  const members = pairMembers(input.senderId, input.receiverId);
  const message = input.message.trim().slice(0, 500);

  try {
    await setDoc(requestRef, {
      senderId: input.senderId,
      receiverId: input.receiverId,
      members,
      gymId: input.gymId,
      sport: 'CrossFit',
      startsAt: Timestamp.fromDate(input.startsAt),
      endsAt: Timestamp.fromDate(input.endsAt),
      timeZone: 'Europe/Paris',
      message,
      status: 'pending',
      createdAt: serverTimestamp(),
      respondedAt: null,
    });
    return { id: requestRef.id, alreadyExists: false };
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'permission-denied') {
      throw new Error(
        'Permission refusée. Republie firestore.rules dans la console Firebase, puis réessaie.',
      );
    }
    throw error;
  }
}

export async function listReceivedRequests(uid: string): Promise<TrainingRequest[]> {
  const snapshot = await getDocs(
    query(collection(requireDb(), 'trainingRequests'), where('receiverId', '==', uid)),
  );
  return snapshot.docs
    .map((item) => mapRequest(item.id, item.data() as Record<string, unknown>))
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}

export async function listSentRequests(uid: string): Promise<TrainingRequest[]> {
  const snapshot = await getDocs(
    query(collection(requireDb(), 'trainingRequests'), where('senderId', '==', uid)),
  );
  return snapshot.docs
    .map((item) => mapRequest(item.id, item.data() as Record<string, unknown>))
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}

export async function getTrainingRequest(requestId: string): Promise<TrainingRequest | null> {
  const snapshot = await getDoc(doc(requireDb(), 'trainingRequests', requestId));
  if (!snapshot.exists()) {
    return null;
  }
  return mapRequest(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function rejectRequest(requestId: string, receiverUid: string): Promise<void> {
  const ref = doc(requireDb(), 'trainingRequests', requestId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    throw new Error('Demande introuvable.');
  }
  const data = snapshot.data();
  if (data.receiverId !== receiverUid) {
    throw new Error('Seul le destinataire peut refuser.');
  }
  if (data.status !== 'pending') {
    throw new Error('Cette demande a déjà reçu une réponse.');
  }
  await updateDoc(ref, {
    status: 'rejected',
    respondedAt: serverTimestamp(),
  });
}
