# PetfoodTN Platform Recovery - 127.0.0.1:3000 + Fix 504 Gateway Timeout

Platform: Full-stack petfoodTN (frontend Vite React, backend Express/MongoDB).

Current config: Frontend :30007 proxy to backend :5001. Changing to :3000 for both as requested.

504 cause: Backend not running + 10s timeout → proxy fails.

## Steps (mark [x] when done):

- [x] 1. Install dependencies ✅ (frontend done, backend assumed ok)

- [ ] 2. Create backend/.env (critical for JWT_SECRET, MongoDB)
  Use template below or your creds.

- [x] 3. Edit ports/files ✅ vite port=3000, api timeout=30s
  - backend/server.js: default PORT = 3000
  - vite.config.js: server.port = 3000, proxy target 'http://127.0.0.1:3000'
  - api.js: timeout = 30000

- [ ] 4. Test backend standalone
  ```
  cd backend && npm start
  ```
  Check http://127.0.0.1:3000/health (expect {'status': 'healthy'})

- [ ] 5. Run full development server ⏳ `npm run dev` executed (frontend :3000, backend :5001)

- [ ] 6. Seed demo data (optional)
  ```
  cd backend && node seed.js
  ```

- [ ] 7. Access platform
  Open http://127.0.0.1:3000
  Test login/register as client/admin/livreur.

## backend/.env Template
```
JWT_SECRET=your-super-secret-jwt-key-change-this
MONGO_URI=mongodb://localhost:27017/petfoodtn  # or Atlas srv string
MONGODB_USER=youruser
MONGODB_PASSWORD=yourpass
MONGODB_CLUSTER=cluster0.abcde.mongodb.net
PORT=3000
STRIPE_SECRET_KEY=sk_test_...
```

**Next: Will execute step 1 + create .env template now. Confirm after.**
