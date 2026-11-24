# Limites connues

- **Push distant** : rappels locaux uniquement (`expo-notifications`), pas FCM/APNs serveur.
- **Web** : géoloc et rappels limités / désactivés ; démo cible mobile.
- **Salle** : `gymId` choisi une fois (changement de box = hors V1).
- **Catalogue `gyms`** : créé à la main dans la console (écriture app = false).
- **Photos / Storage** : non implémenté.
- **Compte C** : à créer manuellement pour les tests T03/T10.
- **Règles** : republier `firestore.rules` après chaque évolution, sinon permission-denied.
