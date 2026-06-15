import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grid3X3, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchPlatformHub } from '../services/platformService';

const cardStyle = {
  background: 'white',
  borderRadius: 14,
  padding: 18,
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  height: '100%',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'box-shadow 0.2s, transform 0.2s',
};

const PlatformServicesPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'client';
  const navigate = useNavigate();
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformHub(role)
      .then(setHub)
      .finally(() => setLoading(false));
  }, [role]);

  const handleServiceClick = (service, e) => {
    if (service.route === '#chat') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('petfood:open-chat'));
      return;
    }
    if (service.route.startsWith('/')) {
      const [path, query] = service.route.split('?');
      if (query) {
        e.preventDefault();
        navigate(`${path}?${query}`);
      }
    }
  };

  if (loading) {
    return <p style={{ padding: 24, color: '#64748b' }}>Chargement des services PetfoodTN…</p>;
  }

  const categories = hub?.categories || [];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 0 48px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Grid3X3 size={28} color="#ea580c" />
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>Services PetfoodTN</h1>
        </div>
        <p style={{ margin: '0 0 12px', color: '#64748b', lineHeight: 1.6, maxWidth: 720 }}>
          Catalogue complet de la plateforme — boutique, santé, nutrition multi-espèces,
          IoT, livraison, IA et écosystème premium.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 999,
            background: '#fff7ed', color: '#c2410c',
          }}
          >
            {hub?.total || 0} services · rôle {role}
          </span>
          {hub?.health?.ok && (
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999,
              background: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', gap: 4,
            }}
            >
              <CheckCircle2 size={14} />
              Plateforme active
            </span>
          )}
          {hub?.nutrition?.species?.length > 0 && role === 'client' && (
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999,
              background: '#eff6ff', color: '#1d4ed8',
            }}
            >
              Nutrition : {hub.nutrition.species.length} espèces
            </span>
          )}
        </div>
      </div>

      {role === 'client' && hub?.bookableServices?.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} color="#d97706" />
            Réservation rapide
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
          }}
          >
            {hub.bookableServices.slice(0, 6).map((s) => (
              <Link
                key={s.type}
                to={`/client-services?type=${s.type}`}
                style={{
                  ...cardStyle,
                  textAlign: 'center',
                  padding: 16,
                }}
              >
                <span style={{ fontSize: 28 }}>{s.icon}</span>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{s.label}</span>
                <span style={{ fontSize: 13, color: '#059669', fontWeight: 700 }}>
                  {s.basePrice > 0 ? `dès ${s.basePrice} DT` : 'Gratuit'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {categories.map((cat) => (
        <section key={cat.id} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
            {cat.icon} {cat.label}
            <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginLeft: 8 }}>
              ({cat.services.length})
            </span>
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}
          >
            {cat.services.map((service) => {
              const isChat = service.route === '#chat';
              const Tag = isChat ? 'button' : Link;
              const tagProps = isChat
                ? { type: 'button', onClick: (e) => handleServiceClick(service, e) }
                : { to: service.route, onClick: (e) => handleServiceClick(service, e) };

              return (
                <Tag
                  key={service.id}
                  {...tagProps}
                  style={{
                    ...cardStyle,
                    cursor: 'pointer',
                    border: 'none',
                    textAlign: 'left',
                    font: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(234,88,12,0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = cardStyle.boxShadow;
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 28 }}>{service.icon}</span>
                    {service.badge && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                        background: '#fef3c7', color: '#b45309',
                      }}
                      >
                        {service.badge}
                      </span>
                    )}
                  </div>
                  <strong style={{ fontSize: 15 }}>{service.label}</strong>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5, flex: 1 }}>
                    {service.description}
                  </p>
                  {service.api && (
                    <code style={{
                      fontSize: 10, color: '#94a3b8', background: '#f8fafc',
                      padding: '4px 8px', borderRadius: 6,
                    }}
                    >
                      {service.api}
                    </code>
                  )}
                  <span style={{
                    fontSize: 13, fontWeight: 700, color: '#ea580c',
                    display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
                  }}
                  >
                    Accéder <ArrowRight size={14} />
                  </span>
                </Tag>
              );
            })}
          </div>
        </section>
      ))}

      <div style={{
        background: '#f8fafc', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0',
      }}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Modules API frontend</h3>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
          Import centralisé via <code>src/services/index.js</code> et <code>platformService.js</code>.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(hub?.exportedModules || []).map((m) => (
            <span
              key={m}
              style={{
                fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 8,
                background: 'white', border: '1px solid #e2e8f0', color: '#475569',
              }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformServicesPage;
