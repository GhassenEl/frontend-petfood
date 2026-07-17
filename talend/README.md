# Talend DI — PetfoodTN Data Quality

Projet de nettoyage clients pour **Talend Open Studio DI 8.0.1**.

## Sous-jobs

1. **Prix d'achat** → type `Double` (virgule `,` remplacée par point `.`)
2. **Prénom / Nom** → `UPPER`
3. **Outliers** montant (`< 0` ou `> 10000`) → `null`

## Exécuter (CLI)

```powershell
python talend/scripts/run_job_nettoyage.py
```

## Studio Talend

Voir `docs/Job_Nettoyage_Clients.md` et `jobs/tMap_expressions.txt`.
Routine Java : `routines/DataQualityUtils.java`.
