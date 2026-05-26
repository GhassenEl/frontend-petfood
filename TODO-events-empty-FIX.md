# TODO-events-empty-FIX

- [ ] Update backend `getMyAppointments` to be resilient to auth id mismatches (ownerId from `req.user.id` OR `_id` OR `userId`).
- [ ] Add temporary debug logs inside `getMyAppointments` to verify ownerId and matched count.
- [ ] Run backend seed + restart.
- [ ] Verify `GET /client-events` (frontend `EventsPage`) returns non-empty.
- [ ] Verify `GET /admin/events` returns non-empty.
- [ ] Remove/adjust debug logs if needed.

