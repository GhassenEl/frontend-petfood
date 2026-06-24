# PetfoodTN — Comptes d'accès (démo / développement)

> **Attention** : ne pas utiliser ces mots de passe en production.  
> Comptes créés par le seed backend (`RUN_SEED=true`).

| Paramètre | Valeur |
|-----------|--------|
| **Application** | http://localhost:3001 |
| **Connexion** | `/login` |
| **Source code** | `src/config/demoAccounts.js` |

---

## Comptes principaux (tous les acteurs)

| Acteur | Nom | Email | Mot de passe | Accueil après login |
|--------|-----|-------|--------------|---------------------|
| ⚙️ **Administrateur** | Ghassen Admin | `admin@petfood.tn` | `PetfoodTN2024!` | `/admin/dashboard` |
| 🐾 **Client** | Sami Ben Ali | `client@petfood.tn` | `MonChat123!` | `/client-products` |
| 🩺 **Vétérinaire** | Dr. Amira Khelifi | `vet@petfood.tn` | `Vet2024!` | `/vet/dashboard` |
| 🛵 **Livreur** | Karim Mansouri | `livreur@petfood.tn` | `Livreur123!` | `/livreur/dashboard` |
| 🏬 **Vendeur** | Leila Mansouri | `vendor@petfood.tn` | `Vendor2024!` | `/vendor/dashboard` |
| 🛡️ **Modérateur** | Nour Modération | `moderator@petfood.tn` | `Moderator2024!` | `/moderator/dashboard` |
| 📞 **Service client** | Sonia Service Client | `support@petfood.tn` | `Support2024!` | `/support/dashboard` *(créer via admin)* |

---

## Visiteur (sans login)

| Acteur | Accès |
|--------|--------|
| 👀 **Visiteur** | `/visitor` — catalogue, conseils, inscription. **Aucun email / mot de passe requis.** |

---

## Comptes secondaires (optionnels)

| Rôle | Nom | Email | Mot de passe |
|------|-----|-------|--------------|
| Client | Amina Ben Ali | `amina@petfood.tn` | `Amina2024!` |
| Client | Youssef Trabelsi | `youssef@petfood.tn` | `Youssef2024!` |
| Livreur | Sami Livreur | `sami.livreur@petfood.tn` | `SamiLivreur2024!` |

---

## Générer le PDF

```bash
node scripts/export-access-pdf.mjs
```

Fichier produit : `PetfoodTN-Comptes-Acces.pdf` (racine du projet).

---

## Rappel sécurité

- Changer tous les mots de passe avant mise en production.
- Ne pas committer de fichiers `.env` contenant de vrais secrets.
- L'admin unique de référence : `admin@petfood.tn`.
