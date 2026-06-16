import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Phone, Navigation, Video, CheckCircle } from 'lucide-react';
import { VET_SPECIALTY_LABELS } from '../utils/intelligentVetMarketplace';

const IntelligentVetMarketplacePanel = ({
  vets = [],
  summary = '',
  specialties = [],
  onSpecialtyChange,
  selectedSpecialty = '',
}) => {
  const [selectedId, setSelectedId] = useState(vets[0]?.id || null);
  const selected = vets.find((v) => v.id === selectedId) || vets[0];

  const openMaps = (vet) => {
    if (!vet?.lat || !vet?.lng) return;
    window.open(
      `https://www.google.com/maps?q=${vet.lat},${vet.lng}(${encodeURIComponent(vet.name)})`,
      '_blank',
    );
  };

  return (
    <div className="vetintel-market">
      <p className="vetintel-summary">{summary}</p>

      <div className="vetintel-filter-row">
        <button
          type="button"
          className={`vetintel-filter${!selectedSpecialty ? ' vetintel-filter--active' : ''}`}
          onClick={() => onSpecialtyChange?.('')}
        >
          Toutes spécialités
        </button>
        {specialties.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`vetintel-filter${selectedSpecialty === s.id ? ' vetintel-filter--active' : ''}`}
            onClick={() => onSpecialtyChange?.(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {selected && (
        <article className="vetintel-card vetintel-vet-hero">
          {selected.topPick && <span className="vetintel-badge vetintel-badge--top">Meilleur match IA</span>}
          <h3>{selected.name}</h3>
          <div className="vetintel-vet-meta">
            {selected.rating_avg != null && (
              <span><Star size={14} aria-hidden /> {selected.rating_avg}/5 ({selected.rating_count || 0} avis)</span>
            )}
            {selected.distance != null && <span><MapPin size={14} aria-hidden /> {selected.distance} km</span>}
            {selected.availableNow && (
              <span className="vetintel-avail"><CheckCircle size={14} aria-hidden /> Disponible</span>
            )}
            <span className="vetintel-score">Score {selected.marketplaceScore}/100</span>
          </div>
          {(selected.matchReasons || []).length > 0 && (
            <p className="vetintel-reasons">{selected.matchReasons.join(' · ')}</p>
          )}
          <div className="vetintel-spec-tags">
            {(selected.specialties || []).map((s) => (
              <span key={s}>{VET_SPECIALTY_LABELS[s] || s}</span>
            ))}
          </div>
          <div className="vetintel-actions">
            <button type="button" className="vetintel-btn vetintel-btn--primary" onClick={() => openMaps(selected)}>
              <Navigation size={16} aria-hidden /> Itinéraire
            </button>
            {selected.phone && (
              <a href={`tel:${selected.phone}`} className="vetintel-btn vetintel-btn--ghost">
                <Phone size={16} aria-hidden /> Appeler
              </a>
            )}
            {selected.teleconsult && (
              <Link to="/client-teleconsult" className="vetintel-btn vetintel-btn--ghost">
                <Video size={16} aria-hidden /> Téléconsult
              </Link>
            )}
            <Link to="/veterinary" className="vetintel-link">Prendre RDV →</Link>
          </div>
        </article>
      )}

      <div className="vetintel-vet-list">
        <h4>Classement marketplace</h4>
        {vets.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`vetintel-vet-row${selectedId === v.id ? ' vetintel-vet-row--active' : ''}`}
            onClick={() => setSelectedId(v.id)}
          >
            <div>
              <strong>{v.name}</strong>
              {v.topPick && <span className="vetintel-mini-top"> ★ Top</span>}
              <div className="vetintel-muted">
                {v.rating_avg}/5 · {v.distance} km · {v.marketplaceScore} pts
              </div>
            </div>
            {v.availableNow && <span className="vetintel-dot-ok" title="Disponible" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IntelligentVetMarketplacePanel;
