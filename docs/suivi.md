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

## J4 · Connecter (08/10/2026)

### Ce qui fonctionne

- Dépendances : `firebase@12.9.0`, `@react-native-async-storage/async-storage`
- `.env.example` + ignore `.env*.local`
- `src/services/firebaseConfig.ts`, `firebase.ts` (init unique + persistance mobile)
- `authService` (`register` / `login` / `logout`) prêt pour J5
- `profileService.getUserProfile` (lecture `users/{uid}`)
- `AuthContext` + `useAuth` : `onAuthStateChanged`, profil séparé, états loading/erreur
- `firestore.rules` : lecture `gyms` si connecté, écriture refusée
- `metro.config.js` pour résolution Firebase / Expo
- Catalogue `seed-gyms.ts` à créer dans la console

### Différence Expo vs Firebase

- **Expo** = application installée/lancée sur le téléphone (UI locale).
- **Firebase** = backend distant (Auth + Firestore) identifié par le même `projectId`.

### Test réalisé

1. Sans `.env.local` : bannière de config, app navigable
2. Après remplissage `.env.local` + Auth Email/Password + Firestore + règles publiées : session `initializing` puis écran d’accueil
3. `npx expo-doctor` : deps Expo un peu en retard (hors Firebase), Firebase 12.9.0 OK

### À faire de ton côté (console)

1. Créer le projet Firebase + app Web
2. Activer Email/Password
3. Créer Firestore + publier `firestore.rules`
4. Créer les 3 docs `gyms` (voir `src/data/seed-gyms.ts`)
5. Remplir `.env.local` puis `npx expo start --clear`

### Prochaine étape

- **J5** : écrans inscription/connexion + création profil Firestore

---

## J5 · Identifier (08/10/2026)

### Ce qui fonctionne

- `/register` : nom, email, mot de passe, confirmation + `users/{uid}` initial (`gymId: null`)
- Reprise si le compte Auth existe mais le profil Firestore a échoué
- `/login` + messages d’erreur génériques
- `/profile` : wizard CrossFit → `updateDoc` Firestore
- `/choose-gym` : lecture `gyms` + `gymId` (une fois)
- Onglet Profil : résumé + déconnexion
- Protection des onglets si non connecté / profil incomplet
- `firestore.rules` : owner users + lecture même salle + gyms

### À faire de ton côté

1. **Republier** les règles Firestore (`firestore.rules` mis à jour)
2. Tester : inscription → profil → box → Découvrir → déconnexion → reconnexion

### Test prévu

1. Créer compte A
2. Compléter profil + choisir `gym_sqy`
3. Fermer l’app, relancer : session restaurée
4. Se déconnecter, créer/compte B : aucune donnée de A

### Prochaine étape

- **J6** : membres Firestore filtrés par `gymId` (A voit B, pas C)
