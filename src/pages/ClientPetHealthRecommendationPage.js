import React from 'react';
import { Link } from 'react-router-dom';
import PetHealthRecommendationPanel from '../components/PetHealthRecommendationPanel';
import './ClientPetHealthRecommendationPage.css';

const ClientPetHealthRecommendationPage = () => (
  <div className="phr-page">
    <header className="phr-page-hero">
      <p className="phr-page-hero__eyebrow">IA SANTÉ ANIMALE</p>
      <h1>🩺 Recommandations symptômes &amp; traitements</h1>
      <p>
        Détection intelligente des symptômes, maladies chroniques et proposition de médicaments,
        vaccins, gélules et compléments adaptés à votre animal.
      </p>
      <div className="phr-page-hero__links">
        <Link to="/client-vet-intelligence">IA vétérinaire</Link>
        <Link to="/client-iot?tab=wearable">Colliers santé</Link>
        <Link to="/client-recommendations">Recommandations produits</Link>
      </div>
    </header>
    <PetHealthRecommendationPanel />
  </div>
);

export default ClientPetHealthRecommendationPage;
