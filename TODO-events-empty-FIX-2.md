# TODO - Fix « events empty » (version 2)

## Objectif
Empêcher la page `EventsPage` de retourner vide pour les clients de démo.

## Constat
- `getMyAppointments` côté backend filtre par `ownerId`.
- `seed.js` créait les `petAppointment` uniquement pour un seul `clientUser` (`clientUser.id`).
- Résultat : si l’utilisateur connecté est un autre client (ex: `client@petfood.tn` vs autre seed), alors `GET /veterinary/appointments` renvoie `[]`.

## Correction appliquée
- `backend/seed.js` : création des `petAppointment` pour **tous** les clients (`clientUsers`) au lieu d’un seul.
- Pour chaque client : `count: 20`.

## Prochaines étapes de test
1. Redémarrer le backend (arrêter + lancer `node backend/server.js` ou `npm start` selon ton script).
2. Re-seed si nécessaire (selon comment tu lances seed).
3. Se connecter en `client@petfood.tn`.
4. Aller sur la page `Events` : vérifier qu’on voit au moins 1 rendez-vous.
5. (Optionnel) Tester un 2e client démo si présent.

