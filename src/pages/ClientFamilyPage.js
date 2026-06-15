import React, { useCallback, useEffect, useState } from 'react';
import { Users, Copy, LogOut, UserPlus, PawPrint } from 'lucide-react';
import {
  fetchHousehold,
  createHousehold,
  joinHousehold,
  leaveHousehold,
  fetchSharedPets,
} from '../services/clientDashboardService';
import { DEMO_FAMILY } from '../utils/clientDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #f1f5f9',
  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
};

const ROLE_LABELS = { owner: 'Propriétaire', member: 'Membre' };

const ClientFamilyPage = () => {
  const [household, setHousehold] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [houseName, setHouseName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [hhRes, petsRes] = await Promise.all([
        fetchHousehold(),
        fetchSharedPets(),
      ]);
      const hh = hhRes?.household;
      setHousehold(hh || DEMO_FAMILY.household);
      const petList = petsRes?.pets;
      setPets(Array.isArray(petList) && petList.length ? petList : DEMO_FAMILY.pets);
    } catch {
      setHousehold(DEMO_FAMILY.household);
      setPets(DEMO_FAMILY.pets);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await createHousehold({ name: houseName.trim() || undefined });
      setHousehold(res.household);
      setHouseName('');
      showToast('Foyer créé — partagez le code d\'invitation.');
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de la création.');
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setBusy(true);
    try {
      const res = await joinHousehold(inviteCode.trim());
      setHousehold(res.household);
      setInviteCode('');
      showToast('Vous avez rejoint le foyer.');
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Code invalide.');
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Quitter ce foyer ? Les animaux restent chez leur propriétaire d\'origine.')) return;
    setBusy(true);
    try {
      await leaveHousehold();
      setHousehold(null);
      setPets([]);
      showToast('Vous avez quitté le foyer.');
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur.');
    } finally {
      setBusy(false);
    }
  };

  const copyCode = () => {
    if (!household?.inviteCode) return;
    navigator.clipboard?.writeText(household.inviteCode);
    showToast('Code copié dans le presse-papiers.');
  };

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Chargement…</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ ...card, marginBottom: 24, background: 'linear-gradient(135deg, #fff7ed, #ffedd5)' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={28} /> Mode famille
        </h1>
        <p style={{ margin: 0, color: '#9a3412', fontSize: 15 }}>
          Plusieurs propriétaires sur un même animal ou foyer — commandes, RDV et IoT partagés.
        </p>
      </div>

      {toast && (
        <div style={{
          ...card,
          marginBottom: 16,
          background: '#ecfdf5',
          borderColor: '#a7f3d0',
          color: '#065f46',
          fontWeight: 600,
        }}>
          {toast}
        </div>
      )}

      {!household ? (
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <form onSubmit={handleCreate} style={card}>
            <h2 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 800 }}>Créer un foyer</h2>
            <input
              type="text"
              placeholder="Nom du foyer (ex. Famille Ben Ali)"
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              style={inputStyle}
            />
            <button type="submit" disabled={busy} style={btnPrimary}>
              Créer mon foyer
            </button>
          </form>

          <form onSubmit={handleJoin} style={card}>
            <h2 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserPlus size={18} /> Rejoindre un foyer
            </h2>
            <input
              type="text"
              placeholder="Code d'invitation (ex. PET-ABC123)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              style={inputStyle}
            />
            <button type="submit" disabled={busy || !inviteCode.trim()} style={btnPrimary}>
              Rejoindre
            </button>
          </form>
        </div>
      ) : (
        <>
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800 }}>{household.name}</h2>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
                  Votre rôle : <strong>{ROLE_LABELS[household.myRole] || household.myRole || 'Membre'}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={copyCode} style={btnOutline}>
                  <Copy size={14} /> {household.inviteCode}
                </button>
                <button type="button" onClick={handleLeave} disabled={busy} style={btnDanger}>
                  <LogOut size={14} /> Quitter
                </button>
              </div>
            </div>
          </div>

          <section style={{ ...card, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800 }}>Membres du foyer</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(household.members || []).map((m) => (
                <div key={m.userId || m.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  borderRadius: 10,
                  fontSize: 14,
                }}>
                  <div>
                    <strong>{m.name || m.email}</strong>
                    {m.email && m.name && (
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>{m.email}</p>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: m.role === 'owner' ? '#fef3c7' : '#e0f2fe',
                    color: m.role === 'owner' ? '#92400e' : '#0369a1',
                  }}>
                    {ROLE_LABELS[m.role] || m.role}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PawPrint size={18} /> Animaux du foyer
            </h3>
            {pets.length === 0 ? (
              <p style={{ margin: 0, color: '#94a3b8' }}>Aucun animal enregistré.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {pets.map((p) => (
                  <div key={p.id} style={{
                    padding: 14,
                    background: '#f0fdf4',
                    borderRadius: 12,
                    border: '1px solid #bbf7d0',
                  }}>
                    <strong>{p.name}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                      {p.breed || p.type}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  marginBottom: 12,
  fontSize: 14,
  boxSizing: 'border-box',
};

const btnPrimary = {
  width: '100%',
  padding: '10px 16px',
  borderRadius: 10,
  border: 'none',
  background: '#e67e22',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 14,
};

const btnOutline = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  background: '#fff',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
};

const btnDanger = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  borderRadius: 10,
  border: 'none',
  background: '#fee2e2',
  color: '#b91c1c',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
};

export default ClientFamilyPage;
