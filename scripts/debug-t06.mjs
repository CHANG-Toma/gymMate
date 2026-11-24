/** Diagnostique précis T06/T07 permission-denied */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';

import { requireFirebaseConfig } from './load-env.mjs';

const firebaseConfig = requireFirebaseConfig();

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function pairId(a, b) {
  return [a, b].sort().join('__');
}

async function main() {
  const a = await signInWithEmailAndPassword(auth, 'lina@gymmate.test', 'Test1234!');
  const uidA = a.user.uid;
  await signOut(auth);
  const b = await signInWithEmailAndPassword(auth, 'sami@gymmate.test', 'Test1234!');
  const uidB = b.user.uid;
  await signOut(auth);

  const members = [uidA, uidB].sort();
  const startsAt = new Date(Date.now() + 48 * 3600_000);
  const endsAt = new Date(startsAt.getTime() + 3600_000);
  const pid = pairId(uidA, uidB);

  // --- T06 path: reject + get missing session ---
  await signInWithEmailAndPassword(auth, 'lina@gymmate.test', 'Test1234!');
  const reqReject = `debug_rej_${Date.now()}`;
  await setDoc(doc(db, 'trainingRequests', reqReject), {
    senderId: uidA,
    receiverId: uidB,
    members,
    gymId: 'gym_sqy',
    sport: 'CrossFit',
    startsAt: Timestamp.fromDate(startsAt),
    endsAt: Timestamp.fromDate(endsAt),
    timeZone: 'Europe/Paris',
    message: 'debug reject',
    status: 'pending',
    createdAt: serverTimestamp(),
    respondedAt: null,
  });
  console.log('CREATE reject OK', reqReject);

  await signOut(auth);
  await signInWithEmailAndPassword(auth, 'sami@gymmate.test', 'Test1234!');
  try {
    await updateDoc(doc(db, 'trainingRequests', reqReject), {
      status: 'rejected',
      respondedAt: serverTimestamp(),
    });
    console.log('REJECT UPDATE OK');
  } catch (e) {
    console.log('REJECT UPDATE FAIL', e.code, e.message);
  }

  try {
    const session = await getDoc(doc(db, 'trainingSessions', reqReject));
    console.log('GET missing session OK exists=', session.exists());
  } catch (e) {
    console.log('GET missing session FAIL', e.code, e.message);
  }

  // --- Full accept transaction ---
  await signOut(auth);
  await signInWithEmailAndPassword(auth, 'lina@gymmate.test', 'Test1234!');
  const reqTx = `debug_tx_${Date.now()}`;
  await setDoc(doc(db, 'trainingRequests', reqTx), {
    senderId: uidA,
    receiverId: uidB,
    members,
    gymId: 'gym_sqy',
    sport: 'CrossFit',
    startsAt: Timestamp.fromDate(startsAt),
    endsAt: Timestamp.fromDate(endsAt),
    timeZone: 'Europe/Paris',
    message: 'debug tx',
    status: 'pending',
    createdAt: serverTimestamp(),
    respondedAt: null,
  });
  console.log('CREATE tx OK', reqTx);

  await signOut(auth);
  await signInWithEmailAndPassword(auth, 'sami@gymmate.test', 'Test1234!');

  try {
    await runTransaction(db, async (tx) => {
      const requestRef = doc(db, 'trainingRequests', reqTx);
      const requestSnap = await tx.get(requestRef);
      const request = requestSnap.data();
      const relRef = doc(db, 'relations', pid);
      const chRef = doc(db, 'chats', pid);
      const sessRef = doc(db, 'trainingSessions', reqTx);
      const relSnap = await tx.get(relRef);
      const sessSnap = await tx.get(sessRef);

      tx.update(requestRef, { status: 'accepted', respondedAt: serverTimestamp() });

      if (!relSnap.exists()) {
        tx.set(relRef, {
          members,
          gymId: request.gymId,
          sourceRequestId: reqTx,
          createdAt: serverTimestamp(),
        });
        tx.set(chRef, {
          relationId: pid,
          members,
          createdAt: serverTimestamp(),
          lastMessage: null,
          updatedAt: serverTimestamp(),
        });
      }
      if (!sessSnap.exists()) {
        tx.set(sessRef, {
          requestId: reqTx,
          relationId: pid,
          members,
          gymId: request.gymId,
          sport: request.sport,
          startsAt: request.startsAt,
          endsAt: request.endsAt,
          timeZone: request.timeZone,
          status: 'planned',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    });
    console.log('FULL TRANSACTION OK', reqTx, 'pair=', pid);
  } catch (e) {
    console.log('FULL TRANSACTION FAIL', e.code, e.message);
  }

  await signOut(auth);
}

main().catch((e) => console.error('FATAL', e));
