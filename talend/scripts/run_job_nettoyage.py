#!/usr/bin/env python3
"""
Job Talend équivalent (exécutable CLI) — 3 sous-jobs :
  1) MontantAchat : virgule → point, cast Double
  2) Prenom / Nom : UPPER
  3) Outliers montant → null (ou défaut)

Usage:
  python scripts/run_job_nettoyage.py
"""
from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "input" / "clients_bruts.csv"
OUT_DIR = ROOT / "output"
OUT_CSV = OUT_DIR / "clients_nettoyes.csv"
OUT_JSON = OUT_DIR / "clients_nettoyes.json"
OUT_REJECTS = OUT_DIR / "clients_outliers_rejects.csv"

MONTANT_MIN = 0.0
MONTANT_MAX = 10000.0
DEFAULT_OUTLIER = None  # null ; mettre 0.0 pour valeur par défaut numérique


def subjob1_prix_to_double(raw: str | None) -> float | None:
    """Sous-job 1 — prix d'achat → Double (virgule → point)."""
    if raw is None:
        return None
    s = str(raw).strip()
    if not s:
        return None
    s = s.replace("\u00a0", "").replace(" ", "").replace(",", ".")
    # plusieurs points : garder le dernier comme décimal
    if s.count(".") > 1:
        left, _, right = s.rpartition(".")
        s = left.replace(".", "") + "." + right
    try:
        return float(s)
    except ValueError:
        return None


def subjob2_upper_name(raw: str | None) -> str | None:
    """Sous-job 2 — nom / prénom UPPER."""
    if raw is None:
        return None
    s = str(raw).strip()
    return s.upper() if s else None


def subjob3_outlier(value: float | None) -> float | None:
    """Sous-job 3 — outliers → null / défaut."""
    if value is None:
        return DEFAULT_OUTLIER
    if value < MONTANT_MIN or value > MONTANT_MAX:
        return DEFAULT_OUTLIER
    return value


def run() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows_in: list[dict] = []
    with INPUT.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f, delimiter=";")
        rows_in = list(reader)

    cleaned = []
    rejects = []
    for row in rows_in:
        raw_montant = row.get("MontantAchat")
        as_double = subjob1_prix_to_double(raw_montant)
        montant = subjob3_outlier(as_double)
        if as_double is not None and montant is None:
            rejects.append(
                {
                    **row,
                    "MontantAchat_Double": as_double,
                    "Raison": "outlier",
                }
            )

        cleaned.append(
            {
                "ID": row.get("ID"),
                "Prenom": subjob2_upper_name(row.get("Prenom")),
                "Nom": subjob2_upper_name(row.get("Nom")),
                "Email": (row.get("Email") or "").strip() or None,
                "Telephone": (row.get("Telephone") or "").strip() or None,
                "DateNaissance": row.get("DateNaissance") or None,
                "MontantAchat": montant,  # Double ou null
                "MontantAchat_Raw": raw_montant,
                "DateInscription": row.get("DateInscription") or None,
                "Commentaire": row.get("Commentaire"),
            }
        )

    fieldnames = [
        "ID",
        "Prenom",
        "Nom",
        "Email",
        "Telephone",
        "DateNaissance",
        "MontantAchat",
        "MontantAchat_Raw",
        "DateInscription",
        "Commentaire",
    ]
    with OUT_CSV.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, delimiter=";")
        w.writeheader()
        for r in cleaned:
            out = dict(r)
            if out["MontantAchat"] is None:
                out["MontantAchat"] = ""
            else:
                # export point décimal (Double)
                out["MontantAchat"] = f"{out['MontantAchat']:.2f}"
            w.writerow(out)

    with OUT_JSON.open("w", encoding="utf-8") as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

    with OUT_REJECTS.open("w", encoding="utf-8", newline="") as f:
        if rejects:
            w = csv.DictWriter(f, fieldnames=list(rejects[0].keys()), delimiter=";")
            w.writeheader()
            w.writerows(rejects)
        else:
            f.write("ID;Raison\n")

    print(f"OK  input={len(rows_in)}  cleaned={len(cleaned)}  outliers={len(rejects)}")
    print(f"OUT {OUT_CSV}")
    print(f"OUT {OUT_JSON}")
    print(f"OUT {OUT_REJECTS}")
    print("Apercu (Prenom Nom Montant):")
    for r in cleaned:
        prenom = r["Prenom"] or ""
        nom = r["Nom"] or ""
        print(f"  {r['ID']:>2}  {prenom:12} {nom:12}  montant={r['MontantAchat']}")


if __name__ == "__main__":
    run()
