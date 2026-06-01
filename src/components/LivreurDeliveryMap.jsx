import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
L.Marker.prototype.options.icon = DefaultIcon;

const TUNIS_CENTER = [36.8065, 10.1815];

export const getOrderCoords = (order) => {
  const raw = order.deliveryLocation || order.location;
  if (!raw) return null;
  let loc = raw;
  if (typeof raw === 'string') {
    try {
      loc = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  const lat = Number(loc?.lat);
  const lng = Number(loc?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

const LivreurDeliveryMap = ({ orders = [], height = 420 }) => {
  const markers = useMemo(
    () =>
      orders
        .map((order) => {
          const coords = getOrderCoords(order);
          if (!coords) return null;
          return { order, coords };
        })
        .filter(Boolean),
    [orders]
  );

  const center = useMemo(() => {
    if (!markers.length) return TUNIS_CENTER;
    const lat = markers.reduce((sum, m) => sum + m.coords.lat, 0) / markers.length;
    const lng = markers.reduce((sum, m) => sum + m.coords.lng, 0) / markers.length;
    return [lat, lng];
  }, [markers]);

  if (!markers.length) {
    return (
      <div
        style={{
          height,
          borderRadius: 16,
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          textAlign: 'center',
          padding: 24,
        }}
      >
        Aucune position GPS sur les commandes en cours. Utilisez les liens itinéraire par adresse ci-dessous.
      </div>
    );
  }

  return (
    <div style={{ height, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ order, coords }) => (
          <Marker key={order._id || order.id} position={[coords.lat, coords.lng]}>
            <Popup>
              <strong>#{String(order._id || order.id).slice(-6)}</strong>
              <br />
              {order.region && <span>{order.region}<br /></span>}
              {order.address || 'Adresse'}
              <br />
              {order.total} DT
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LivreurDeliveryMap;
