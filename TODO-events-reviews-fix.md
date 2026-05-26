# TODO - Fix reviews for EventsPage

## Step 1 — Implement backend mapping for event reviews (preferred)
- Update `backend/controllers/review.controller.js`
- If `req.body.type === 'event'`, treat `req.body.productId` as a `PetAppointment.id`
- Create/find a dedicated “event product” to satisfy the Prisma `Review.productId -> Product.id` FK.
  - Add a deterministic Product naming scheme (e.g., `Event#<appointmentId>`) or a stable shared product (e.g., `Event Reviews`), based on desired UX.
  - Then store the review using that product id.

## Step 2 — Update EventsPage payload
- Keep `productId` as appointment id.
- Ensure frontend sends `type: 'event'` so backend knows it’s not a real product.

## Step 3 — Verification
- Client: open `/client-events`, submit an event review.
- Backend: ensure the request returns 201 and review appears in `/api/reviews`.

## Step 4 — Optional analytics/UX followups
- If you want event reviews visible in product review pages, add a filter or UI note.

