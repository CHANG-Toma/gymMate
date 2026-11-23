import type { Timestamp } from 'firebase/firestore';

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export type TrainingRequest = {
  id: string;
  senderId: string;
  receiverId: string;
  members: string[];
  gymId: string;
  sport: string;
  startsAt: Date;
  endsAt: Date;
  timeZone: string;
  message: string;
  status: RequestStatus;
  createdAt: Date | null;
  respondedAt: Date | null;
};

export type TrainingRequestWrite = {
  senderId: string;
  receiverId: string;
  gymId: string;
  startsAt: Date;
  endsAt: Date;
  message: string;
};

export function toDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as Timestamp).toDate();
  }
  return null;
}
