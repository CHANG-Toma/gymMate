import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { TrainingSession } from '@/types/relation';
import { formatSlotRange } from '@/utils/date-slot';

const REMINDERS_ENABLED_KEY = 'gymmate.reminders.enabled';
const REMINDER_IDS_KEY = 'gymmate.reminders.ids';
const REMINDER_LEAD_MS = 60 * 60 * 1000; // 1 h avant la séance

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type ReminderMap = Record<string, string>;

function isNativeMobile(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

async function readReminderMap(): Promise<ReminderMap> {
  const raw = await AsyncStorage.getItem(REMINDER_IDS_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as ReminderMap;
  } catch {
    return {};
  }
}

async function writeReminderMap(map: ReminderMap): Promise<void> {
  await AsyncStorage.setItem(REMINDER_IDS_KEY, JSON.stringify(map));
}

export async function areRemindersEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(REMINDERS_ENABLED_KEY);
  return value !== '0';
}

export async function setRemindersEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(REMINDERS_ENABLED_KEY, enabled ? '1' : '0');
  if (!enabled) {
    await cancelAllSessionReminders();
  }
}

export async function ensureNotificationPermissions(): Promise<{
  granted: boolean;
  message: string;
}> {
  if (!isNativeMobile()) {
    return {
      granted: false,
      message: 'Les rappels locaux nécessitent iOS/Android (indisponibles sur le web).',
    };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('session-reminders', {
      name: 'Rappels de séance',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const asked = await Notifications.requestPermissionsAsync();
    status = asked.status;
  }

  if (status !== 'granted') {
    return {
      granted: false,
      message: 'Permission notifications refusée. Active-la dans les réglages du téléphone.',
    };
  }

  return { granted: true, message: 'Notifications autorisées.' };
}

export async function notifyNow(title: string, body: string, data?: Record<string, string>) {
  if (!isNativeMobile()) {
    return;
  }
  const enabled = await areRemindersEnabled();
  if (!enabled) {
    return;
  }
  const permission = await ensureNotificationPermissions();
  if (!permission.granted) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: true,
    },
    trigger: null,
  });
}

export async function cancelSessionReminder(sessionId: string): Promise<void> {
  const map = await readReminderMap();
  const identifier = map[sessionId];
  if (identifier) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    delete map[sessionId];
    await writeReminderMap(map);
  }
}

export async function cancelAllSessionReminders(): Promise<void> {
  const map = await readReminderMap();
  await Promise.all(
    Object.values(map).map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined),
    ),
  );
  await writeReminderMap({});
}

/**
 * Programme un rappel local 1 h avant le début (ou dès que possible si < 1 h).
 */
export async function scheduleSessionReminder(
  session: TrainingSession,
  partnerName?: string,
): Promise<'scheduled' | 'skipped' | 'disabled' | 'unsupported'> {
  if (!isNativeMobile()) {
    return 'unsupported';
  }
  if (!(await areRemindersEnabled())) {
    return 'disabled';
  }
  if (session.status !== 'planned') {
    await cancelSessionReminder(session.id);
    return 'skipped';
  }

  const permission = await ensureNotificationPermissions();
  if (!permission.granted) {
    return 'disabled';
  }

  const now = Date.now();
  const startMs = session.startsAt.getTime();
  if (startMs <= now) {
    await cancelSessionReminder(session.id);
    return 'skipped';
  }

  let triggerAt = startMs - REMINDER_LEAD_MS;
  if (triggerAt <= now) {
    // Moins d'1 h : rappel dans 1 minute pour rester utile en démo
    triggerAt = now + 60_000;
  }

  await cancelSessionReminder(session.id);

  const partner = partnerName?.trim() || 'ton partenaire';
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rappel WOD GymMate',
      body: `Séance CrossFit avec ${partner} · ${formatSlotRange(session.startsAt, session.endsAt)}`,
      data: { type: 'session_reminder', sessionId: session.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(triggerAt),
      channelId: Platform.OS === 'android' ? 'session-reminders' : undefined,
    },
  });

  const map = await readReminderMap();
  map[session.id] = identifier;
  await writeReminderMap(map);
  return 'scheduled';
}

/** Aligne les rappels avec la liste des séances prévues. */
export async function syncSessionReminders(
  sessions: TrainingSession[],
  partnerNames: Record<string, string>,
  selfUid: string,
): Promise<void> {
  if (!isNativeMobile() || !(await areRemindersEnabled())) {
    return;
  }

  const upcoming = sessions.filter(
    (item) => item.status === 'planned' && item.startsAt.getTime() > Date.now(),
  );
  const upcomingIds = new Set(upcoming.map((item) => item.id));

  const map = await readReminderMap();
  for (const sessionId of Object.keys(map)) {
    if (!upcomingIds.has(sessionId)) {
      await cancelSessionReminder(sessionId);
    }
  }

  for (const session of upcoming) {
    const partner = session.members.find((uid) => uid !== selfUid);
    await scheduleSessionReminder(session, partner ? partnerNames[partner] : undefined);
  }
}
