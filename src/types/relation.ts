export type Relation = {
  id: string;
  members: string[];
  gymId: string;
  sourceRequestId: string;
  createdAt: Date | null;
};

export type ChatThread = {
  id: string;
  relationId: string;
  members: string[];
  createdAt: Date | null;
  lastMessage?: string | null;
  updatedAt?: Date | null;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date | null;
};

export type SessionStatus = 'planned' | 'done' | 'cancelled';

export type TrainingSession = {
  id: string;
  requestId: string;
  relationId: string;
  members: string[];
  gymId: string;
  sport: string;
  startsAt: Date;
  endsAt: Date;
  timeZone: string;
  status: SessionStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
};
