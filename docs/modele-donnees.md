# Modèle de données GymMate

Domaine : **CrossFit uniquement** (box, athlète, WOD, RX/Scaled, focus).

## Collections Firestore

| Collection | ID | Rôle |
|------------|----|------|
| `users` | `{uid}` Auth | Profil sportif (pas d’email/mdp) |
| `gyms` | `gym_sqy`, `gym_versailles`, `gym_paris` | Catalogue boxes (écriture console only) |
| `trainingRequests` | auto / stable | Demande de séance |
| `relations` | `{uidA}__{uidB}` (triés) | Lien après **acceptation** |
| `chats` | même `pairId` | Conversation de la relation |
| `chats/{pairId}/messages` | auto | Messages temps réel |
| `trainingSessions` | = `requestId` | Séance issue d’une acceptation |

## Règle métier centrale

Une visite de profil **ne crée aucune** relation.  
Seule l’**acceptation** d’une demande crée atomiquement : relation + chat + séance.

Parcours demande : `pending` → `rejected` (rien) | `accepted` (relation + chat + séance).

## `users/{uid}`

| Champ | Type | Notes |
|-------|------|--------|
| displayName, city | string | 2–40 / 2–60 |
| level | beginner \| intermediate \| advanced | |
| goal | string | Focus (force, metcon, gymnastique…) |
| sports | string[] | Toujours `["CrossFit"]` en V1 |
| availability | `{ day, startMinutes, endMinutes }[]` | |
| bio | string | ≤ 280 |
| gymId | string \| null | null au départ, fixe après choix |
| location | `{ lat, lng }` \| null | Bonus géoloc |
| createdAt, updatedAt | timestamp | serveur |

## `trainingRequests/{id}`

senderId, receiverId, members[], gymId, sport=`CrossFit`, startsAt, endsAt, timeZone=`Europe/Paris`, message, status (`pending`\|`accepted`\|`rejected`), createdAt, respondedAt.

## `relations/{pairId}` / `chats/{pairId}`

members (2 UID triés), gymId, sourceRequestId / relationId, createdAt.  
Chat : lastMessage, updatedAt (optionnels).

## `trainingSessions/{requestId}`

requestId, relationId, members, gymId, sport, startsAt, endsAt, timeZone, status (`planned`\|`done`\|`cancelled`).

## Droits (résumé)

- Deny by default (`firestore.rules`)
- Lecture profils : owner ou même `gymId`
- Demandes : participants seulement
- Relation / chat / messages : membres de la paire, après acceptation
- `gyms` : lecture connectée, écriture refusée côté app
