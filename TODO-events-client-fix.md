# TODO - Fix Evenement client (EventsPage)

## Étape 1 — Comprendre le bug (fait)
- `src/pages/EventsPage.js` utilise `events`/`setEvents` mais le rendu utilise `appointments`/`appointments.length`.
- `fetchEvents()` fait `setAppointments(...)` et appelle `fetchAppointments()` alors que ni `appointments` ni `setAppointments` ni `fetchAppointments` n’existent.

## Étape 2 — Corriger le composant
- Remplacer `events`/`setEvents` par `appointments`/`setAppointments`.
- Renommer `fetchEvents()` en `fetchAppointments()` (ou inversement) pour que les appels et les boutons correspondent.
- S’assurer que le fallback `data` alimente bien `appointments`.

## Étape 3 — Rebuild / vérifier
- Relancer le front (`npm run dev`).
- Ouvrir `/client-events` et vérifier que la liste s’affiche.
- Vérifier la console (pas d’erreurs JS).

