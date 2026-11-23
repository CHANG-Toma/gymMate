import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/services/firebase';
import type { ChatMessage, ChatThread } from '@/types/relation';
import { toDate } from '@/types/training-request';

function requireDb() {
  if (!db) {
    throw new Error('Firestore indisponible. Vérifie .env.local.');
  }
  return db;
}

function mapChat(id: string, data: Record<string, unknown>): ChatThread {
  return {
    id,
    relationId: String(data.relationId ?? id),
    members: Array.isArray(data.members)
      ? data.members.filter((item): item is string => typeof item === 'string')
      : [],
    createdAt: toDate(data.createdAt),
    lastMessage: typeof data.lastMessage === 'string' ? data.lastMessage : null,
    updatedAt: toDate(data.updatedAt),
  };
}

function mapMessage(id: string, data: Record<string, unknown>): ChatMessage {
  return {
    id,
    senderId: String(data.senderId ?? ''),
    text: String(data.text ?? ''),
    createdAt: toDate(data.createdAt),
  };
}

export async function listMyChats(uid: string): Promise<ChatThread[]> {
  const snapshot = await getDocs(
    query(collection(requireDb(), 'chats'), where('members', 'array-contains', uid)),
  );
  return snapshot.docs
    .map((item) => mapChat(item.id, item.data() as Record<string, unknown>))
    .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
}

export async function getChat(chatId: string): Promise<ChatThread | null> {
  const snapshot = await getDoc(doc(requireDb(), 'chats', chatId));
  if (!snapshot.exists()) {
    return null;
  }
  return mapChat(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export function subscribeMessages(
  chatId: string,
  onData: (messages: ChatMessage[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  const messagesQuery = query(
    collection(requireDb(), 'chats', chatId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(50),
  );

  return onSnapshot(
    messagesQuery,
    (snap) => {
      const rows = snap.docs.map((item) =>
        mapMessage(item.id, item.data() as Record<string, unknown>),
      );
      onData(rows.reverse());
    },
    () => onError('Messages indisponibles. Réessaie.'),
  );
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string,
  stableId?: string,
): Promise<void> {
  const cleaned = text.trim();
  if (cleaned.length < 1 || cleaned.length > 1000) {
    throw new Error('Le message doit faire entre 1 et 1000 caractères.');
  }

  const chat = await getChat(chatId);
  if (!chat || !chat.members.includes(senderId)) {
    throw new Error('Conversation inaccessible.');
  }

  const database = requireDb();
  const messageRef = stableId
    ? doc(database, 'chats', chatId, 'messages', stableId)
    : doc(collection(database, 'chats', chatId, 'messages'));

  await setDoc(messageRef, {
    senderId,
    text: cleaned,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(database, 'chats', chatId), {
    lastMessage: cleaned,
    updatedAt: serverTimestamp(),
  });
}
