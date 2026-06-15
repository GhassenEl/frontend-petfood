import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import { AdminMessageButton } from './AdminMessageButton';
import { DEMO_ADMIN_REGIONS, DEMO_ADMIN_USERS, withDemoFallback } from '../utils/adminDemoData';
import '../pages/AdminPages.css';

const ROLE_META = {
  livreur: { label: 'Livreur', emoji: '🚚', accent: '#10b981' },
  vet: { label: 'Vétérinaire', emoji: '🩺', accent: '#7c3aed' },
  vendor: { label: 'Vendeur', emoji: '🏬', accent: '#2563eb' },
  moderator: { label: 'Modérateur', emoji: '🛡️', accent: '#d97706' },
};

const resolveRegion = (person, role) => {
  if (person.region) return person.region;
  if (role === 'vet' && person.address) {
    const addr = String(person.address).toLowerCase();
    const hit = DEMO_ADMIN_REGIONS.find((r) => addr.includes(r.toLowerCase()));
    if (hit) return hit;
  }
  return 'Non assignée';
};

const AdminRegionalStaffList = ({ role, title, subtitle }) => {
  const meta = ROLE_META[role] || { label: role, emoji: '👤', accent: '#64748b' };
  const [people, setPeople] = useState([]);
  const [regions, setRegions] = useState(DEMO_ADMIN_REGIONS);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usersRes, regionsRes] = await Promise.all([
          api.get('/users'),
          api.get('/users/regions').catch(() => ({ data: [] })),
        ]);
        const all = withDemoFallback(usersRes.data || [], DEMO_ADMIN_USERS);
        setPeople(all.filter((u) => u.role === role));
        setRegions((regionsRes.data || []).length ? regionsRes.data : DEMO_ADMIN_REGIONS);
      } catch {
        setPeople(DEMO_ADMIN_USERS.filter((u) => u.role === role));
        setRegions(DEMO_ADMIN_REGIONS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [role]);

  const regionStats = useMemo(() => {
    const stats = {};
    regions.forEach((region) => {
      stats[region] = people.filter((p) => resolveRegion(p, role) === region).length;
    });
    stats['Non assignée'] = people.filter((p) => resolveRegion(p, role) === 'Non assignée').length;
    return stats;
  }, [people, regions, role]);

  const filtered = useMemo(() => people.filter((person) => {
    const region = resolveRegion(person, role);
    const matchesRegion = regionFilter === 'all' || region === regionFilter;
    const haystack = `${person.name} ${person.email} ${person.phone || ''} ${person.address || ''} ${region}`.toLowerCase();
    return matchesRegion && haystack.includes(searchTerm.toLowerCase());
  }), [people, regionFilter, searchTerm, role]);

  const regionCards = [...regions, ...(regionStats['Non assignée'] ? ['Non assignée'] : [])];

  return (
    <div>
      <header className="adm-hero" style={{ marginBottom: 16 }}>
        <h1>{meta.emoji} {title || `${meta.label}s par région`}</h1>
        <p>{subtitle || `Liste des ${meta.label.toLowerCase()}s avec contact message direct.`}</p>
      </header>

      <div className="adm-region-grid">
        {regionCards.map((region) => (
          <button
            key={region}
            type="button"
            className={`adm-region-card${regionFilter === region ? ' adm-region-card--active' : ''}`}
            style={{
              borderColor: regionFilter === region ? meta.accent : undefined,
              background: regionFilter === region ? `${meta.accent}14` : undefined,
            }}
            onClick={() => setRegionFilter(regionFilter === region ? 'all' : region)}
          >
            <div className="adm-region-card__name">{region}</div>
            <div className="adm-region-card__meta">
              <span>{meta.emoji} {regionStats[region] || 0}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="adm-search-row">
        <input
          type="search"
          placeholder={`Rechercher un ${meta.label.toLowerCase()}…`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="adm-search-input"
        />
        {regionFilter !== 'all' && (
          <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setRegionFilter('all')}>
            Toutes les régions
          </button>
        )}
      </div>

      <div className="adm-card">
        {loading ? (
          <p>Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="adm-empty">Aucun {meta.label.toLowerCase()} pour cette région.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Contact</th>
                <th>Région</th>
                <th>Statut</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person) => {
                const id = person.id || person._id;
                const region = resolveRegion(person, role);
                return (
                  <tr key={id}>
                    <td><strong>{person.name}</strong></td>
                    <td>
                      {person.email}
                      <br />
                      <small>{person.phone || '—'}</small>
                      {role === 'vet' && person.address ? (
                        <>
                          <br />
                          <small>{person.address}</small>
                        </>
                      ) : null}
                    </td>
                    <td><span className="adm-region-badge">{region}</span></td>
                    <td>
                      <span className={`adm-badge adm-badge--${person.isActive !== false ? 'active' : 'suspended'}`}>
                        {person.isActive !== false ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <AdminMessageButton userId={id} label="Contacter" compact />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminRegionalStaffList;
