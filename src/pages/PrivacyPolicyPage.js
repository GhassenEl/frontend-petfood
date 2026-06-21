import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

const SECTIONS = [
  {
    title: '1. Responsable du traitement',
    body: `PetfoodTN (plateforme e-commerce et services vétérinaires pour animaux de compagnie) est responsable du traitement des données personnelles collectées via le site et l'application.

Contact : contact@petfoodtn.tn — Délégué à la protection des données : dpo@petfoodtn.tn`,
  },
  {
    title: '2. Données collectées',
    body: `Nous pouvons traiter : identité et coordonnées (nom, e-mail, téléphone, adresse), données de compte et authentification, historique de commandes et facturation, profil animal (espèce, âge, préférences), avis et messages, données IoT (avec consentement explicite), journaux techniques (IP, navigateur, pages visitées de façon agrégée).`,
  },
  {
    title: '3. Finalités',
    body: `Gestion des comptes et commandes, livraison, support client, recommandations personnalisées, sécurité et prévention de la fraude, amélioration du service, obligations légales et comptables, communications marketing (avec consentement).`,
  },
  {
    title: '4. Base légale',
    body: `Exécution du contrat (commandes, compte), intérêt légitime (sécurité, amélioration du service), consentement (cookies non essentiels, marketing, caméra IoT), obligation légale (facturation, conservation comptable).`,
  },
  {
    title: '5. Durée de conservation',
    body: `Données de compte : durée de la relation contractuelle + 3 ans. Factures : 10 ans. Cookies : selon la politique cookies (jusqu'à 12 mois pour les préférences). Journaux de sécurité : 12 mois maximum.`,
  },
  {
    title: '6. Vos droits',
    body: `Conformément à la loi tunisienne sur la protection des données personnelles et aux bonnes pratiques RGPD, vous disposez des droits d'accès, rectification, effacement, limitation, opposition et portabilité lorsque applicable.

Exercez vos droits via contact@petfoodtn.tn ou depuis Mon profil. Réponse sous 30 jours.`,
  },
  {
    title: '7. Cookies et traceurs',
    body: `Des cookies essentiels sont nécessaires à la connexion. Les cookies de préférences, analytique et marketing ne sont déposés qu'avec votre accord via la bannière cookies.`,
    link: { to: '/cookies', label: 'Consulter la politique cookies →' },
  },
  {
    title: '8. Sous-traitants et transferts',
    body: `Hébergement, paiement (Stripe), messagerie et outils d'analyse peuvent traiter des données pour notre compte, dans le cadre de contrats encadrés. Aucun transfert hors Tunisie / UE sans garanties appropriées.`,
  },
  {
    title: '9. Sécurité',
    body: `Chiffrement HTTPS, authentification JWT, contrôle d'accès par rôle (RBAC), journalisation des actions sensibles et sauvegardes régulières.`,
  },
  {
    title: '10. Mise à jour',
    body: `Dernière mise à jour : juin 2026. Toute modification substantielle sera signalée sur le site.`,
  },
];

const PrivacyPolicyPage = () => (
  <div className="legal-page">
    <header className="legal-page__hero">
      <Link to="/login" className="legal-page__back">← Retour connexion</Link>
      <h1>Politique de confidentialité</h1>
      <p>
        Comment PetfoodTN collecte, utilise et protège vos données personnelles
        et celles liées à vos animaux.
      </p>
    </header>

    <main className="legal-page__content">
      {SECTIONS.map((section) => (
        <section key={section.title} className="legal-page__section">
          <h2>{section.title}</h2>
          <p>{section.body}</p>
          {section.link && (
            <Link to={section.link.to} className="legal-page__inline-link">
              {section.link.label}
            </Link>
          )}
        </section>
      ))}
    </main>

    <footer className="legal-page__footer">
      <Link to="/cookies">Politique cookies</Link>
      <Link to="/compliance">Conformité ISO</Link>
      <Link to="/contact">Nous contacter</Link>
    </footer>
  </div>
);

export default PrivacyPolicyPage;
