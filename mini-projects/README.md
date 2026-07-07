# Mini-projets autonomes

Projets de démonstration **indépendants** de PetfoodTN et de `mobile_app/`.

Thème **noir & blanc** · données **dynamiques** (CRUD + `localStorage` web / état Flutter).

## Web (HTML / CSS / JavaScript)

| Projet | Dossier | Port | Description |
|--------|---------|------|-------------|
| FitClub — Salle de sport | `salle-de-sport/` | 5501 | Adhérents, planning |
| FitConnect — Fitness | `fitness-platform/` | 5502 | Coachs, programmes |
| QuickBite — Fast-food | `fastfood/` | 5522 | Menu, commandes, promos |
| AutoPilot — Auto-école | `auto-ecole/` | 5523 | Élèves, leçons, formules |
| MediLink — Clinique | `clinique-medicale/` | 5524 | Médecins, patients, RDV |
| **DriveRent — Location voitures** | `location-voitures/` | 5525 | Flotte, clients, locations |

## Flutter

| Application | Dossier | Port |
|-------------|---------|------|
| FitClub Gym | `flutter/fitclub_gym/` | 5520 |
| FitConnect | `flutter/fitconnect_platform/` | 5521 |
| QuickBite | `flutter/quickbite_fastfood/` | 5522 |
| AutoPilot | `flutter/autopilot_ecole/` | 5523 |
| MediLink | `flutter/medilink_clinique/` | 5524 |
| **DriveRent** | `flutter/driverent_location/` | 5525 |

## Branches GitHub

| Branche | Projet |
|---------|--------|
| `project-quickbite` | Fast-food |
| `project-autopilot` | Auto-école |
| `project-medilink` | Clinique |
| `project-driverent` | Location voitures |
| `mini-projects` | Tous |

## Lancer DriveRent (Flutter)

```bash
cd mini-projects/flutter/driverent_location
flutter run -d web-server --web-port=5525
```
