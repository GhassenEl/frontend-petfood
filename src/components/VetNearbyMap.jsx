import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const vetIcon = (highlight, sameRegion) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:${highlight ? '#e67e22' : sameRegion ? '#0f766e' : '#6366f1'};
      color:white;display:flex;align-items:center;justify-content:center;
      font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);
      ${highlight ? 'transform:scale(1.15);' : ''}
    ">🩺</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

const TUNIS_CENTER = [36.8065, 10.1815];

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

const VetNearbyMap = ({
  vets = [],
  clientCenter = null,
  selectedVetId = null,
  onSelectVet,
  height = 360,
}) => {
  const vetMarkers = useMemo(
    () =>
      vets
        .filter((v) => Number.isFinite(Number(v.lat)) && Number.isFinite(Number(v.lng)))
        .map((v) => ({
          vet: v,
          position: [Number(v.lat), Number(v.lng)],
        })),
    [vets]
  );

  const clientPos = useMemo(() => {
    if (!clientCenter?.lat || !clientCenter?.lng) return null;
    return [Number(clientCenter.lat), Number(clientCenter.lng)];
  }, [clientCenter]);

  const allPoints = useMemo(() => {
    const pts = vetMarkers.map((m) => m.position);
    if (clientPos) pts.push(clientPos);
    return pts;
  }, [vetMarkers, clientPos]);

  const mapCenter = clientPos || vetMarkers[0]?.position || TUNIS_CENTER;

  const openMaps = (vet) => {
    if (!vet?.lat || !vet?.lng) return;
    window.open(
      `https://www.google.com/maps?q=${vet.lat},${vet.lng}(${encodeURIComponent(vet.name || 'Vétérinaire')})`,
      '_blank'
    );
  };

  if (!vetMarkers.length) {
    return (
      <div style={emptyStyle(height)}>
        Aucune position vétérinaire à afficher sur la carte.
      </div>
    );
  }

  return (
    <div style={{ height, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: 16 }}>
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
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
              {clientCenter?.label || 'Votre position / région'}
            </Popup>
          </CircleMarker>
        )}

        {vetMarkers.map(({ vet, position }) => {
          const highlight = selectedVetId === vet.id;
          return (
            <Marker
              key={vet.id}
              position={position}
              icon={vetIcon(highlight, vet.sameRegion)}
              eventHandlers={{
                click: () => onSelectVet?.(vet.id),
              }}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <strong>{vet.name}</strong>
                  {vet.sameRegion && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: '#b45309', fontWeight: 700 }}>
                      · Votre région
                    </span>
                  )}
                  <br />
                  {vet.region && <span style={{ color: '#0f766e', fontSize: 12 }}>{vet.region}<br /></span>}
                  {vet.address && <span style={{ fontSize: 12 }}>{vet.address}<br /></span>}
                  {vet.distance != null && (
                    <span style={{ fontWeight: 700, color: '#e67e22' }}>≈ {vet.distance} km<br /></span>
                  )}
                  {vet.phone && (
                    <a href={`tel:${vet.phone}`} style={{ fontSize: 12, color: '#0f766e' }}>
                      {vet.phone}
                    </a>
                  )}
                  <br />
                  <button
                    type="button"
                    onClick={() => openMaps(vet)}
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

const emptyStyle = (height) => ({
  height,
  borderRadius: 16,
  background: '#f3f4f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#6b7280',
  textAlign: 'center',
  padding: 24,
  marginBottom: 16,
});

export default VetNearbyMap;
