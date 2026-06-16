import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, MapPin, Phone, Navigation, Video, CheckCircle } from 'lucide-react';
import VetNearbyMap from './VetNearbyMap';

const IntelligentVetSearchPanel = ({
  vets = [],
  summary = '',
  availableCount = 0,
  clientCenter = null,
  onRefreshGps,
}) => {
  const [selectedVetId, setSelectedVetId] = useState(vets[0]?.id || null);

  useEffect(() => {
    if (vets[0]?.id && !vets.find((v) => v.id === selectedVetId)) {
      setSelectedVetId(vets[0].id);
    }
  }, [vets, selectedVetId]);

  const selected = vets.find((v) => v.id === selectedVetId) || vets[0];

  const openMaps = (vet) => {
    if (!vet?.lat || !vet?.lng) return;
    window.open(
      `https://www.google.com/maps?q=${vet.lat},${vet.lng}(${encodeURIComponent(vet.name || 'Vétérinaire')})`,
      '_blank'
    );
  };

  if (!vets.length) {
    return (
      <div className="geo-card">
        <p className="geo-muted">Aucun vétérinaire partenaire trouvé dans votre zone.</p>
        <Link to="/client-profile" className="geo-link">Renseignez votre région →</Link>
      </div>
    );
  }

  return (
    <div className="geo-vets">
      <div className="geo-vets__header">
        <Stethoscope size={22} aria-hidden />
        <div>
          <h3>Recherche intelligente</h3>
          <p className="geo-muted">{summary}</p>
          {availableCount > 0 && (
            <p className="geo-available">
              <CheckCircle size={14} aria-hidden /> {availableCount} disponible(s) maintenant
            </p>
          )}
        </div>
        {onRefreshGps && (
          <button type="button" className="geo-btn geo-btn--ghost" onClick={onRefreshGps}>
            Actualiser GPS
          </button>
        )}
      </div>

      <VetNearbyMap
        vets={vets}
        clientCenter={clientCenter}
        selectedVetId={selectedVetId}
        onSelectVet={setSelectedVetId}
        height={360}
      />

      {selected && (
        <article className="geo-card geo-vet-hero">
          <div className="geo-vet-badges">
            {selected.recommended && <span className="geo-badge geo-badge--ai">Recommandé IA</span>}
            {selected.availableNow && <span className="geo-badge geo-badge--ok">Disponible</span>}
            {selected.teleconsult && <span className="geo-badge"><Video size={12} /> Téléconsult</span>}
            {selected.intelligenceScore != null && (
              <span className="geo-badge">Score {selected.intelligenceScore}/100</span>
            )}
          </div>
          <h4>{selected.name}</h4>
          {selected.region && <p className="geo-region">{selected.region}</p>}
          {(selected.matchReasons || []).length > 0 && (
            <p className="geo-reasons">{selected.matchReasons.join(' · ')}</p>
          )}
          {selected.address && (
            <p className="geo-line"><MapPin size={14} aria-hidden /> {selected.address}</p>
          )}
          {selected.phone && (
            <p className="geo-line">
              <Phone size={14} aria-hidden />
              <a href={`tel:${selected.phone}`}>{selected.phone}</a>
            </p>
          )}
          {selected.distance != null && (
            <p className="geo-distance">≈ {selected.distance} km</p>
          )}
          <div className="geo-actions">
            <button type="button" className="geo-btn geo-btn--primary" onClick={() => openMaps(selected)}>
              <Navigation size={16} aria-hidden /> Itinéraire
            </button>
            <Link to="/veterinary" className="geo-link">Prendre RDV →</Link>
            <Link to="/client-teleconsult" className="geo-link">Téléconsultation →</Link>
          </div>
        </article>
      )}

      <div className="geo-vet-list">
        <h4 className="geo-subtitle">Tous les résultats (tri IA)</h4>
        {vets.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`geo-vet-row${selectedVetId === v.id ? ' geo-vet-row--active' : ''}`}
            onClick={() => setSelectedVetId(v.id)}
          >
            <div>
              <strong>{v.name}</strong>
              {v.availableNow && <span className="geo-dot-ok" title="Disponible" />}
              <div className="geo-muted">
                {v.distance != null ? `${v.distance} km` : v.region}
                {v.intelligenceScore != null ? ` · ${v.intelligenceScore} pts` : ''}
              </div>
            </div>
            <span className="geo-chevron">›</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default IntelligentVetSearchPanel;
