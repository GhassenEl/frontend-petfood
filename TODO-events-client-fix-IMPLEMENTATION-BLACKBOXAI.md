# TODO - events client fix (implementation tracking)

## Plan (approved in chat)
- Frontend: `src/pages/EventsPage.js`
  - Ensure create/update form never renders for clients: wrap CRUD form container with `isAdmin && showCreateForm` (already present in file).
  - Add a guard/effect to force `showCreateForm=false` and `editingAppointment=null` when `!isAdmin`.

## Steps
- [ ] Step 1: Verify current `EventsPage.js` has the `useEffect` guard for `!isAdmin`.
- [ ] Step 2: Add missing hard guard: if any state inconsistencies exist, also ensure closing form when `isAdmin` becomes false.
- [ ] Step 3: Run quick lint/build/test commands if available.

