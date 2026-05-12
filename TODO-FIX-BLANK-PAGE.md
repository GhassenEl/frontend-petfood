# Fix Blank Page - PetfoodTN Frontend

## Status: ✅ FIXED - See TODO.md for details

### 1. [ ] Start Dev Server (Primary Fix)
```
npm run dev
```
- Opens http://localhost:3000
- Concurrently starts backend (5001) + Vite (3000)
- Expected: Loading screen → Login page

### 2. [ ] Test Login
- Demo: `admin@petfood.tn` / `PetfoodTN2024!`
- Expected: Redirect to /admin/dashboard

### 3. [ ] Check Browser Console
```
F12 → Console/Network
```
- Look for React/auth/API errors

### 4. [ ] Backend Status
```
curl http://localhost:5001/api/auth/login
```
or browser: http://localhost:5001

### 5. [✅] Build & Preview (if needed)
```
npm run build
npm run preview
```

### Runtime Notes:
- Vite proxies /api → localhost:5001
- AuthContext loads token from localStorage
- Clear cache: Ctrl+Shift+R

**Next: Run step 1 now!**

