# TODO - Events creation (EventsPage)

- [ ] Mettre à jour `src/pages/EventsPage.js` pour afficher un formulaire “Ajouter un événement”.
- [ ] Ajouter un handler `handleCreateAppointment` qui fait `api.post('/veterinary/appointments', payload)`.
- [ ] Mapper les catégories utilisateur vers `type` (ex: `autre`, `anniversiare`, `competitions`, `salle de sport`, `coiffure`).
- [ ] Forcer `animalType = 'other'` et utiliser `petName` comme nom saisi.
- [ ] Après création, rafraîchir la liste via `GET /veterinary/appointments`.
- [ ] Gérer `createLoading/createError/createSuccess` dans l’UI.

