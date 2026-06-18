import React, { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import RegionSelect from '../components/RegionSelect';
import VetClinicalAlertsBar from '../components/VetClinicalAlertsBar';

const DAYS = [
  { key: 'mon', label: 'Lundi' },
  { key: 'tue', label: 'Mardi' },
  { key: 'wed', label: 'Mercredi' },
  { key: 'thu', label: 'Jeudi' },
  { key: 'fri', label: 'Vendredi' },
  { key: 'sat', label: 'Samedi' },
  { key: 'sun', label: 'Dimanche' },
];

const card = {
  background: 'white',
  borderRadius: 14,
  padding: 24,
  marginBottom: 20,
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
};

const VetClinicPage = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [servicesText, setServicesText] = useState('');
  const [clinicRegion, setClinicRegion] = useState('');

  const load = useCallback(async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        api.get('/vet/clinic'),
        api.get('/vet/clinic/stats'),
      ]);
      setProfile(pRes.data);
      setStats(sRes.data);
      setServicesText((pRes.data?.services || []).join(', '));
      setClinicRegion(pRes.data?.region || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.target);
    const openingHours = {};
    DAYS.forEach(({ key }) => {
      openingHours[key] = fd.get(`hours_${key}`) || profile?.openingHours?.[key] || '';
    });

    try {
      const { data } = await api.patch('/vet/clinic', {
        clinicName: fd.get('clinicName'),
        phone: fd.get('phone'),
        emergencyPhone: fd.get('emergencyPhone'),
        address: fd.get('address'),
        region: fd.get('region'),
        description: fd.get('description'),
        acceptsHomeVisit: fd.get('acceptsHomeVisit') === 'on',
        openingHours,
        services: servicesText.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setProfile(data);
      window.alert('Profil clinique enregistré.');
    } catch {
      window.alert('Erreur enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 8px' }}>🏥 Ma clinique</h1>
      <p style={{ color: '#64748b', marginTop: 0 }}>
        Informations du cabinet, statistiques et alertes cliniques.
      </p>

      <VetClinicalAlertsBar />

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Dossiers', value: stats.dossiersCount, icon: '📁' },
            { label: 'Entrées signées', value: stats.signedEntriesCount, icon: '✍️' },
            { label: 'Patients actifs', value: stats.activePatients, icon: '🐾' },
            { label: 'Vaccins à prévoir', value: stats.vaccinesDueSoon, icon: '💉' },
          ].map((s) => (
            <div key={s.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0ea5e9' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSave} style={card}>
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Identité du cabinet</h2>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label style={labelStyle}>
            Nom de la clinique
            <input name="clinicName" defaultValue={profile?.clinicName || ''} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Téléphone
            <input name="phone" defaultValue={profile?.phone || ''} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Urgences 24h
            <input name="emergencyPhone" defaultValue={profile?.emergencyPhone || ''} style={inputStyle} />
          </label>
          <RegionSelect
            name="region"
            label="Région"
            value={clinicRegion}
            onChange={setClinicRegion}
            showIcon
          />
        </div>
        <label style={{ ...labelStyle, marginTop: 14 }}>
          Adresse
          <input name="address" defaultValue={profile?.address || ''} style={inputStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 14 }}>
          Description
          <textarea name="description" rows={3} defaultValue={profile?.description || ''} style={inputStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 14 }}>
          Services (séparés par des virgules)
          <input value={servicesText} onChange={(e) => setServicesText(e.target.value)} style={inputStyle} />
        </label>

        <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <input type="checkbox" name="acceptsHomeVisit" defaultChecked={profile?.acceptsHomeVisit !== false} />
            Visites à domicile
          </label>
        </div>

        <h3 style={{ marginTop: 24, fontSize: '1rem' }}>Horaires d&apos;ouverture</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {DAYS.map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 90, fontSize: 14, fontWeight: 600 }}>{label}</span>
              <input
                name={`hours_${key}`}
                defaultValue={profile?.openingHours?.[key] || ''}
                placeholder="09:00-18:00"
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: 20 }} disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer le profil clinique'}
        </button>
      </form>
    </div>
  );
};

const labelStyle = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151' };
const inputStyle = { padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, marginTop: 4 };

export default VetClinicPage;
