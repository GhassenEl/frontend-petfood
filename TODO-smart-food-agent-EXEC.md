# TODO-smart-food-agent-EXEC

- [x] Corriger `src/App.js` : ajouter route `/smart-food-agent` (RoleRoute client) et ne plus rendre `SmartFoodAgentPage2` hors `<Route>`
- [x] Mettre `src/pages/SmartFoodAgentPage.js` fonctionnelle (réutiliser la logique de `SmartFoodAgentPage2.js`)
- [x] Nettoyer/ajuster `src/components/ClientSidebar.js` : supprimer doublons/assurer que `id: smart-food-agent` pointe bien vers `/smart-food-agent`
- [x] Étendre `src/components/ChatAssistant.js` : support `context` et envoi au backend dans `sendMessage`
- [x] Intégrer le CTA “Générer régime” dans `SmartFoodAgentPage` pour envoyer `context` au backend
- [x] Vérifier logique “validation véto” : bouton “Contacter vétérinaire” si demande de validation
- [x] Vérifier compilation `npm run dev` / `npm run build`


