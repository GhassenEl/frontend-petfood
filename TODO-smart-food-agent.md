# TODO - Smart Food Smart Agent (avatar + régime personnalisé)

- [ ] Ajouter nouvelle route client : `/smart-food-agent`
- [ ] Créer page `src/pages/SmartFoodAgentPage.js` (UI avatar + owner + pets + nutrition + vaccins/medicaments/accessoires)
- [ ] Créer composant `src/components/SmartAgentAvatar.js` (avatar image + fallback)
- [ ] Étendre `src/components/ChatAssistant.js` pour envoyer `context` (owner/pets) au backend lors de `sendMessage`
- [ ] Ajouter intégration UI : CTA “Générer régime” qui envoie un message structuré à l’IA
- [ ] Ajouter logique d’affichage : si réponse contient demande validation véto => bouton “Contacter vétérinaire”
- [ ] Ajouter navigation : lien dans `src/components/ClientSidebar.js` (et/ou Header)
- [ ] Vérifier compilation `npm run dev` / `npm run build`