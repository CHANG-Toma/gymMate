import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { db } from '@/services/firebase';
import { toDate } from '@/types/training-request';
import type { Relation } from '@/types/relation';
import { isFutureDate } from '@/utils/date-slot';
import { buildPairId, pairMembers } from '@/utils/pair-id';

function requireDb() {
  if (!db) {
    throw new Error('Firestore indisponible. Vérifie .env.local.');
  }
  return db;
}

function mapRelation(id: string, data: Record<string, unknown>): Relation {
  return {
    id,
    members: Array.isArray(data.members)
      ? data.members.filter((item): item is string => typeof item === 'string')
      : [],
    gymId: String(data.gymId ?? ''),
    sourceRequestId: String(data.sourceRequestId ?? ''),
    createdAt: toDate(data.createdAt),
  };
}

export async function listMyRelations(uid: string): Promise<Relation[]> {
  const snapshot = await getDocs(
    query(collection(requireDb(), 'relations'), where('members', 'array-contains', uid)),
  );
  return snapshot.docs.map((item) => mapRelation(item.id, item.data() as Record<string, unknown>));
}

export type AcceptResult =
  | { status: 'accepted'; pairId: string; sessionId: string }
  | { status: 'already_processed'; pairId: string; sessionId: string };

/**
 * Acceptation atomique (PDF p.24) :
 * demande accepted + relation + chat + séance (id = requestId).
 * Toutes les lectures avant les écritures.
 */
export async function acceptRequest(
  requestId: string,
  receiverUid: string,
): Promise<AcceptResult> {
  const database = requireDb();
  const requestRef = doc(database, 'trainingRequests', requestId);

  return runTransaction(database, async (tx) => {
    const requestSnap = await tx.get(requestRef);
    if (!requestSnap.exists()) {
      throw new Error('Demande introuvable.');
    }

    const request = requestSnap.data();
    if (request.receiverId !== receiverUid) {
      throw new Error('Seul le destinataire peut accepter.');
    }

    const senderId = String(request.senderId);
    const pairId = buildPairId(senderId, receiverUid);
    const relationRef = doc(database, 'relations', pairId);
    const chatRef = doc(database, 'chats', pairId);
    const sessionRef = doc(database, 'trainingSessions', requestId);

    const relationSnap = await tx.get(relationRef);
    const sessionSnap = await tx.get(sessionRef);

    if (request.status === 'accepted') {
      return { status: 'already_processed', pairId, sessionId: requestId };
    }
    if (request.status !== 'pending') {
      throw new Error('Cette demande a déjà reçu une réponse.');
    }

    const startsAt = request.startsAt?.toDate?.() as Date | undefined;
    if (!startsAt || !isFutureDate(startsAt)) {
      throw new Error('Ce créneau est déjà passé. Envoie une nouvelle demande.');
    }

    const members = pairMembers(senderId, receiverUid);
    const gymId = String(request.gymId);
    const sport = String(request.sport ?? 'CrossFit');
    const endsAt = request.endsAt;
    const timeZone = String(request.timeZone ?? 'Europe/Paris');

    if (!relationSnap.exists()) {
      tx.set(relationRef, {
        members,
        gymId,
        sourceRequestId: requestId,
        createdAt: serverTimestamp(),
      });
      tx.set(chatRef, {
        relationId: pairId,
        members,
        createdAt: serverTimestamp(),
        lastMessage: null,
        updatedAt: serverTimestamp(),
      });
    }

    tx.update(requestRef, {
      status: 'accepted',
      respondedAt: serverTimestamp(),
    });

    if (!sessionSnap.exists()) {
      tx.set(sessionRef, {
        requestId,
        relationId: pairId,
        members,
        gymId,
        sport,
        startsAt: request.startsAt,
        endsAt,
        timeZone,
        status: 'planned',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return { status: 'accepted', pairId, sessionId: requestId };
  });
}

export async function getRelation(pairId: string): Promise<Relation | null> {
  const snapshot = await getDoc(doc(requireDb(), 'relations', pairId));
  if (!snapshot.exists()) {
    return null;
  }
  return mapRelation(snapshot.id, snapshot.data() as Record<string, unknown>);
}
