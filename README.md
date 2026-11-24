# GymMate

Application **React Native (Expo SDK 57) + TypeScript + Firebase** pour trouver un partenaire CrossFit dans la même box, proposer un WOD, puis chatter **après acceptation**.

## Fonctionnalités (J1→J9 + bonus)

- Compte email/mot de passe, profil CrossFit, choix de box
- Découvrir les athlètes de la même salle (filtres focus / niveau / recherche)
- Demandes d’entraînement, acceptation / refus
- Relation + séance + chat créés **atomiquement** à l’acceptation
- Messages temps réel (`onSnapshot`)
- Bonus : géolocalisation (filtre distance), rappels locaux de séance

## Stack

| Élément | Version |
|---------|---------|
| Expo | ~57 |
| React Native | 0.86 |
| Firebase JS | 12.9 |
| Expo Router | file-based |

## Installation

```bash
npm install
cp .env.example .env.local
# Remplir les 4 EXPO_PUBLIC_FIREBASE_*
npx expo start --clear
```

## Configuration Firebase

1. Projet Firebase + application **Web**
2. Authentication → **Email/Password**
3. Firestore → publier le contenu de [`firestore.rules`](firestore.rules)
4. (Optionnel) indexes : [`firestore.indexes.json`](firestore.indexes.json)
5. Créer la collection `gyms` avec les 3 documents de [`src/data/seed-gyms.ts`](src/data/seed-gyms.ts)

Variables `.env.local` :

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

## Comptes de test

| Compte | Email | Mot de passe | Box |
|--------|-------|--------------|-----|
| A Lina | `lina@gymmate.test` | `Test1234!` | `gym_sqy` |
| B Sami | `sami@gymmate.test` | `Test1234!` | `gym_sqy` |

Créer un compte **C** sur `gym_paris` pour les tests de filtrage / droits.

## Démo recommandée (2 comptes)

1. Connexion A → Découvrir → profil B → Proposer un WOD  
2. Connexion B → Demandes → Accepter  
3. Vérifier Séances + Messages (échange live)  
4. (Optionnel) Refus d’une demande : pas de nouveau chat  

## Architecture

```
src/app/          écrans (Expo Router)
src/components/   UI (MemberCard, PrimaryButton, EmptyState…)
src/contexts/     AuthContext
src/services/     Firebase uniquement ici
src/types/        types métier
src/utils/        validation, dates, pairId, géo
```

## Documentation

| Fichier | Contenu |
|---------|---------|
| [`docs/suivi.md`](docs/suivi.md) | Progression des jalons |
| [`docs/modele-donnees.md`](docs/modele-donnees.md) | Collections Firestore |
| [`docs/tests.md`](docs/tests.md) | Recette T01–T12 |
| [`docs/limites.md`](docs/limites.md) | Limites connues |

## Règle métier clé

Une visite de profil **ne crée pas** de relation.  
Seule l’**acceptation** crée relation + séance + chat (transaction).
