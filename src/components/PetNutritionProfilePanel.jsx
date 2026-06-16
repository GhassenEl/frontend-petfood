import React from 'react';
import { Activity, Heart, History, Stethoscope } from 'lucide-react';

const PetNutritionProfilePanel = ({ data, loading }) => {
  if (loading) return <p className="an-loading">Chargement du profil nutritionnel…</p>;
  if (!data?.nutritionProfile) return <p className="an-empty">Sélectionnez un animal.</p>;

  const profile = data.nutritionProfile;

  return (
    <div className="an-profile">
      <p className="an-ai-summary">{profile.aiSummary}</p>

      <div className="an-profile-score">
        <strong>{profile.profileScore}/100</strong>
        <span>Complétude du profil nutritionnel</span>
      </div>

      <div className="an-profile-grid">
        <div className="an-profile-card">
          <Activity size={20} color="#ea580c" />
          <h4>Besoins énergétiques</h4>
          <ul>
            <li><strong>{profile.energyNeeds.dailyKcal ?? '—'}</strong> kcal / jour</li>
            <li><strong>{profile.energyNeeds.dailyGrams ?? '—'}</strong> g / jour</li>
            <li>Stade : {profile.energyNeeds.lifeStage || '—'}</li>
            <li>Objectif : {profile.energyNeeds.goal || 'maintien'}</li>
          </ul>
        </div>

        <div className="an-profile-card">
          <Heart size={20} color="#ec4899" />
          <h4>Préférences alimentaires</h4>
          <ul>
            {profile.preferences.map((p) => (
              <li key={p.id}>{p.label}</li>
            ))}
          </ul>
        </div>

        <div className="an-profile-card">
          <History size={20} color="#0ea5e9" />
          <h4>Historique consommations</h4>
          {profile.consumptionSummary.entries ? (
            <ul>
              <li>{profile.consumptionSummary.entries} repas enregistrés</li>
              <li>Moy. {profile.consumptionSummary.avgDailyGrams ?? '—'} g / jour</li>
              {profile.consumptionSummary.adherence != null && (
                <li>Adhérence ~{Math.round(profile.consumptionSummary.adherence * 100)} %</li>
              )}
            </ul>
          ) : (
            <p className="an-muted">Aucun historique — consultez le journal alimentaire.</p>
          )}
        </div>

        <div className="an-profile-card">
          <Stethoscope size={20} color="#059669" />
          <h4>Recommandations vétérinaires</h4>
          <ul className="an-vet-recs">
            {profile.vetRecommendations.map((r) => (
              <li key={r.id}>
                <strong>{r.source}</strong>
                <p>{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PetNutritionProfilePanel;
