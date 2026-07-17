# Job Talend DI — Nettoyage clients (PetfoodTN)

## Objectif

Sous-jobs de qualité de données :

| Sous-job | Transformation | Expression tMap (Talend) |
|----------|----------------|---------------------------|
| **SJ1** | Prix d'achat → `Double` (`,` → `.`) | `DataQualityUtils.toDoublePrix(row1.MontantAchat)` |
| **SJ2** | Prénom & Nom → `UPPER` | `DataQualityUtils.toUpperName(row1.Prenom)` / `…Nom` |
| **SJ3** | Outliers → `null` (ou défaut) | `DataQualityUtils.cleanOutlier(…)` |

Seuils outliers montant : `< 0` ou `> 10000` → `null`.

## Flux Studio (TOS DI 8.0.1)

```
tFileInputDelimited  →  tMap  →  tFileOutputDelimited
   (clients_bruts)      (SJ1+SJ2+SJ3)   (clients_nettoyes)
                      ↘ tFilterRow / tFileOutputDelimited (rejects outliers)
```

1. Ouvrir **Talend Open Studio for Data Integration 8.0.1**
2. Créer le projet `PetfoodTN_DQ` (ou importer ce dossier)
3. **Code → Routines → Create routine** `DataQualityUtils` — coller `routines/DataQualityUtils.java`
4. Job `Job_Nettoyage_Clients` :
   - Input : `talend/input/clients_bruts.csv` (séparateur `;`, encodage UTF-8)
   - Schéma : `MontantAchat` en **String** en entrée (pour remplacer la virgule)
   - Sortie : `MontantAchat` en **Double**
5. Exécuter le job (Run)

## Exécution CLI (même logique que les sous-jobs)

```powershell
cd talend
python scripts/run_job_nettoyage.py
```

Sorties : `output/clients_nettoyes.csv`, `clients_nettoyes.json`, `clients_outliers_rejects.csv`.

## Données source

Fichier Excel d’origine : `Downloads/DataTalend.xlsx` (colonnes Prénom/Nom, Montant d'Achats, etc.).
