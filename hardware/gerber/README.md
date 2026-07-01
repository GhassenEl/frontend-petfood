# Gerber démo — fabrication PCB PetfoodTN

Exports **RS-274X** de démonstration pour les deux cartes. Validables sur [Gerber Viewer](https://www.pcbway.com/project/OnlineGerberViewer.html) ou JLCPCB.

## Packages

| Dossier | Carte | Dimensions | ZIP |
|---------|-------|------------|-----|
| `PF-TN-CTRL-v1/` | PCB contrôle | 100 × 80 mm | `PF-TN-CTRL-v1.zip` |
| `PF-TN-PSU-v1/` | Alimentation 5 V | 80 × 60 mm | `PF-TN-PSU-v1.zip` |

## Calques inclus

- `.GKO` — contour carte
- `.GTL` — cuivre top (pads + pistes démo)
- `.GBL` — cuivre bottom (plan de masse partiel)
- `.GTS` / `.GBS` — vernis soudure
- `.GTO` — sérigraphie (références)
- `.TXT` — perçages (Excellon)

## Commande

```bash
npm run hardware:package
```

Recrée les ZIP dans `hardware/gerber/` et `public/hardware/gerber/`.

## Note

Fichiers **démo** : vérifier DRC dans ARES avant production. Compléter routage selon votre imprimeur.
