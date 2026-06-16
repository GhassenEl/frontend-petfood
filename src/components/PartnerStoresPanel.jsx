import React, { useState } from 'react';
import { Store, MapPin, Phone, Clock, Navigation } from 'lucide-react';
import PartnerStoresMap from './PartnerStoresMap';

const PartnerStoresPanel = ({ stores = [], clientCenter = null }) => {
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.id || null);
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = typeFilter ? stores.filter((s) => s.type === typeFilter) : stores;
  const selected = filtered.find((s) => s.id === selectedStoreId) || filtered[0];

  const types = [...new Set(stores.map((s) => s.type).filter(Boolean))];

  const openMaps = (store) => {
    if (!store?.lat || !store?.lng) return;
    window.open(
      `https://www.google.com/maps?q=${store.lat},${store.lng}(${encodeURIComponent(store.name || 'Partenaire')})`,
      '_blank'
    );
  };

  return (
    <div className="geo-stores">
      <div className="geo-stores__header">
        <Store size={22} aria-hidden />
        <div>
          <h3>Carte interactive des partenaires</h3>
          <p className="geo-muted">
            {stores.length} point(s) de vente et partenaires PetfoodTN autour de vous.
          </p>
        </div>
      </div>

      {types.length > 1 && (
        <div className="geo-filter-row">
          <button
            type="button"
            className={`geo-filter-btn${!typeFilter ? ' geo-filter-btn--active' : ''}`}
            onClick={() => setTypeFilter('')}
          >
            Tous
          </button>
          {types.map((t) => (
            <button
              key={t}
              type="button"
              className={`geo-filter-btn${typeFilter === t ? ' geo-filter-btn--active' : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t === 'pet_shop' ? '🏪 Animaleries' : t === 'vet_clinic' ? '🩺 Cliniques' : '📦 Relais'}
            </button>
          ))}
        </div>
      )}

      <PartnerStoresMap
        stores={filtered}
        clientCenter={clientCenter}
        selectedStoreId={selectedStoreId}
        onSelectStore={setSelectedStoreId}
        height={380}
      />

      {selected && (
        <article className="geo-card geo-store-hero">
          <span className="geo-badge">{selected.typeIcon || '🏪'} {selected.typeLabel || 'Partenaire'}</span>
          <h4>{selected.name}</h4>
          {selected.address && (
            <p className="geo-line"><MapPin size={14} aria-hidden /> {selected.address}</p>
          )}
          {selected.phone && (
            <p className="geo-line"><Phone size={14} aria-hidden /> {selected.phone}</p>
          )}
          {selected.hours && (
            <p className="geo-line"><Clock size={14} aria-hidden /> {selected.hours}</p>
          )}
          {selected.distanceKm != null && (
            <p className="geo-distance">≈ {selected.distanceKm} km</p>
          )}
          <button type="button" className="geo-btn geo-btn--primary" onClick={() => openMaps(selected)}>
            <Navigation size={16} aria-hidden /> Itinéraire
          </button>
        </article>
      )}

      <div className="geo-store-list">
        {filtered.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`geo-store-row${selectedStoreId === s.id ? ' geo-store-row--active' : ''}`}
            onClick={() => setSelectedStoreId(s.id)}
          >
            <span aria-hidden>{s.typeIcon || '🏪'}</span>
            <div>
              <strong>{s.name}</strong>
              <div className="geo-muted">
                {s.distanceKm != null ? `${s.distanceKm} km` : s.region || s.address}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PartnerStoresPanel;
