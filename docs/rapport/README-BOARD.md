# Board gestion de projet PetfoodTN (rapport)

## Recommandation pour le rapport

| Outil | Intérêt | Choix |
|-------|---------|--------|
| **Trello** | Visuel, simple, idéal pour captures Kanban | Excellent pour soutenance |
| **Jira** | Sprints, story points, epics (plus « pro ») | Excellent si l’école exige Scrum formel |
| **Board local (fourni)** | Aucun compte, hors-ligne, prêt à imprimer | **Utiliser pour le rapport maintenant** |

→ Pour un rapport étudiant : **Trello** (ou ce board HTML) suffit.  
→ Si le jury attend une méthodo entreprise : cite **Jira** + importe le CSV.

## Fichiers

| Fichier | Usage |
|---------|--------|
| [PETFOODTN-SPRINT-BOARD.html](./PETFOODTN-SPRINT-BOARD.html) | **Page de gestion** — Sprint Board drag & drop, roadmap, backlog, vélocité, export CSV |
| [PETFOODTN-BOARD.html](./PETFOODTN-BOARD.html) | Board lecture seule Kanban / Sprints / Epics (captures rapport) |
| [jira-import-petfoodtn.csv](./jira-import-petfoodtn.csv) | Import Jira : *Project → Import issues from CSV* |

## Ouvrir la gestion de sprints

```bat
start docs\rapport\PETFOODTN-SPRINT-BOARD.html
```

Fonctions : changer de sprint, glisser les tickets entre colonnes, créer / éditer, exporter CSV Jira, burndown & vélocité.

## Texte type pour le rapport (chapitre Gestion de projet)

> Le suivi du projet PetfoodTN a été réalisé selon une approche **Agile Scrum**.  
> Le backlog produit a été découpé en **epics** (E-commerce, Mobile, IA, IoT, Sécurité, etc.) et en **user stories** estimées en story points.  
> Le travail a été organisé en **6 sprints** : socle plateforme, logistique & mobile, santé animale, intelligence artificielle & BI, IoT, puis sécurisation et livrables de soutenance.  
> Le tableau de bord (style Trello/Jira) distingue les colonnes Backlog, To Do, In Progress et Done.
