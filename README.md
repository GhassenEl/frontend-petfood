# PetfoodTN — Frontend

React + Vite frontend for the PetfoodTN platform: a pet-food e-commerce with three role-specific dashboards (Admin, Client, Livreur).

Backend repo: https://github.com/GhassenEl/backend-petfood

Architecture (MVC monolithe) : voir [ARCHITECTURE.md](./ARCHITECTURE.md).

**DevOps** (Docker, CI/CD, déploiement) : voir [docs/DEVOPS.md](./docs/DEVOPS.md).

## Stack

- React 18 + React Router 7
- Vite as bundler / dev server
- Tailwind CSS + custom CSS (`src/App.css`)
- Framer Motion, Lucide icons, Recharts
- MUI X DataGrid for admin tables
- Axios with JWT interceptor (`src/utils/api.js`)
- Stripe.js (optional)
- Leaflet (livreur map)

## Project layout

```
frontend Lido/                 (root of this repo)
├── public/
├── src/
│   ├── components/        # Sidebars, modals, shared UI
│   ├── contexts/          # AuthContext, ...
│   ├── pages/             # Admin*, Client*, Livreur* pages
│   ├── utils/api.js       # axios instance with JWT
│   ├── App.js, App.css    # routes + global styles
│   └── index.jsx, index.css
├── index.html
├── vite.config.js         # proxy /api → :5002, /fastapi → :8000
├── tailwind.config.js, postcss.config.js
└── package.json
```

## Setup

```bash
npm install
cp .env.example .env

# Backend must be running on :5002 (see backend-petfood repo)
# By default `npm run dev` also starts the colocated ./backend if present.

npm run dev          # vite on http://localhost:3000
```

The dev script uses `concurrently` to start Vite **and** `npm --prefix backend run dev`. If you only cloned the frontend, run just `vite --host --port 3000` or clone the backend next to it as `./backend`.

## Demo accounts

| Role    | Email                  | Password         |
|---------|------------------------|------------------|
| Admin   | admin@petfood.tn       | PetfoodTN2024!   |
| Client  | client@petfood.tn      | MonChat123!      |
| Livreur | livreur@petfood.tn     | Livreur123!      |

## Notable features

- Role-based routing in `src/App.js` with `RoleRoute` + `Admin/Client/LivreurLayout`
- Dynamic CRUD on products, orders, reviews, complaints, veterinary records
- Local SVG fallback for product images (no broken `<img>` ever)
- Vite proxy to backend (`/api`) and FastAPI (`/fastapi`) services
- JWT decode on login, stored in `localStorage`
