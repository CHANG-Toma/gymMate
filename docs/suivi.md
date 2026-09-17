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
