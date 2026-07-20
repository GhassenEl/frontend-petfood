import React, { useMemo, useState } from 'react';
import { Phone, MapPin, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import {
  DEMO_HOME_CLINIC,
  DEMO_EMERGENCY_VETS_BY_REGION,
  getClinicOpenStatus,
  resolveEmergencyRegion,
  buildAiSuggestions,
} from '../utils/vetEmergencyAfterHours';

/**
 * Panneau : agent IA urgences hors horaires —
 * numéro cabinet + vétos par région + suggestions.
 */
const VetAfterHoursEmergencyPanel = ({
  clinic = DEMO_HOME_CLINIC,
  clinicStatus: clinicStatusProp = null,
  region = '',
  onAskAssistant,
}) => {
  const [selectedRegion, setSelectedRegion] = useState(region || 'Grand Tunis');
  const [symptomHint, setSymptomHint] = useState('urgence sang');

  const status = clinicStatusProp || getClinicOpenStatus(clinic);
  const regionBlock = useMemo(
    () => resolveEmergencyRegion(selectedRegion, selectedRegion),
    [selectedRegion],
  );
  const suggestions = useMemo(
    () => buildAiSuggestions(symptomHint, null),
    [symptomHint],
  );

  return (
    <section className="vetintel-afterhours" aria-label="Urgences hors horaires">
      <header className="vetintel-afterhours__head">
        <AlertTriangle size={20} aria-hidden />
        <div>
          <h2>Agent IA — urgences (cabinet fermé)</h2>
          <p>
            Quand le cabinet n&apos;est pas ouvert : numéro d&apos;accueil, vétérinaires
            d&apos;astreinte selon votre région, et suggestions IA en attendant l&apos;appel.
          </p>
        </div>
      </header>

      <div className={`vetintel-afterhours__status${status.isOpen ? ' is-open' : ' is-closed'}`}>
        <Clock size={16} aria-hidden />
        <span>{status.reason}</span>
      </div>

      <div className="vetintel-afterhours__grid">
        <article className="vetintel-card vetintel-afterhours__clinic">
          <h3>Cabinet</h3>
          <p className="vetintel-afterhours__name">{clinic.name}</p>
          <p className="vetintel-muted">{clinic.address}</p>
          <a className="vetintel-afterhours__tel" href={`tel:${clinic.phone}`}>
            <Phone size={16} aria-hidden /> Accueil {clinic.phone}
          </a>
          {clinic.emergencyPhone && (
            <a className="vetintel-afterhours__tel vetintel-afterhours__tel--urgent" href={`tel:${clinic.emergencyPhone}`}>
              <Phone size={16} aria-hidden /> Urgences 24h {clinic.emergencyPhone}
            </a>
          )}
        </article>

        <article className="vetintel-card vetintel-afterhours__region">
          <h3>
            <MapPin size={16} aria-hidden /> Vétérinaires par région
          </h3>
          <label className="vetintel-select">
            <span>Région</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {DEMO_EMERGENCY_VETS_BY_REGION.map((r) => (
                <option key={r.region} value={r.region}>{r.region}</option>
              ))}
            </select>
          </label>
          <ul className="vetintel-afterhours__list">
            {regionBlock.vets.map((v) => (
              <li key={v.phone}>
                <strong>{v.name}</strong>
                <a href={`tel:${v.phone}`}>{v.phone}</a>
                {v.note && <span className="vetintel-muted">{v.note}</span>}
              </li>
            ))}
          </ul>
          {regionBlock.clinicPhone && (
            <a className="vetintel-afterhours__tel" href={`tel:${regionBlock.clinicPhone}`}>
              <Phone size={16} aria-hidden /> Standard région {regionBlock.clinicPhone}
            </a>
          )}
        </article>

        <article className="vetintel-card vetintel-afterhours__ai">
          <h3>
            <Sparkles size={16} aria-hidden /> Suggestions IA
          </h3>
          <label className="vetintel-select">
            <span>Type de cas</span>
            <select value={symptomHint} onChange={(e) => setSymptomHint(e.target.value)}>
              <option value="urgence sang">Saignement / plaie</option>
              <option value="convulsion crise">Convulsions</option>
              <option value="empoison chocolat">Suspicion d&apos;empoisonnement</option>
              <option value="ne respire étouffe">Détresse respiratoire</option>
              <option value="accident fracture">Trauma / accident</option>
              <option value="vomit diarrhée">Vomissements / diarrhée</option>
            </select>
          </label>
          <ul className="vetintel-afterhours__tips">
            {suggestions.slice(1).map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          {typeof onAskAssistant === 'function' && (
            <button
              type="button"
              className="vetintel-btn vetintel-btn--primary"
              onClick={() =>
                onAskAssistant(
                  `Urgence : ${symptomHint}. Cabinet fermé. Région ${selectedRegion}.`,
                )
              }
            >
              Poser à l&apos;assistant IA →
            </button>
          )}
        </article>
      </div>
    </section>
  );
};

export default VetAfterHoursEmergencyPanel;
