# Suivi GymMate

## J1 · Démarrer (17/09/2026)

### Ce qui fonctionne

- Écran d’accueil **GymMate** centré **CrossFit** + bouton **Découvrir**
- Liste locale de 3 athlètes CrossFit (`FlatList`) via `MemberCard`
- Route de détail `/member/[userId]` avec retour stack natif
- Données fictives dans `src/data/mock-members.ts` (pas de Firebase)

### Décision produit

- Périmètre limité au **CrossFit** (boxes / WOD / focus), pas multi-sports.

### Test réalisé

1. Lancer `npx expo start`
2. Accueil → **Découvrir** → cartes Sami / Amine / Lina
3. Ouvrir un profil → vérifier les infos → bouton Retour

### Difficulté rencontrée

- Le `_layout` du template affichait directement `HomeScreen` au lieu d’un `Stack` Expo Router : corrigé pour permettre la navigation.

### Prochaine étape

- **J2** : formulaire profil local, `PrimaryButton`, `EmptyState`, états de chargement simulés

---

## J2 · Interagir (08/10/2026)

### Ce qui fonctionne

- Composants `PrimaryButton` (anti double-appui + loading) et `EmptyState`
- Écran **Mon profil** (`/profile`) : formulaire CrossFit local (`useState`) avec validation
- Champs : nom, ville, niveau, focus, disponibilité (jour + créneau), bio
- Sport fixe **CrossFit** ; enregistrement simulé (délai) + message de succès
- Découvrir : états **loading / vide / erreur / succès** + chips de démo
- `KeyboardAvoidingView` sur le formulaire pour ne pas masquer la validation

### Test réalisé

1. Accueil → **Créer mon profil** → erreurs si champs vides → enregistrement OK
2. Découvrir → chip **Vide** / **Erreur** / **Liste**
3. Découvrir → **Mon profil CrossFit** → retour stack

### Difficulté rencontrée

- Garder le formulaire pédagogique (local) tout en alignant les champs sur le PDF (p. 19), adaptés CrossFit.

### Prochaine étape

- **J3** : onglets Expo Router + parcours cliquable complet (params, retour)

---

## J3 · Naviguer (08/10/2026)

### Ce qui fonctionne

- Navigation racine Stack : accueil, onglets, détail membre, proposition WOD, 404
- Onglets Expo Router : Découvrir, Demandes, Séances, Messages, Profil
- Params `userId` sur `/member/[userId]` et `/request/[userId]`
- Écrans Demandes / Séances / Messages en placeholder local (`EmptyState`)
- Parcours : Accueil → onglets → détail → Proposer un WOD → Retour
- Route inexistante via `+not-found`

### Test réalisé

1. Accueil → Découvrir → carte → profil athlète → Retour
2. Accueil → Créer mon profil (onglet Profil)
3. Basculer entre les 5 onglets
4. Proposer un WOD (formulaire local simulé)
5. Ouvrir une route inventée → écran Introuvable

### Difficulté rencontrée

- Réorganiser les fichiers dans `(tabs)/` sans casser les liens de l’accueil.

### Prochaine étape

- **J4** : config Firebase (`firebase.ts`), AuthContext, services (pas encore d’auth complète)

---

## J4 · Connecter (code prêt — 23/11/2026)

### Ce qui fonctionne (dans le dépôt)

- Dépendances : `firebase@12.9.0`, `@react-native-async-storage/async-storage`
- `.env.example` + `.env.local` (à remplir) + ignore Git `.env*.local`
- `src/services/firebaseConfig.ts` + `firebase.ts` (init unique + persistance Auth mobile)
- `authService` : `register` / `login` / `logout`
- `profileService.getUserProfile` (lecture `users/{uid}`)
- `AuthContext` + `useAuth` : `onAuthStateChanged`, profil séparé, loading/erreur
- `metro.config.js` pour Firebase + Expo
- Bannière si Firebase non configuré

### Différence Expo vs Firebase

- **Expo** = app sur ton téléphone / émulateur (UI).
- **Firebase** = backend distant (Auth + Firestore), identifié par le même `projectId`.

### Prochaine étape côté code

- Déjà enchaîné en **J5** (voir ci-dessous).

---

## J5 · Identifier (code prêt — 23/11/2026)

### Ce qui fonctionne (dans le dépôt)

- `/register` : nom, email, mot de passe, confirmation → Auth + `users/{uid}` (`gymId: null`)
- Reprise si le compte Auth existe mais le profil Firestore a échoué
- `/login` + erreurs génériques
- `/profile` : wizard CrossFit → `updateDoc` Firestore
- `/choose-gym` : lecture `gyms` + set `gymId` (une fois)
- Onglet Profil : résumé + déconnexion
- Protection des routes si non connecté / profil incomplet
- `firestore.rules` : owner `users`, lecture même salle, `gyms` lecture-only

### À FAIRE DE TON CÔTÉ (console Firebase) — obligatoire

Sans ces étapes, l’app affiche la bannière « Firebase non configuré » et Auth ne marchera pas.

1. **Créer le projet** → [console.firebase.google.com](https://console.firebase.google.com)  
   Nom ex. `gymmate-…` · Analytics optionnel · noter le **Project ID**
2. **Ajouter une app Web** `</>` (pas iOS/Android) → nom ex. `gymmate-mobile-js`  
   Copier `apiKey`, `authDomain`, `projectId`, `appId`
3. **Remplir `.env.local`** à la racine (fichier déjà créé) :

   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   ```

4. **Authentication** → Méthodes de connexion → activer **Email/Password**
5. **Firestore Database** → Créer la base (mode production / règles fermées)  
   Localisation : noter celle choisie (ex. `eur3`)
6. **Publier les règles** : coller le contenu de `firestore.rules` dans l’onglet Règles → Publier
7. **Créer 3 docs** dans la collection `gyms` (IDs exacts) — voir `src/data/seed-gyms.ts` :

   | ID doc | Champs |
   |--------|--------|
   | `gym_sqy` | `name`, `city`, `address` |
   | `gym_versailles` | idem |
   | `gym_paris` | idem |

8. Attendre la fin de `npm i`, puis :

   ```bash
   npx expo start --clear
   ```

### Test à faire après config

1. Inscription compte A → compléter profil → choisir `gym_sqy`
2. Fermer / relancer l’app → session restaurée
3. Se déconnecter → créer compte B → aucune donnée de A
4. Console Auth : 2 users · Firestore : 2 docs `users/{uid}` avec le même UID

### Prochaine étape

- ~~**J6**~~ → voir sections suivantes (implémenté)

---

## J6 · Découvrir (23/11/2026)

### Ce qui fonctionne

- `memberService.listGymMembers(gymId)` : filtre Firestore `gymId`, exclusion du uid courant
- Découvrir branché Firestore + états loading / vide / erreur
- Filtres focus, niveau, recherche + **bonus géoloc** (distance Haversine)
- `expo-location` + bouton « Partager ma position » (Découvrir / Profil)
- Détail membre via `getUserProfile`

### Test

1. Lina (`gym_sqy`) voit Sami, pas un compte d’une autre box
2. Sans position : filtre distance désactivé avec message
3. Avec positions partagées : chips &lt;2 / &lt;5 / &lt;10 km

---

## J7 · Demander (23/11/2026)

### Ce qui fonctionne

- `requestService` : envoi, listes reçues/envoyées, refus
- Formulaire `/request/[userId]` → `trainingRequests` (CrossFit, créneau futur)
- Onglet Demandes : Reçues / Envoyées + badges

---

## J8 · Relier (23/11/2026)

### Ce qui fonctionne

- `acceptRequest` en `runTransaction` : accepted + relation + chat + séance
- Refus : statut only, pas de chat
- Onglet Séances : À venir / Historique, annuler, marquer terminée

---

## J9 · Échanger (23/11/2026)

### Ce qui fonctionne

- Liste conversations (`chats` array-contains)
- `/chat/[chatId]` : `onSnapshot` 50 messages, envoi 1–1000 chars
- Accès refusé sans relation

### À faire de ton côté

1. **Republier** `firestore.rules` dans la console
2. Créer les 3 docs `gyms` si absents (`src/data/seed-gyms.ts`)
3. Tester A↔B : demande → acceptation → chat live

### Comptes test

- `lina@gymmate.test` / `Test1234!`
- `sami@gymmate.test` / `Test1234!`

### Prochaine étape

- **J10** : tests docs, README final, démo complète
