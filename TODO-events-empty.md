# TODO - fix « evenemt il est vide » (EventsPage)

## Information observée
- `src/pages/EventsPage.js` charge `GET /veterinary/appointments` puis normalise en array.
- UI affiche « Aucun rendez-vous pour le moment. » si `appointments.length === 0`.
- Backend `getMyAppointments` renvoie `prisma.petAppointment.findMany({ where: { ownerId }, orderBy: { date: 'asc' } })`.
- En `seed.js`, les rendez-vous sont créés avec `ownerId: clientUser.id`.

## Hypothèse probable
- Pour le rôle admin/client, `req.user.id` (ou `req.user._id`) ne correspond pas au `ownerId` enregistré dans `petAppointment` (ex: admin n’a pas de rendez-vous seed, ou mauvais mapping auth).
- Ou bien en mode demo, la route renvoie vide car `ownerId` est absent dans `req.user`.

## Plan de correction (à implémenter)
1. Vérifier dans `backend/middleware/auth.js` comment `req.user` est construit (id vs _id vs autre champ).
2. Vérifier si `ownerId` dans `petAppointment` correspond à `req.user.id` ou à `req.user._id`.
3. Ajuster `getMyAppointments` pour supporter les deux formes et/ou pour utiliser correctement l’identifiant Prisma (`id`).
4. Optionnel: en seed, dupliquer aussi des rendez-vous pour un admin (ou rendre l’admin route renvoie tous les rendez-vous clients).
5. Ajouter un log backend (temporaire) sur `req.user` et `ownerId` pour diagnostiquer.
6. Rebuild/test :
   - Seeder (seed backend)
   - Redémarrer backend
   - Ouvrir `/client-events` et `/admin/events`.

## Suivi
- Mettre à jour ce fichier après chaque étape terminée.
