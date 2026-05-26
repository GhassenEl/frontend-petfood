# TODO: Fix recommandations (chat assistant)

## Done
- backend/controllers/chat.controller.js
  - Harmonisé le format des objets `products` renvoyés par le chat pour matcher l’UI (`product.reason` et `product.icon`).

## Pending
- Remplacer le champ `reason/recommendedReason` si nécessaire côté UI (selon le comportement réel observé).
- Valider sur navigateur : taper "Voir les promotions" / "Recommandations" et vérifier l’affichage des cartes (raison + prix + ajout panier).

