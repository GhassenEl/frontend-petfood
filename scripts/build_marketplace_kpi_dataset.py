#!/usr/bin/env python3
"""
PetfoodTN — Nettoyage dataset marketplace + génération expressions KPI pour chatbot.

Entrée  : data/marketplace/products_raw.csv (ou extraction depuis transcript)
Sorties :
  - data/marketplace/products_clean.csv
  - data/marketplace/kpi_summary.json
  - data/chatbot/training/marketplace_kpi_train.jsonl
  - data/chatbot/training/kpi_expressions_catalog.json
"""

from __future__ import annotations

import csv
import io
import json
import re
import statistics
from collections import Counter, defaultdict
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
RAW_CSV = ROOT / "data" / "marketplace" / "products_raw.csv"
CLEAN_CSV = ROOT / "data" / "marketplace" / "products_clean.csv"
KPI_JSON = ROOT / "data" / "marketplace" / "kpi_summary.json"
BACKEND_KPI_JSON = ROOT / "backend-ci-test" / "data" / "marketplace" / "kpi_summary.json"
TRAIN_JSONL = ROOT / "data" / "chatbot" / "training" / "marketplace_kpi_train.jsonl"
CATALOG_JSON = ROOT / "data" / "chatbot" / "training" / "kpi_expressions_catalog.json"
TRANSCRIPT = (
    Path.home()
    / ".cursor"
    / "projects"
    / "c-Users-GHASSEN-Desktop-GitHub-1-GitHub-GitHub-frontend-Lido"
    / "agent-transcripts"
    / "233fb257-4dcd-49d5-9b7b-1e0729d3324b"
    / "233fb257-4dcd-49d5-9b7b-1e0729d3324b.jsonl"
)

# --- Catégories déduites du titre (mots-clés multilingues) ---
CATEGORY_RULES: list[tuple[str, list[str]]] = [
    ("litiere_hygiene", ["litter", "litière", "litiere", "poop", "pooper", "scoop", "shovel", "pee pad", "diaper", "waste bag", "poop bag", "garbage", "deodorizer", "litter box", "litter mat"]),
    ("alimentation_eau", ["feeder", "bowl", "fountain", "water dispenser", "drinking", "food bowl", "slow food", "lick mat", "placemat", "snack bag", "treat pouch", "food pail", "food container", "water bottle", "drinker", "nourriture", "gamelle", "mangeoire"]),
    ("jouets", ["toy", "toys", "squeak", "chew", "plush", "ball", "rope", "frisbee", "flying disk", "tunnel", "catnip", "teaser", "wand", "jouet", "juguetes", "interactive"]),
    ("grooming_soin", ["brush", "comb", "grooming", "bath", "shampoo", "toothbrush", "deshedding", "steam brush", "massage", "wipes", "flea", "tick", "muzzle", "toilettage"]),
    ("colliers_harnais", ["collar", "harness", "leash", "traction", "harnais", "laisse", "collier", "muzzle", "bandana"]),
    ("lits_niches", ["bed", "nest", "kennel", "sofa", "mat", "cushion", "blanket", "hammock", "house", "cave", "lit ", "panier", "coussin"]),
    ("transport_securite", ["carrier", "backpack", "crate", "cage", "seat belt", "car seat", "playpen", "gate", "fence", "flap door", "transport"]),
    ("dressage", ["training", "clicker", "bark", "shock collar", "whistle", "repeller", "muzzle", "dressage"]),
    ("vet_sante", ["medicine", "syringe", "pill", "wound", "parvo", "hemoglobin", "intubation", "veterinary", "health test"]),
    ("accessoires_mode", ["bow tie", "hairpin", "sunglasses", "glasses", "costume", "clothes", "sweater", "rhinestone", "bling", "bandana"]),
]

ACTOR_ROLES = ("admin", "vendor", "client", "analyst", "marketing", "moderator", "livreur")


@dataclass
class ProductRow:
    title: str
    average_star: float
    quantity: int
    trade_amount_raw: str
    wished_count: int
    sold_units: int
    sold_is_estimate: bool
    category: str
    has_rating: bool
    conversion_wish_ratio: float | None


def extract_csv_from_transcript() -> str | None:
    if not TRANSCRIPT.exists():
        return None
    header = "title,averageStar,quantity,tradeAmount,wishedCount"
    for line in TRANSCRIPT.read_text(encoding="utf-8", errors="replace").splitlines():
        if "averageStar" not in line or "wishedCount" not in line:
            continue
        text = line
        if line.lstrip().startswith("{"):
            try:
                obj = json.loads(line)
                parts = obj.get("message", {}).get("content", [])
                text = next((p.get("text", "") for p in parts if p.get("type") == "text"), line)
            except json.JSONDecodeError:
                continue
        if "averageStar" not in text or "Mesh Litter" not in text:
            continue
        for anchor in (
            'title,"averageStar","quantity","tradeAmount","wishedCount"',
            "title,averageStar,quantity,tradeAmount,wishedCount",
        ):
            idx = text.find(anchor)
            if idx >= 0:
                return text[idx:]
        idx = text.find("title,")
        if idx >= 0 and "averageStar" in text[idx : idx + 80]:
            return text[idx:]
    return None


def parse_sold_units(raw: str) -> tuple[int, bool]:
    """Parse tradeAmount → (sold_units, is_estimate)."""
    if not raw or not str(raw).strip():
        return 0, False
    text = str(raw).strip().lower()
    if re.search(r"\b0\s+(sold|vendu|vendidos|verkauft|販売|판매|تم البيع)\b", text):
        return 0, False
    plus = "+" in text
    nums = re.findall(r"[\d,]+", text.replace(".", ""))
    if not nums:
        return 0, False
    value = int(nums[0].replace(",", ""))
    return value, plus


def infer_category(title: str) -> str:
    t = title.lower()
    for cat, keywords in CATEGORY_RULES:
        if any(kw in t for kw in keywords):
            return cat
    return "autres"


def safe_float(v: str) -> float:
    try:
        return float(str(v).strip().replace(",", "."))
    except (TypeError, ValueError):
        return 0.0


def safe_int(v: str) -> int:
    try:
        return int(float(str(v).strip().replace(",", "")))
    except (TypeError, ValueError):
        return 0


def load_raw_rows() -> list[dict[str, str]]:
    if RAW_CSV.exists():
        with RAW_CSV.open(encoding="utf-8", newline="") as f:
            return list(csv.DictReader(f))

    blob = extract_csv_from_transcript()
    if not blob:
        raise FileNotFoundError(
            f"Aucune source CSV : placez le fichier dans {RAW_CSV} ou conservez le transcript."
        )
    RAW_CSV.parent.mkdir(parents=True, exist_ok=True)
    RAW_CSV.write_text(blob, encoding="utf-8")
    with io.StringIO(blob) as f:
        return list(csv.DictReader(f))


def clean_rows(raw: list[dict[str, str]]) -> list[ProductRow]:
    cleaned: list[ProductRow] = []
    seen_titles: set[str] = set()

    for row in raw:
        title = (row.get("title") or "").strip()
        if not title or title in seen_titles:
            continue
        seen_titles.add(title)

        star = safe_float(row.get("averageStar", "0"))
        qty = safe_int(row.get("quantity", "0"))
        trade_raw = row.get("tradeAmount", "")
        wished = safe_int(row.get("wishedCount", "0"))
        sold, sold_est = parse_sold_units(trade_raw)
        has_rating = star > 0
        conv = round(wished / sold, 2) if sold > 0 else None

        cleaned.append(
            ProductRow(
                title=title,
                average_star=star,
                quantity=qty,
                trade_amount_raw=trade_raw,
                wished_count=wished,
                sold_units=sold,
                sold_is_estimate=sold_est,
                category=infer_category(title),
                has_rating=has_rating,
                conversion_wish_ratio=conv,
            )
        )
    return cleaned


def compute_kpis(products: list[ProductRow]) -> dict[str, Any]:
    n = len(products)
    if n == 0:
        return {"total_products": 0}

    rated = [p for p in products if p.has_rating]
    stars_rated = [p.average_star for p in rated]
    stars_all = [p.average_star for p in products]
    solds = [p.sold_units for p in products]
    wishes = [p.wished_count for p in products]
    stocks = [p.quantity for p in products]

    zero_sold = sum(1 for p in products if p.sold_units == 0)
    zero_stock = sum(1 for p in products if p.quantity == 0)
    high_wish = sorted(products, key=lambda p: p.wished_count, reverse=True)[:10]
    top_sold = sorted(products, key=lambda p: p.sold_units, reverse=True)[:10]
    top_rated = sorted(
        [p for p in products if p.has_rating and p.sold_units >= 100],
        key=lambda p: p.average_star,
        reverse=True,
    )[:10]

    by_cat: dict[str, list[ProductRow]] = defaultdict(list)
    for p in products:
        by_cat[p.category].append(p)

    cat_kpis = {}
    for cat, items in sorted(by_cat.items(), key=lambda x: -len(x[1])):
        rated_items = [i for i in items if i.has_rating]
        cat_kpis[cat] = {
            "count": len(items),
            "share_pct": round(100 * len(items) / n, 1),
            "avg_star": round(statistics.mean([i.average_star for i in rated_items]), 2) if rated_items else 0,
            "total_sold_est": sum(i.sold_units for i in items),
            "total_wished": sum(i.wished_count for i in items),
            "avg_stock": round(statistics.mean([i.quantity for i in items]), 0),
            "zero_sold_pct": round(100 * sum(1 for i in items if i.sold_units == 0) / len(items), 1),
            "rated_pct": round(100 * len(rated_items) / len(items), 1),
        }

    return {
        "total_products": n,
        "unique_titles": n,
        "avg_star_all": round(statistics.mean(stars_all), 2),
        "avg_star_rated_only": round(statistics.mean(stars_rated), 2) if stars_rated else 0,
        "rated_products_pct": round(100 * len(rated) / n, 1),
        "products_star_ge_4_5_pct": round(100 * sum(1 for p in rated if p.average_star >= 4.5) / n, 1),
        "products_star_lt_3_pct": round(100 * sum(1 for p in rated if p.average_star < 3) / n, 1),
        "no_rating_pct": round(100 * (n - len(rated)) / n, 1),
        "total_sold_units_est": sum(solds),
        "avg_sold_per_product": round(statistics.mean(solds), 1),
        "median_sold": statistics.median(solds),
        "zero_sold_count": zero_sold,
        "zero_sold_pct": round(100 * zero_sold / n, 1),
        "total_wished": sum(wishes),
        "avg_wished": round(statistics.mean(wishes), 1),
        "total_stock_units": sum(stocks),
        "avg_stock": round(statistics.mean(stocks), 0),
        "zero_stock_pct": round(100 * zero_stock / n, 1),
        "top_sold": [{"title": p.title[:80], "sold": p.sold_units, "star": p.average_star} for p in top_sold],
        "top_wished": [{"title": p.title[:80], "wished": p.wished_count, "sold": p.sold_units} for p in high_wish],
        "top_rated_popular": [{"title": p.title[:80], "star": p.average_star, "sold": p.sold_units} for p in top_rated],
        "by_category": cat_kpis,
        "category_distribution": dict(Counter(p.category for p in products)),
    }


def fmt_num(n: float | int) -> str:
    if isinstance(n, float) and n == int(n):
        n = int(n)
    return f"{n:,}".replace(",", " ")


def training_pair(role: str, user: str, assistant: str, kpi_type: str, metadata: dict | None = None) -> dict:
    return {
        "messages": [
            {"role": "system", "content": f"Tu es l'assistant KPI PetfoodTN pour le rôle {role}. Réponds en français avec des chiffres précis issus du catalogue marketplace."},
            {"role": "user", "content": user},
            {"role": "assistant", "content": assistant},
        ],
        "metadata": {"actor": role, "kpi_type": kpi_type, **(metadata or {})},
    }


def expand_training_corpus(kpis: dict[str, Any], products: list[ProductRow], base: list[dict]) -> list[dict]:
    """Genere des variantes supplementaires par acteur et par categorie."""
    out = list(base)
    cats = kpis.get("by_category", {})
    k = kpis

    cat_labels = {
        "jouets": "jouets",
        "alimentation_eau": "alimentation et eau",
        "litiere_hygiene": "litiere et hygiene",
        "grooming_soin": "toilettage et soin",
        "colliers_harnais": "colliers et harnais",
        "lits_niches": "lits et niches",
        "transport_securite": "transport et securite",
        "dressage": "dressage",
        "accessoires_mode": "accessoires mode",
        "vet_sante": "sante veterinaire",
        "autres": "autres",
    }

    # Vendor : une question par categorie
    for cat_key, label in cat_labels.items():
        c = cats.get(cat_key)
        if not c:
            continue
        out.append(training_pair(
            "vendor",
            f"KPI de ma boutique categorie {label} : nombre de SKU et ventes",
            f"**{label.title()}** — {fmt_num(c['count'])} references ({c['share_pct']}% du catalogue), "
            f"ventes est. {fmt_num(c['total_sold_est'])}, note moy. {c['avg_star']}/5, "
            f"{c['zero_sold_pct']}% sans vente.",
            "composite",
            {"category": cat_key},
        ))

    # Analyst : pourcentage par categorie
    for cat_key, label in cat_labels.items():
        c = cats.get(cat_key)
        if not c:
            continue
        out.append(training_pair(
            "analyst",
            f"Quelle part du catalogue represente la categorie {label} ?",
            f"La categorie **{label}** represente **{c['share_pct']}%** ({fmt_num(c['count'])} produits sur {fmt_num(k['total_products'])}).",
            "percentage",
            {"category": cat_key},
        ))

    # Client : questions decouverte par categorie top
    for cat_key in ("jouets", "alimentation_eau", "grooming_soin"):
        items = [p for p in products if p.category == cat_key and p.has_rating]
        top = sorted(items, key=lambda p: (p.average_star, p.sold_units), reverse=True)[:3]
        if not top:
            continue
        label = cat_labels.get(cat_key, cat_key)
        out.append(training_pair(
            "client",
            f"Meilleurs produits {label} selon les notes et ventes ?",
            "\n".join(f"• ★ {p.average_star} — {p.title[:65]} ({fmt_num(p.sold_units)} ventes)" for p in top),
            "ranking",
            {"category": cat_key},
        ))

    # Admin : formulations alternatives
    admin_qa = [
        ("Donne-moi le nombre total de wishedCount sur la marketplace", f"Total listes de souhaits : **{fmt_num(k['total_wished'])}**.", "sum"),
        ("Calcule la moyenne de stock par produit", f"Moyenne quantity : **{fmt_num(k['avg_stock'])}** unites/SKU.", "average"),
        ("Quel pourcentage des produits n ont pas de note ?", f"**{k['no_rating_pct']}%** des fiches ont averageStar=0.0 (pas encore d avis).", "percentage"),
        ("Median des ventes par produit ?", f"Mediane des ventes parsees : **{fmt_num(k['median_sold'])}** unites.", "median"),
        ("Combien de produits ont plus de 1000 ventes ?", _count_high_sellers(products, 1000), "count"),
        ("Combien de produits ont plus de 5000 souhaits ?", _count_high_wish(products, 5000), "count"),
    ]
    for q, a, t in admin_qa:
        out.append(training_pair("admin", q, a, t))

    # Marketing : variantes
    marketing_qa = [
        ("Total souhaits clients sur le catalogue", f"**{fmt_num(k['total_wished'])}** souhaits cumules.", "sum"),
        ("Taux de produits bien notes (>=4 etoiles)", f"**{round(100 * sum(1 for p in products if p.has_rating and p.average_star >= 4) / k['total_products'], 1)}%** du catalogue >=4★.", "percentage"),
        ("Top 3 categories par volume de ventes", _top_cats_by_sold(cats), "ranking"),
    ]
    for q, a, t in marketing_qa:
        out.append(training_pair("marketing", q, a, t))

    # Moderator
    no_rating_high_wish = sorted(
        [p for p in products if not p.has_rating and p.wished_count > 500],
        key=lambda p: -p.wished_count,
    )[:5]
    if no_rating_high_wish:
        out.append(training_pair(
            "moderator",
            "Produits tres souhaites mais sans aucune note — risque confiance",
            "\n".join(f"• {p.title[:60]} — {fmt_num(p.wished_count)} souhaits, 0★" for p in no_rating_high_wish),
            "filter",
        ))

    # Livreur
    out.append(training_pair(
        "livreur",
        "Combien de references alimentation/eau a livrer potentiellement ?",
        _cat_answer(cats, "alimentation_eau"),
        "count",
    ))
    out.append(training_pair(
        "livreur",
        "Quel est le poids catalogue en nombre de jouets ?",
        f"**{fmt_num(cats.get('jouets', {}).get('count', 0))}** SKUs categorie jouets ({cats.get('jouets', {}).get('share_pct', 0)}% du catalogue).",
        "count",
    ))

    return out


def _count_high_sellers(products: list[ProductRow], threshold: int) -> str:
    n = sum(1 for p in products if p.sold_units >= threshold)
    pct = round(100 * n / max(len(products), 1), 1)
    return f"**{fmt_num(n)}** produits ({pct}%) depassent **{fmt_num(threshold)}** ventes estimees."


def _count_high_wish(products: list[ProductRow], threshold: int) -> str:
    n = sum(1 for p in products if p.wished_count >= threshold)
    pct = round(100 * n / max(len(products), 1), 1)
    return f"**{fmt_num(n)}** produits ({pct}%) depassent **{fmt_num(threshold)}** listes de souhaits."


def _top_cats_by_sold(cats: dict) -> str:
    ranked = sorted(cats.items(), key=lambda x: -x[1]["total_sold_est"])[:3]
    return "\n".join(
        f"{i+1}. {name.replace('_', ' ')} — {fmt_num(c['total_sold_est'])} ventes est."
        for i, (name, c) in enumerate(ranked)
    )


def build_training_examples(kpis: dict[str, Any], products: list[ProductRow]) -> list[dict]:
    k = kpis
    examples: list[dict] = []
    cats = k.get("by_category", {})

    # --- ADMIN ---
    examples.append(training_pair(
        "admin",
        "Combien de produits sont listés sur la marketplace ?",
        f"Le catalogue compte **{fmt_num(k['total_products'])}** produits uniques après déduplication des titres.",
        "count",
    ))
    examples.append(training_pair(
        "admin",
        "Quel est le pourcentage de produits sans aucune vente enregistrée ?",
        f"**{k['zero_sold_pct']}%** des produits affichent « 0 sold » ({fmt_num(k['zero_sold_count'])} références). C'est un signal de catalogue mort ou de fiches non optimisées.",
        "percentage",
    ))
    examples.append(training_pair(
        "admin",
        "Quelle est la note moyenne globale du catalogue ?",
        f"Note moyenne sur toutes les fiches : **{k['avg_star_all']}/5**. Sur les produits ayant au moins une note : **{k['avg_star_rated_only']}/5** ({k['rated_products_pct']}% du catalogue est noté).",
        "average",
    ))
    examples.append(training_pair(
        "admin",
        "Quel est le volume total de ventes estimé (tradeAmount) ?",
        f"Somme des unités vendues parsées : **{fmt_num(k['total_sold_units_est'])}** unités (les valeurs « 1,000+ » sont comptées comme minimum 1 000).",
        "sum",
    ))
    examples.append(training_pair(
        "admin",
        "Quels sont les 3 produits les plus vendus ?",
        "\n".join(f"{i+1}. {p['title']} — ~{fmt_num(p['sold'])} ventes (★ {p['star']})" for i, p in enumerate(k["top_sold"][:3])),
        "ranking",
    ))

    # --- VENDOR ---
    examples.append(training_pair(
        "vendor",
        "Ma catégorie jouets : combien de références et quelle part du catalogue ?",
        _cat_answer(cats, "jouets"),
        "percentage",
        {"category": "jouets"},
    ))
    examples.append(training_pair(
        "vendor",
        "Quelle note moyenne viser pour la catégorie alimentation et eau ?",
        _cat_star_answer(cats, "alimentation_eau"),
        "average",
        {"category": "alimentation_eau"},
    ))
    examples.append(training_pair(
        "vendor",
        "Quel pourcentage de produits litière/hygiène n'ont aucune vente ?",
        _cat_zero_sold_answer(cats, "litiere_hygiene"),
        "percentage",
        {"category": "litiere_hygiene"},
    ))

    # --- CLIENT ---
    examples.append(training_pair(
        "client",
        "Quels produits ont le plus de listes de souhaits (populaires) ?",
        "Top souhaits clients :\n" + "\n".join(
            f"• {p['title']} — {fmt_num(p['wished'])} souhaits ({fmt_num(p['sold'])} ventes)"
            for p in k["top_wished"][:5]
        ),
        "ranking",
    ))
    examples.append(training_pair(
        "client",
        "Quels accessoires sont les mieux notés avec beaucoup de ventes ?",
        "Produits populaires et bien notés (≥100 ventes) :\n" + "\n".join(
            f"• ★ {p['star']} — {p['title']} ({fmt_num(p['sold'])} ventes)"
            for p in k["top_rated_popular"][:5]
        ),
        "average",
    ))

    # --- ANALYST ---
    examples.append(training_pair(
        "analyst",
        "Répartition du catalogue par catégorie en pourcentage",
        _category_distribution_answer(cats, k["total_products"]),
        "percentage",
    ))
    examples.append(training_pair(
        "analyst",
        "Corrélation souhaits vs ventes : total wished et total sold",
        f"Total wishedCount : **{fmt_num(k['total_wished'])}** | Total ventes estimées : **{fmt_num(k['total_sold_units_est'])}** | Ratio global : **{round(k['total_wished'] / max(k['total_sold_units_est'], 1), 2)}** souhaits par unité vendue.",
        "ratio",
    ))
    examples.append(training_pair(
        "analyst",
        "Quel pourcentage du catalogue a une note inférieure à 3 étoiles ?",
        f"**{k['products_star_lt_3_pct']}%** des produits notés sont sous 3★. **{k['no_rating_pct']}%** n'ont aucune note (0.0).",
        "percentage",
    ))

    # --- MARKETING ---
    examples.append(training_pair(
        "marketing",
        "Quelle catégorie génère le plus de demande (wishedCount) ?",
        _top_category_by_wishes(cats),
        "sum",
    ))
    examples.append(training_pair(
        "marketing",
        "Quel pourcentage de produits ont une excellente réputation (≥4,5★) ?",
        f"**{k['products_star_ge_4_5_pct']}%** du catalogue atteint ≥4,5★ — argument fort pour campagnes « best sellers ».",
        "percentage",
    ))

    # --- MODERATOR ---
    low_rated = [p for p in products if p.has_rating and p.average_star < 2.5 and p.sold_units > 50]
    examples.append(training_pair(
        "moderator",
        "Quels produits vendus mais mal notés (<2,5★) méritent une modération ?",
        ("Produits à surveiller :\n" + "\n".join(
            f"• ★ {p.average_star} — {p.title[:70]} ({fmt_num(p.sold_units)} ventes)"
            for p in sorted(low_rated, key=lambda x: -x.sold_units)[:8]
        )) if low_rated else "Aucun produit avec ventes >50 et note <2,5★ dans ce lot.",
        "filter",
    ))

    # --- LIVREUR (volume / catégories lourdes) ---
    examples.append(training_pair(
        "livreur",
        "Quelles catégories représentent le plus de références (volume colis potentiel) ?",
        _category_distribution_answer(cats, k["total_products"]),
        "count",
    ))

    # Variantes questions naturelles par KPI type
    examples.extend(_question_variants(k, cats))
    return expand_training_corpus(kpis, products, examples)


def _cat_answer(cats: dict, key: str) -> str:
    c = cats.get(key)
    if not c:
        return f"Catégorie « {key} » introuvable."
    return f"Catégorie **{key.replace('_', ' ')}** : **{fmt_num(c['count'])}** produits (**{c['share_pct']}%** du catalogue), ventes estimées **{fmt_num(c['total_sold_est'])}**, souhaits **{fmt_num(c['total_wished'])}**."


def _cat_star_answer(cats: dict, key: str) -> str:
    c = cats.get(key)
    if not c:
        return f"Catégorie « {key} » introuvable."
    return f"Note moyenne catégorie **{key.replace('_', ' ')}** : **{c['avg_star']}/5** ({c['rated_pct']}% des fiches sont notées). Benchmark marché : viser ≥4,5★."


def _cat_zero_sold_answer(cats: dict, key: str) -> str:
    c = cats.get(key)
    if not c:
        return f"Catégorie « {key} » introuvable."
    return f"**{c['zero_sold_pct']}%** des produits **{key.replace('_', ' ')}** n'ont aucune vente enregistrée ({fmt_num(c['count'])} références)."


def _category_distribution_answer(cats: dict, total: int) -> str:
    lines = [f"Répartition sur {fmt_num(total)} produits :"]
    for cat, c in sorted(cats.items(), key=lambda x: -x[1]["count"]):
        lines.append(f"• {cat.replace('_', ' ')} : {c['count']} ({c['share_pct']}%)")
    return "\n".join(lines)


def _top_category_by_wishes(cats: dict) -> str:
    if not cats:
        return "Données insuffisantes."
    best = max(cats.items(), key=lambda x: x[1]["total_wished"])
    name, c = best
    return f"La catégorie **{name.replace('_', ' ')}** cumule **{fmt_num(c['total_wished'])}** souhaits ({c['share_pct']}% du catalogue, {fmt_num(c['count'])} SKU)."


def _question_variants(k: dict, cats: dict) -> list[dict]:
    """Variantes linguistiques pour entraînement NLU/KPI."""
    out = []
    templates = [
        ("admin", "Somme totale du stock (quantity)", f"Stock catalogue total : **{fmt_num(k['total_stock_units'])}** unités | Moyenne par SKU : **{fmt_num(k['avg_stock'])}**.", "sum"),
        ("admin", "Pourcentage de rupture stock quantity=0", f"**{k['zero_stock_pct']}%** des fiches ont quantity=0.", "percentage"),
        ("vendor", "Moyenne des ventes par produit dans mon catalogue", f"Moyenne **{k['avg_sold_per_product']}** ventes/SKU | Médiane **{fmt_num(k['median_sold'])}**.", "average"),
        ("client", "Produit le plus vendu du catalogue ?", f"**{k['top_sold'][0]['title']}** avec environ **{fmt_num(k['top_sold'][0]['sold'])}** ventes.", "max"),
        ("analyst", "Moyenne wishedCount par produit", f"Moyenne : **{k['avg_wished']}** souhaits par fiche | Total : **{fmt_num(k['total_wished'])}**.", "average"),
        ("marketing", "Catégorie colliers/harnais : KPI synthèse", _cat_answer(cats, "colliers_harnais"), "composite"),
        ("marketing", "Catégorie lits/niches : KPI synthèse", _cat_answer(cats, "lits_niches"), "composite"),
    ]
    for role, q, a, t in templates:
        out.append(training_pair(role, q, a, t))
    return out


def build_kpi_catalog(kpis: dict) -> dict:
    """Catalogue d'expressions KPI formelles pour le moteur chatbot."""
    return {
        "platform": "PetfoodTN",
        "dataset_columns": {
            "title": "string — libellé produit",
            "averageStar": "float 0-5 — 0.0 = pas d'avis",
            "quantity": "int — stock affiché marketplace",
            "tradeAmount": "string — ventes textuelles (ex: '1,000+ sold')",
            "wishedCount": "int — listes de souhaits",
        },
        "derived_fields": {
            "sold_units": "parse(tradeAmount) → int, '+' = minimum",
            "category": "inférée par mots-clés titre",
            "has_rating": "averageStar > 0",
            "conversion_wish_ratio": "wishedCount / sold_units",
        },
        "kpi_types": {
            "count": ["total_products", "zero_sold_count", "by_category.count"],
            "sum": ["total_sold_units_est", "total_wished", "total_stock_units", "by_category.total_sold_est"],
            "average": ["avg_star_all", "avg_star_rated_only", "avg_sold_per_product", "avg_wished", "avg_stock", "by_category.avg_star"],
            "percentage": ["zero_sold_pct", "rated_products_pct", "products_star_ge_4_5_pct", "products_star_lt_3_pct", "no_rating_pct", "zero_stock_pct", "by_category.share_pct", "by_category.zero_sold_pct"],
            "ratio": ["conversion_wish_ratio", "total_wished / total_sold_units_est"],
            "ranking": ["top_sold", "top_wished", "top_rated_popular"],
            "median": ["median_sold"],
        },
        "actors": {
            "admin": ["count", "sum", "percentage", "ranking", "average"],
            "vendor": ["average", "percentage", "ranking", "by_category"],
            "client": ["ranking", "average", "filter star>=4.5"],
            "analyst": ["percentage", "ratio", "distribution", "correlation"],
            "marketing": ["sum wished", "percentage", "top categories"],
            "moderator": ["filter low star + high sold", "no_rating_pct"],
            "livreur": ["category volume", "count"],
        },
        "computed_snapshot": kpis,
        "nl_question_patterns_fr": [
            "combien de {metric}",
            "quel est le pourcentage de {metric}",
            "quelle est la moyenne {metric}",
            "somme totale {metric}",
            "top {n} {metric}",
            "répartition par catégorie",
            "produits sans vente",
            "produits les mieux notés",
            "liste de souhaits",
        ],
    }


def save_clean_csv(products: list[ProductRow]) -> None:
    CLEAN_CSV.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "title", "average_star", "quantity", "trade_amount_raw", "wished_count",
        "sold_units", "sold_is_estimate", "category", "has_rating", "conversion_wish_ratio",
    ]
    with CLEAN_CSV.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for p in products:
            w.writerow(asdict(p))


def main() -> None:
    print("Chargement CSV brut...")
    raw = load_raw_rows()
    print(f"  -> {len(raw)} lignes brutes")

    products = clean_rows(raw)
    print(f"  -> {len(products)} produits uniques apres nettoyage")

    kpis = compute_kpis(products)
    examples = build_training_examples(kpis, products)
    catalog = build_kpi_catalog(kpis)

    save_clean_csv(products)
    kpis["generatedAt"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"
    kpi_blob = json.dumps(kpis, ensure_ascii=False, indent=2)
    KPI_JSON.write_text(kpi_blob, encoding="utf-8")
    BACKEND_KPI_JSON.parent.mkdir(parents=True, exist_ok=True)
    BACKEND_KPI_JSON.write_text(kpi_blob, encoding="utf-8")
    FRONTEND_KPI_JSON = ROOT / "src" / "data" / "marketplaceKpiSummary.json"
    FRONTEND_KPI_JSON.parent.mkdir(parents=True, exist_ok=True)
    FRONTEND_KPI_JSON.write_text(kpi_blob, encoding="utf-8")

    TRAIN_JSONL.parent.mkdir(parents=True, exist_ok=True)
    with TRAIN_JSONL.open("w", encoding="utf-8") as f:
        for ex in examples:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

    CATALOG_JSON.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Ecrit : {CLEAN_CSV}")
    print(f"Ecrit : {KPI_JSON}")
    print(f"Ecrit : {BACKEND_KPI_JSON}")
    print(f"Ecrit : {FRONTEND_KPI_JSON}")
    print(f"Ecrit : {TRAIN_JSONL} ({len(examples)} exemples)")
    print(f"Ecrit : {CATALOG_JSON}")
    print("\n--- Apercu KPI ---")
    print(f"Produits: {kpis['total_products']} | Note moy. (notés): {kpis['avg_star_rated_only']}")
    print(f"Ventes totales est.: {kpis['total_sold_units_est']:,} | Sans vente: {kpis['zero_sold_pct']}%")
    print(f"Top catégories: {list(kpis['category_distribution'].keys())[:5]}")


if __name__ == "__main__":
    main()
