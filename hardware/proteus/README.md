# Proteus ISIS / ARES — Distributeur PetfoodTN

Fichiers pour ouvrir ou recréer les cartes dans **Proteus Design Suite** (ISIS + ARES).

## Contenu

| Fichier | Carte | Usage |
|---------|-------|--------|
| `PetFeeder_CTRL.net` | PCB contrôle ESP32 | Netlist Tango → import ARES |
| `PetFeeder_PSU.net` | Alimentation 5 V | Netlist Tango → import ARES |
| `PetFeeder_CTRL.BOM.csv` | Contrôle | Nomenclature |
| `PetFeeder_PSU.BOM.csv` | PSU | Nomenclature |
| `PetFeeder_CTRL.pdsprj` | Contrôle | Projet starter (ZIP Proteus) |
| `PetFeeder_PSU.pdsprj` | PSU | Projet starter (ZIP Proteus) |

## Ouvrir le projet `.pdsprj`

1. Proteus 8+ → **Open Project** → choisir `PetFeeder_CTRL.pdsprj` ou `PetFeeder_PSU.pdsprj`.
2. Si le schéma est vide : **ISIS** → dessiner ou importer la netlist.
3. **Tools → Netlist to ARES** pour passer au routage PCB.
4. Contour carte : calque **Board Edge** — 100×80 mm (CTRL) ou 80×60 mm (PSU).

## Importer la netlist Tango (sans .pdsprj)

1. **ISIS** : nouveau schéma, placer les composants (footprints identiques aux références).
2. **Tools → Netlist to ARES** ou **Import** selon version.
3. Fichier : `PetFeeder_CTRL.net` ou `PetFeeder_PSU.net`.
4. Assigner les boîtiers manquants (ESP32-DEVKIT, RELAY, HX711, etc.).

## Lien firmware

Brochage GPIO : `firmware/README.md` et `firmware/esp32/PetFeederESP32/config.example.h`.

## Export fabrication

Gerber démo : `../gerber/` — voir `../gerber/README.md`.
