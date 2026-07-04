# Cahier des charges — PetfoodTN

| | |
|---|---|
| **Étudiant** | El Jezi Ghassen |
| **Encadrante académique** | Mme Hend Ben Moussa |
| **Encadrant entreprise** | Neffati Ahmed |
| **Année universitaire** | 2025–2026 |
| **Version** | 1.0 |
| **Date** | juin 2026 |

**Projet :** Plateforme e-commerce & santé animale — Projet de Fin d'Études (PFE)  
**Marché cible :** Tunisie — propriétaires d'animaux, professionnels vétérinaires, vendeurs, livreurs  

---

## 1. Contexte et justification

### 1.1 Contexte

Le marché tunisien de l'alimentation et des soins pour animaux de compagnie reste largement fragmenté : boutiques physiques, conseils vétérinaires peu digitalisés, peu de traçabilité sur la qualité des croquettes stockées à domicile, et absence d'une plateforme unifiée reliant **achat en ligne**, **suivi santé**, **IoT domestique** et **pilotage professionnel**.

**PetfoodTN** répond à ce besoin en proposant une plateforme web et mobile full-stack, déployable en production, qui couvre l'ensemble de la chaîne de valeur : du client final au vétérinaire, en passant par le vendeur marketplace, le livreur et l'administrateur.

### 1.2 Problématique

- Comment centraliser boutique, nutrition personnalisée, rendez-vous vétérinaires et suivi IoT dans une seule expérience utilisateur ?
- Comment garantir la **sécurité des données de santé animale** (RBAC, audit, HTTPS) tout en offrant des tableaux de bord temps réel (BI, Grafana) ?
- Comment industrialiser le déploiement (Docker, CI/CD, monitoring) pour un contexte PFE proche de la production ?

### 1.3 Positionnement

PetfoodTN n'est pas une simple boutique en ligne : c'est une **plateforme multi-acteurs** intégrant intelligence artificielle, machine learning, IoT embarqué (ESP32), business intelligence et DevOps.

---

## 2. Objectifs du projet

### 2.1 Objectif général

Concevoir, développer et déployer une plateforme numérique complète pour le bien-être animal en Tunisie, démontrant une architecture logicielle moderne, sécurisée et observable.

### 2.2 Objectifs spécifiques

| # | Objectif | Indicateur de réussite |
|---|--------|------------------------|
| O1 | Marketplace multi-espèces (chien, chat, oiseau, NAC…) | Catalogue produits, commandes, paiement, factures PDF |
| O2 | Parcours vétérinaire clinique | Dossiers médicaux, RDV, ordonnances, hub intelligence vet |
| O3 | IoT PetFoodIoT | Distributeur, ESP32-CAM, alertes qualité, MQTT |
| O4 | IA & ML | Recommandations nutrition, prévisions ventes, NLP avis, FastAPI clinique |
| O5 | BI & décisionnel | Segmentation clients, stocks prédictifs, Power BI, audience live |
| O6 | Sécurité production | JWT HttpOnly, CSP nginx, audit accès dossiers vet, seeds protégés |
| O7 | DevOps & déploiement | Docker Compose, CI/CD GitHub Actions, Prometheus/Grafana |

---

## 3. Périmètre et acteurs

### 3.1 Acteurs du système

| Acteur | Rôle | Espace applicatif |
|--------|------|-------------------|
| **Visiteur** | Découverte, marketing, inscription | `/`, `/marketing` |
| **Client** | Achat, nutrition, IoT, RDV vet, assistant IA | `/client-*`, `/veterinary` |
| **Vétérinaire** | Consultations, dossiers, prescriptions, BI clinique | `/vet/*` |
| **Vendeur** | Marketplace, catalogue, commandes, stats | `/vendor/*` |
| **Livreur** | Tournées, GPS, preuves de livraison | `/livreur/*` |
| **Modérateur** | Avis, signalements, événements | `/moderator/*` |
| **Admin / stock_manager** | Pilotage global, BI, sécurité, DevOps | `/admin/*` |

### 3.2 Périmètre inclus (IN)

- Application web React (Vite) responsive + PWA partielle
- API REST monolithique Node.js/Express + Prisma
- Service ML FastAPI (recommandations, analyse clinique)
- Application mobile Flutter (companion)
- Firmware / simulateur ESP32 (distributeur, caméra qualité)
- Stack Docker (frontend nginx, backend, PostgreSQL, ML, MQTT, monitoring)
- Pipelines CI/CD et dashboards Grafana provisionnés depuis Git
- Mode données **live** en production (`VITE_STRICT_LIVE`, seeds protégés)

### 3.3 Périmètre exclu (OUT)

- Application native iOS/Android store (hors Flutter web)
- Paiement réel Stripe en production sans configuration marchand validée
- Déploiement multi-région haute disponibilité (un VPS / ECS suffit pour le PFE)
- Certification ISO formelle (référentiel documenté, non audité par organisme tiers)

---

## 4. Exigences fonctionnelles

### 4.1 Module e-commerce & marketplace

| ID | Exigence | Priorité |
|----|----------|----------|
| EF-01 | CRUD produits avec catégories, stock et images | Must |
| EF-02 | Panier, commande, statuts (en attente, expédiée, livrée…) | Must |
| EF-03 | Factures PDF et historique commandes client | Must |
| EF-04 | Programme fidélité et codes promo | Should |
| EF-05 | Validation admin des vendeurs marketplace | Must |
| EF-06 | Paiement Stripe (mode mock + live configurable) | Should |

### 4.2 Module nutrition & multi-espèces

| ID | Exigence | Priorité |
|----|----------|----------|
| EF-10 | Calcul calories / besoins (RER/MER) par animal | Must |
| EF-11 | Profils adaptatifs (race, poids, activité, âge) — 8 espèces | Must |
| EF-12 | Recommandations ML croquettes et plans nutrition | Should |
| EF-13 | Agent nutrition IA (Groq / règles métier) | Should |

### 4.3 Module vétérinaire

| ID | Exigence | Priorité |
|----|----------|----------|
| EF-20 | Prise de RDV et disponibilités vétérinaires | Must |
| EF-21 | Dossiers médicaux (diagnostic, traitement, vaccins) | Must |
| EF-22 | Ordonnances et consultations historisées | Must |
| EF-23 | Hub intelligence vet (patients, urgences, ML clinique) | Should |
| EF-24 | Journal d'audit des accès aux dossiers (`vet_clinical_access`) | Must |

### 4.4 Module IoT — PetFoodIoT

| ID | Exigence | Priorité |
|----|----------|----------|
| EF-30 | Ingestion télémétrie distributeur / fontaine / capteurs | Must |
| EF-31 | ESP32-CAM : analyse qualité alimentaire (score, moisissure) | Must |
| EF-32 | Alertes seuils (température, humidité, qualité < 50 %) | Must |
| EF-33 | Broker MQTT Mosquitto + topics `petfood/*` | Should |
| EF-34 | Panneau admin anomalies IoT et validation ML | Must |

### 4.5 Module livraison & logistique

| ID | Exigence | Priorité |
|----|----------|----------|
| EF-40 | Espace livreur : tournées, statuts, stats temps réel | Must |
| EF-41 | Suivi GPS / ETA (Google Maps / Leaflet) | Should |
| EF-42 | Points relais et partenaires (refuges, animaleries) | Could |

### 4.6 Module communauté & modération

| ID | Exigence | Priorité |
|----|----------|----------|
| EF-50 | Avis produits et services (1–5★, NLP sentiments) | Must |
| EF-51 | Signalements et modération contenus | Must |
| EF-52 | Événements et adoption (refuges partenaires) | Could |

### 4.7 Module administration & BI

| ID | Exigence | Priorité |
|----|----------|----------|
| EF-60 | Dashboard admin KPIs (CA, commandes, audience live) | Must |
| EF-61 | Hub Business Intelligence (segmentation, tendances, stocks prédictifs) | Must |
| EF-62 | Exports CSV/PDF — Power BI Desktop | Should |
| EF-63 | Audience temps réel (présence Socket.IO, par rôle/région) | Should |
| EF-64 | Hub DevOps (CI/CD, déploiements, runbooks, Grafana) | Should |
| EF-65 | Rapports automatiques multi-domaines (ventes, IoT, vet) | Should |

### 4.8 Module marketing digital

| ID | Exigence | Priorité |
|----|----------|----------|
| EF-75 | Hub marketing digital admin (`/admin/digital-marketing`) | Must |
| EF-76 | KPIs acquisition : impressions, CTR, conversions, ROAS, newsletter | Must |
| EF-77 | Campagnes IA par segment client (email, push, social, SMS) | Should |
| EF-78 | Entonnoir de conversion et trafic par canal (7 jours) | Should |
| EF-79 | Calendrier social + score SEO + mots-clés marché tunisien | Should |
| EF-80 | Newsletter publique (landing `/`) + liste admin abonnés | Must |
| EF-81 | **Lien audience live** — sessions connectées pour ciblage campagnes | Should |
| EF-82 | **Lien BI** — segmentation, Power BI, snapshot plateforme (vet, IoT) | Should |
| EF-83 | Intégrations documentées : Meta Ads, Google Analytics, SMTP | Could |

**Routes :** `GET /admin/marketing/pack`, `POST /marketing/newsletter`, `GET /admin/marketing/newsletter`  
**Services frontend :** `digitalMarketingService.js`, `marketingLiveEnrichment.js` (audience + analytics + BI)  
**Pages liées :** `/admin/live-audience`, `/admin/business-intelligence`, `/admin/promotions`, `/commercial`

### 4.9 Module IA & ML

| ID | Exigence | Priorité |
|----|----------|----------|
| EF-70 | FastAPI : santé, recommandations, pack vet ML | Must |
| EF-71 | Routes `/fastapi/*` protégées JWT (sauf `/health`) | Must |
| EF-72 | Prévision ventes, détection anomalies commandes/IoT | Should |
| EF-73 | Chatbot NLP client (symptômes, orientation vet) | Should |

---

## 5. Exigences non fonctionnelles

### 5.1 Sécurité

| ID | Exigence | Implémentation |
|----|----------|----------------|
| ENF-01 | Authentification JWT | Cookies **HttpOnly** + `Secure` en HTTPS prod |
| ENF-02 | RBAC strict par rôle | Middleware `auth`, `adminAuth`, `vetAuth` |
| ENF-03 | Protection XSS / clickjacking | CSP, `X-Frame-Options`, échappement client |
| ENF-04 | CSRF | SameSite cookies, validation origine |
| ENF-05 | Pas de comptes démo en prod | Seeds bloqués (`SEED_SECRET`), mots de passe forts |
| ENF-06 | Audit données sensibles | Logs accès dossiers vet, activity logs admin |
| ENF-07 | Chiffrement transport | HTTPS via Caddy / Let's Encrypt |

### 5.2 Performance & disponibilité

| ID | Exigence | Cible |
|----|----------|-------|
| ENF-10 | Temps réponse API `/health` | < 500 ms (environnement Docker local) |
| ENF-11 | Disponibilité surveillée | Workflow uptime 15 min + blackbox Prometheus |
| ENF-12 | Données live sans fallback démo silencieux | `VITE_STRICT_LIVE=true` en production |

### 5.3 Maintenabilité & déploiement

| ID | Exigence | Détail |
|----|----------|--------|
| ENF-20 | Conteneurisation | `docker-compose.yml` + overlays (ml, iot, monitoring, prod) |
| ENF-21 | CI/CD | `platform-pipeline.yml` : build, sécurité, ECR, ECS/VPS |
| ENF-22 | Observabilité | Prometheus, Grafana, metrics-exporter métier |
| ENF-23 | Sauvegardes | `pg_dump` nocturne chiffré (workflow GitHub) |
| ENF-24 | Dashboards as code | JSON Grafana versionnés + `provision-dashboards.mjs` |

### 5.4 Ergonomie & accessibilité

- Interface en **français** (arabe / anglais partiels sur chatbot)
- Navigation responsive + barre mobile basse
- Media queries — **pas de mélange Tailwind + styles inline incohérents** (convention projet)

### 5.5 Conformité & données personnelles

- Consentement cookies pour analytics / audience live
- Chemins sensibles masqués côté client dans les sessions live
- Documentation conformité : `/compliance` (référentiel ISO / environnement)

---

## 6. Architecture technique cible

```
┌─────────────────────────────────────────────────────────────────┐
│  Clients : React (Vite) · Flutter mobile · ESP32 / MQTT         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────▼────────────────────────────────────┐
│  nginx / Caddy — reverse proxy, CSP, /api, /socket.io, /fastapi │
└─────┬──────────────────┬──────────────────┬─────────────────────┘
      │                  │                  │
┌─────▼─────┐    ┌───────▼───────┐   ┌──────▼──────┐
│ Express   │    │ FastAPI ML    │   │ Mosquitto   │
│ :5002     │    │ :8000         │   │ MQTT        │
│ Prisma    │    │ JWT vet       │   │             │
│ Socket.IO │    │               │   │             │
└─────┬─────┘    └───────────────┘   └─────────────┘
      │
┌─────▼─────────────┐     ┌──────────────────────────┐
│ PostgreSQL        │     │ Prometheus + Grafana      │
│ (prod Docker)     │     │ metrics-exporter BI       │
└───────────────────┘     └──────────────────────────┘
```

### 6.1 Stack détaillée

| Couche | Technologies |
|--------|--------------|
| Frontend | React 18, Vite, React Router 7, Recharts, Socket.IO client, Leaflet |
| Backend | Node.js, Express, Prisma, JWT, Socket.IO |
| Base de données | PostgreSQL (prod) / SQLite (dev) |
| ML | Python FastAPI, modèles recommandation & clinique |
| IoT | ESP32, MQTT, simulateur Node.js |
| Mobile | Flutter (Dart) |
| Infra | Docker Compose, nginx, Caddy, GHCR, AWS ECS, VPS SSH |
| Monitoring | Prometheus, Grafana, node-exporter, cAdvisor, blackbox |
| CI/CD | GitHub Actions (CI, DevSecOps, E2E, deploy) |

### 6.2 Principes d'architecture backend

- **Monolithe API** unique (`server.js`) — pas de microservices actifs en prod
- Pattern **Routes → Controllers → Services → Repositories → Prisma**
- API versionnée `/api/v1/` (convention cible)
- Réponses JSON homogènes

### 6.3 Application mobile Flutter ↔ API backend

L'application **Flutter** (`mobile_app/`) consomme la **même API REST** que le frontend React. Il n'existe pas de backend Dart séparé : le mobile est un **client HTTP** du monolithe Node.js.

| Élément | Détail |
|---------|--------|
| **Dossier** | `mobile_app/` — Flutter 3.11+, Dart |
| **Client HTTP** | `lib/services/api_client.dart` — `GET` / `POST` / `DELETE` + JSON |
| **Auth** | `POST /api/auth/login` → JWT stocké (`SharedPreferences`) + header `Authorization: Bearer` |
| **Profil** | `GET /api/users/profile` au démarrage si token valide |
| **URL configurable** | Écran login + `ApiConfig.setBaseUrl()` — émulateur Android `10.0.2.2:5002` |
| **Mode démo** | Données locales si backend indisponible (IoT, BI, sécurité) |

**Endpoints backend consommés par le mobile :**

| Domaine | Routes API |
|---------|------------|
| Auth & profil | `/auth/login`, `/users/profile` |
| Animaux | `/pets` (CRUD) |
| Produits | `/products`, `/products/recommendations/pets` |
| Commandes / livraison | `/orders` |
| Distributeur IoT | `/feeder`, `/feeder/:id/dispense`, nutrition-plan, schedules |
| **Pack IoT unifié** | `/client/iot/pack` — devices, scores, alertes (aligné web) |
| **Commandes IoT** | `/client/iot/commands`, `/client/iot/automations/:id` (PATCH) |
| Qualité alimentaire | `/client/iot/food-quality`, `/client/iot/food-quality/reading` |
| Eau / hydratation | `/ecosystem/water-monitor/*` |
| Dashboard client BI | `/client/dashboard` |
| Sécurité | `/security/status`, `/security/threats`, `/security/sessions` |

**Lancement :**

```bash
# Terminal 1 — backend (port 5002)
cd backend && npm run dev

# Terminal 2 — Flutter
cd mobile_app && flutter pub get && flutter run
```

**Production :** pointer l'URL vers `https://votredomaine.tn/api` (sans proxy Vite). CORS backend doit autoriser l'origine mobile si requêtes cross-origin (appareil → serveur).

**Écart sécurité connu :** le web admin utilise des cookies **HttpOnly** en prod ; le mobile conserve le JWT en `SharedPreferences` (standard mobile). Prévoir rotation token + stockage sécurisé (Keychain/Keystore) en évolution.

**Liaison IoT (alignée web React) :**

| Couche | Fichier Flutter | API |
|--------|-----------------|-----|
| Pack écosystème | `lib/services/iot_pack_service.dart` | `GET /client/iot/pack` |
| Hub IoT UI | `lib/screens/iot_hub_screen.dart` + `widgets/iot_ecosystem_panel.dart` | Agrège pack + feeder + eau |
| ESP32-CAM | `lib/services/food_quality_repository.dart` | `GET/POST /client/iot/food-quality*` |
| BI mobile | `lib/services/mobile_bi_service.dart` | Dashboard + métriques pack IoT |

**MQTT / ESP32 :** le firmware envoie les lectures au backend ; Flutter les consomme via l'API (pas de MQTT direct dans l'app — même architecture que le web).

**Documentation IoT :** `docs/petfoodiot-use-case.md`, `mobile_app/README.md`.

---

## 7. Données et intégrations

### 7.1 Entités principales

Utilisateurs, animaux (pets), produits, commandes, factures, rendez-vous vétérinaires, dossiers médicaux, prescriptions, avis, messages, devices IoT, lectures qualité, logs d'activité, présence live.

### 7.2 Intégrations externes

| Service | Usage |
|---------|-------|
| Stripe | Paiement cartes (mock / live) |
| Groq / LLM | Chatbot, copilote admin |
| Google Maps | Livraison, géolocalisation |
| Power BI | Exports + embed URL optionnelle |
| Sentry | Monitoring erreurs frontend (optionnel) |

### 7.3 Seeds & environnements

| Environnement | Données | Commandes |
|---------------|---------|-----------|
| Développement | Démo + live API | `npm run dev`, `npm run docker:up` |
| Staging / Docker | Seeds idempotents | `npm run seed:platform-live`, `seed:vet-live` |
| Production | Live strict, seeds protégés | `SEED_SECRET`, `DEMO_MODE=false` |

---

## 8. Livrables attendus

| # | Livrable | Format |
|---|----------|--------|
| L1 | Code source frontend, backend, ML, mobile, firmware | GitHub `GhassenEl/frontend-petfood` |
| L2 | Documentation architecture | `ARCHITECTURE.md` |
| L3 | Documentation DevOps | `docs/DEVOPS*.md`, `docs/CD.md` |
| L4 | Cahier des charges | `docs/CAHIER-DES-CHARGES.md` (ce document) |
| L5 | Comptes & accès (dev uniquement) | `docs/COMPTES-ACCES.md` |
| L6 | Dashboards Grafana | `infra/monitoring/grafana/dashboards/*.json` |
| L7 | Page marketing / présentation PFE | `/` — section `#projet` |
| L8 | Rapport PFE (mémoire) | Hors dépôt — à rédiger par l'étudiant |
| L9 | Démonstration vidéo / soutenance | Parcours client, vet, admin BI, IoT |

---

## 9. Critères d'acceptation globaux

1. **Connexion** par rôle avec redirection vers l'espace dédié (`getRoleHome`).
2. **Commande client** de bout en bout : panier → paiement (mock ou Stripe) → facture.
3. **RDV vétérinaire** créé côté client, visible côté vet et admin.
4. **Lecture IoT** simulée ou réelle remontée avec score qualité et alerte si seuil dépassé.
5. **Dashboard admin BI** affiche données API live (pas uniquement démo) en mode `VITE_STRICT_LIVE`.
6. **Grafana** accessible après `npm run docker:monitoring:up` avec dashboards provisionnés.
7. **Pipeline CI** vert sur `main` (build + sécurité minimum).
8. **Sécurité** : login prod sans comptes démo documentés ; cookies HttpOnly actifs.

---

## 10. Planning indicatif (PFE)

| Phase | Durée estimée | Activités |
|-------|---------------|-----------|
| 1. Analyse & CDC | 2 semaines | Benchmark, personas, ce document |
| 2. Conception | 2 semaines | Maquettes, schéma Prisma, architecture |
| 3. Socle technique | 3 semaines | Auth, rôles, Docker, API CRUD |
| 4. Métier e-commerce & vet | 4 semaines | Commandes, dossiers, RDV |
| 5. IoT & ML | 3 semaines | ESP32, FastAPI, alertes |
| 6. BI & DevOps | 2 semaines | Grafana, pipelines, exports |
| 7. Mobile & finitions | 2 semaines | Flutter, tests E2E, sécurité |
| 8. Rédaction & soutenance | 2 semaines | Mémoire, démo, corrections |

*Total indicatif : 20 semaines (ajustable selon calendrier universitaire).*

---

## 11. Risques et mesures

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Fuite mots de passe démo en prod | Critique | Seeds guard, rotation MDP, `DEMO_MODE=false` |
| XSS vol JWT localStorage | Élevé | Cookies HttpOnly, CSP |
| Données vet exposées | Critique | RBAC `/api/vet/*`, audit logs |
| Complexité scope PFE | Moyen | Catalogue `implemented` vs `planned`, priorisation Must |
| Dépendance Docker / cloud | Moyen | Scripts `devops:health`, doc VPS + Render + AWS |

---

## 12. Glossaire

| Terme | Définition |
|-------|------------|
| **PFE** | Projet de Fin d'Études |
| **RBAC** | Contrôle d'accès basé sur les rôles |
| **BI** | Business Intelligence — tableaux de bord décisionnels |
| **PetFoodIoT** | Sous-système IoT (distributeur, caméra, capteurs) |
| **NAC** | Nouveaux Animaux de Compagnie (lapin, rongeur, reptile…) |
| **CDC** | Cahier des charges |

---

## 13. Références documentaires

- `ARCHITECTURE.md` — architecture logicielle
- `docs/DEVOPS-PLATFORM.md` — monitoring et stacks Docker
- `docs/petfoodiot-use-case.md` — cas d'usage IoT
- `docs/COMPTES-ACCES.md` — comptes de démonstration (dev uniquement)
- `docs/admin-features.md` — fonctionnalités administrateur
- `powerbi/README.md` — intégration Power BI
- Page d'accueil `/` section **#projet** — présentation publique PFE

---

*Document rédigé par **El Jezi Ghassen** — PFE 2025–2026, sous la direction de **Mme Hend Ben Moussa** (encadrante académique) et **Neffati Ahmed** (encadrant entreprise). Plateforme PetfoodTN — Tunisie. Toute évolution de périmètre doit faire l'objet d'une mise à jour versionnée de ce cahier des charges.*
