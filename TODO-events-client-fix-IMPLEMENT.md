# TODO-events-client-fix-IMPLEMENT

## Étape 1 — Fix compilation/runtime dans EventsPage
- Renommer `fetchEvents` en `fetchAppointments` (ou inverse) pour que tous les appels pointent vers la même fonction.
- Corriger les appels au refresh (bouton + post-crud).
- Vérifier `useEffect` (call correct).

## Étape 2 — Corriger le mapping payload RDV
- `description` -> `notes` dans le payload des créations/mises à jour.
- Garantir que `type` est envoyé sous la forme attendue par le backend (ou fallback).

## Étape 3 — Minimiser le risque sur la partie avis
- Ne pas implémenter la liaison review-appointment tant que le backend n’est pas adapté.
- Laisser “Laisser un avis” inchangé si ça ne casse pas, ou au minimum éviter de provoquer une erreur front bloquante.

## Étape 4 — Vérification
- Relancer le front
- Tester `/client-events` : liste, création, modification, suppression (au moins sans erreurs JS).

