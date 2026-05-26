# TODO - Fix affichage des événements côté client (demo)

- [ ] Modifier `backend/controllers/veterinaryAppointments.controller.js` pour que `getMyAppointments` retourne des rendez-vous en mode démo (ne pas filtrer strictement par ownerId demo_*)
- [ ] Générer une liste de `petAppointment` en utilisant `backend/utils/demoStore.js` (createPetAppointments) ou fallback DB vide si non nécessaire
- [ ] (Optionnel) Log debug: afficher `req.user.id` et ownerId candidates
- [ ] Tester côté frontend:
  - [ ] Ouvrir `/client-events`
  - [ ] Vérifier que la liste n’est plus vide en demo
  - [ ] Vérifier que le message vide s’affiche seulement si vraiment aucun rdv

