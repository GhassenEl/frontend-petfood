import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TUNIS_CENTER = [36.8065, 10.1815];

const storeIcon = (type, highlight) => {
  const emoji = type === 'vet_clinic' ? '🩺' : type === 'relay' ? '📦' : '🏪';
  const bg = highlight ? '#e67e22' : type === 'vet_clinic' ? '#0f766e' : '#6366f1';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:${bg};
      color:white;display:flex;align-items:center;justify-content:center;
      font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);
      ${highlight ? 'transform:scale(1.15);' : ''}
    ">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!points?.length) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 13 });
  }, [map, points]);
  return null;
};

const PartnerStoresMap = ({
  stores = [],
  clientCenter = null,
  selectedStoreId = null,
  onSelectStore,
  height = 380,
}) => {
  const markers = useMemo(
    () =>
      stores
        .filter((s) => Number.isFinite(Number(s.lat)) && Number.isFinite(Number(s.lng)))
        .map((s) => ({ store: s, position: [Number(s.lat), Number(s.lng)] })),
    [stores]
  );

  const clientPos = useMemo(() => {
    if (!clientCenter?.lat || !clientCenter?.lng) return null;
    return [Number(clientCenter.lat), Number(clientCenter.lng)];
  }, [clientCenter]);

  const allPoints = useMemo(() => {
    const pts = markers.map((m) => m.position);
    if (clientPos) pts.push(clientPos);
    return pts;
  }, [markers, clientPos]);

  const mapCenter = clientPos || markers[0]?.position || TUNIS_CENTER;

  const openMaps = (store) => {
    if (!store?.lat || !store?.lng) return;
    window.open(
      `https://www.google.com/maps?q=${store.lat},${store.lng}(${encodeURIComponent(store.name || 'Partenaire')})`,
      '_blank'
    );
  };

  if (!markers.length) {
    return (
      <div className="geo-map-empty" style={{ height }}>
        Aucun partenaire à afficher sur la carte.
      </div>
    );
  }

  return (
    <div className="geo-map-wrap" style={{ height }}>
      <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={allPoints} />

        {clientPos && (
          <CircleMarker
            center={clientPos}
            radius={10}
            pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.85, weight: 3 }}
          >
            <Popup>
              <strong>Vous</strong>
              <br />
              {clientCenter?.label || 'Votre position'}
            </Popup>
          </CircleMarker>
        )}

        {markers.map(({ store, position }) => {
          const highlight = selectedStoreId === store.id;
          return (
            <Marker
              key={store.id}
              position={position}
              icon={storeIcon(store.type, highlight)}
              eventHandlers={{ click: () => onSelectStore?.(store.id) }}
            >
              <Popup>
                <div style={{ minWidth: 170 }}>
                  <strong>{store.name}</strong>
                  <br />
                  <span style={{ fontSize: 12, color: '#0f766e' }}>{store.typeLabel || store.type}</span>
                  <br />
                  {store.address && <span style={{ fontSize: 12 }}>{store.address}<br /></span>}
                  {store.distanceKm != null && (
                    <span style={{ fontWeight: 700, color: '#e67e22' }}>≈ {store.distanceKm} km<br /></span>
                  )}
                  {store.hours && <span style={{ fontSize: 12 }}>{store.hours}<br /></span>}
                  <button
                    type="button"
                    onClick={() => openMaps(store)}
                    style={{
                      marginTop: 8,
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#0f766e',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Itinéraire
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PartnerStoresMap;
