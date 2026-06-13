import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const TABS = [
  { id: 'assistant', label: 'Assistant IA', icon: '💡' },
  { id: 'reco', label: 'Top produits', icon: '🏆' },
];

const card = { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 };

const ClientEcosystemHubPage = () => {
  const [tab, setTab] = useState('assistant');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get('/products')
      .then((r) => setProducts((r.data || []).slice(0, 20)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading && !products.length) {
    return <p style={{ padding: 24 }}>Chargement de l&apos;assistant PetfoodTN…</p>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 0 40px' }}>
      <h1 style={{ margin: '0 0 8px' }}>Assistant IA PetfoodTN</h1>
      <p style={{ color: '#64748b', marginBottom: 8 }}>
        Une aide claire pour choisir l’alimentation, les produits et les services adaptés à votre animal.
      </p>
      <p style={{ marginBottom: 16 }}>
        <Link to="/client-services">Voir les services disponibles (toilettage, pension, dressage) →</Link>
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              border: tab === t.id ? '2px solid #e67e22' : '1px solid #e2e8f0',
              background: tab === t.id ? '#fff7ed' : '#fff',
              cursor: 'pointer',
              fontWeight: tab === t.id ? 700 : 500,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'assistant' && (
        <div>
          <div style={card}>
            <h3>Comment choisir ?</h3>
            <p style={{ color: '#475569', marginBottom: 12 }}>
              Commencez par le profil de votre animal : âge, poids, niveau d’activité et sensibilité digestive.
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#475569' }}>
              <li>Chien actif : privilégiez une formule riche en protéines et en énergie.</li>
              <li>Chat senior : préférez une alimentation douce pour les articulations et la digestion.</li>
              <li>Animal sensible : évitez les céréales irritantes et favorisez une recette hypoallergénique.</li>
              <li>Toilettage : choisissez un créneau court si votre animal n’aime pas les soins prolongés.</li>
            </ul>
          </div>

          <div style={card}>
            <h3>Top recommandations</h3>
            <p style={{ margin: '0 0 12px', color: '#64748b' }}>
              Les produits les plus populaires chez nos clients PetfoodTN.
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              {products.slice(0, 5).map((product) => (
                <div key={product.id} style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <strong>{product.name}</strong>
                  <p style={{ margin: '4px 0 0', color: '#475569' }}>
                    {product.description || product.category || 'Produit recommandé'}
                  </p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 12 }}>
              <Link to="/client-products" style={{ color: '#0ea5e9', fontWeight: 700 }}>
                Voir plus de produits recommandés →
              </Link>
            </p>
          </div>

          <div style={card}>
            <h3>Accès rapide</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              <Link to="/client-products" style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', textDecoration: 'none', color: '#0f172a' }}>
                Boutique PetfoodTN
              </Link>
              <Link to="/client-services" style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', textDecoration: 'none', color: '#0f172a' }}>
                Toilettage & pension
              </Link>
              <Link to="/client-loyalty" style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', textDecoration: 'none', color: '#0f172a' }}>
                Programme fidélité
              </Link>
            </div>
          </div>
        </div>
      )}

      {tab === 'reco' && (
        <div style={card}>
          <h3>Produits les plus recommandés</h3>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {products.slice(0, 8).map((product) => (
              <div key={product.id} style={{ borderRadius: 14, border: '1px solid #e2e8f0', padding: 16 }}>
                <strong>{product.name}</strong>
                <p style={{ color: '#475569', fontSize: 14, margin: '8px 0 0' }}>
                  {product.description || product.category || 'Produit sélectionné pour votre animal'}
                </p>
                {product.price != null && (
                  <p style={{ margin: '10px 0 0', fontWeight: 700 }}>{product.price} DT</p>
                )}
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16 }}>
            <Link to="/client-products" style={{ color: '#0ea5e9', fontWeight: 700 }}>
              Voir toute la sélection →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientEcosystemHubPage;
