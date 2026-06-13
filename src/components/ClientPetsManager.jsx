import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, PawPrint } from 'lucide-react';
import PetCard from './PetCard';
import {
  fetchClientPets,
  createClientPet,
  updateClientPet,
  deleteClientPet,
} from '../services/petService';
import '../pages/ClientPets.css';

const PET_TYPES = [
  { id: 'dog', label: 'Chien' },
  { id: 'cat', label: 'Chat' },
  { id: 'bird', label: 'Oiseau' },
  { id: 'fish', label: 'Poisson' },
  { id: 'rabbit', label: 'Lapin' },
  { id: 'other', label: 'Autre' },
];

const emptyForm = () => ({
  name: '',
  type: 'dog',
  breed: '',
  weight: '',
  birthDate: '',
  sex: 'M',
  isNeutered: true,
  color: '',
  allergies: '',
  notes: '',
  microchipId: '',
});

const ClientPetsManager = ({ compact = false }) => {
  const [pets, setPets] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, demo: isDemo } = await fetchClientPets();
      setPets(data);
      setDemo(isDemo);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (pet) => {
    setEditing(pet);
    setForm({
      name: pet.name || '',
      type: pet.type || 'dog',
      breed: pet.breed || '',
      weight: pet.weight ?? pet.weightKg ?? '',
      birthDate: pet.birthDate ? pet.birthDate.slice(0, 10) : '',
      sex: pet.sex || 'M',
      isNeutered: pet.isNeutered !== false,
      color: pet.color || '',
      allergies: pet.allergies || '',
      notes: pet.notes || '',
      microchipId: pet.microchipId || '',
    });
    setModalOpen(true);
  };

  const notify = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      weight: form.weight !== '' ? Number(form.weight) : null,
      weightKg: form.weight !== '' ? Number(form.weight) : null,
    };
    try {
      if (editing) {
        const id = editing.id || editing._id;
        await updateClientPet(id, payload);
        notify('Profil animal mis à jour.');
      } else {
        await createClientPet(payload);
        notify('Animal ajouté à votre profil.');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      notify(`Erreur : ${err.message || 'échec'}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (pet, index) => {
    const id = pet.id || pet._id;
    if (!window.confirm(`Supprimer le profil de ${pet.name || 'cet animal'} ?`)) return;
    try {
      await deleteClientPet(id);
      notify('Animal retiré de votre profil.');
      load();
    } catch (err) {
      notify(`Erreur : ${err.message || 'échec'}`);
    }
  };

  if (loading) {
    return <p style={{ padding: compact ? 0 : 24, color: '#94a3b8' }}>Chargement de vos animaux…</p>;
  }

  return (
    <div className={compact ? '' : 'cpets-page'}>
      {!compact && (
        <header className="cpets-hero">
          <h1>
            <PawPrint size={24} />
            Mes animaux
            {demo && <span className="cpets-demo-pill">Mode démo</span>}
          </h1>
          <p>
            Créez et gérez le profil de chaque compagnon — race, poids, allergies, puce électronique.
            Ces informations alimentent la nutrition, les RDV vétérinaires et le passeport numérique.
          </p>
        </header>
      )}

      {msg && <p className="cpets-msg">{msg}</p>}

      <div className="cpets-toolbar">
        <button type="button" className="cpets-btn cpets-btn--primary" onClick={openCreate}>
          <Plus size={16} /> Ajouter un animal
        </button>
        {!compact && (
          <Link to="/client-pet-passport" className="cpets-btn cpets-btn--ghost">
            Passeport numérique →
          </Link>
        )}
        {compact && pets.length > 0 && (
          <Link to="/client-pets" className="cpets-card-link" style={{ marginLeft: 'auto' }}>
            Gérer tous mes animaux →
          </Link>
        )}
      </div>

      {pets.length === 0 ? (
        <div className="cpets-empty">
          <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>🐾</p>
          <p>Aucun animal enregistré.</p>
          <p style={{ fontSize: '0.85rem' }}>Ajoutez votre premier compagnon pour personnaliser nutrition, santé et commandes.</p>
        </div>
      ) : (
        <div className="cpets-grid">
          {pets.map((pet, index) => (
            <div key={pet.id || pet._id || index}>
              <PetCard
                pet={pet}
                petIndex={index}
                onEdit={openEdit}
                onDelete={remove}
              />
              <div className="cpets-card-actions">
                <Link
                  to={`/client-pet-passport/${pet.id || pet._id}`}
                  className="cpets-card-link"
                >
                  Passeport →
                </Link>
                <Link to="/pet-calories" className="cpets-card-link">
                  Nutrition →
                </Link>
                <Link to="/veterinary" className="cpets-card-link">
                  RDV vétérinaire →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="cpets-modal-backdrop" onClick={() => !saving && setModalOpen(false)} role="presentation">
          <div className="cpets-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2>{editing ? `Modifier — ${editing.name}` : 'Nouvel animal'}</h2>
            <form onSubmit={save}>
              <div className="cpets-form-grid">
                <label className="full">
                  Nom *
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Max, Luna…" />
                </label>
                <label>
                  Espèce *
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {PET_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Race
                  <input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="Labrador, Européen…" />
                </label>
                <label>
                  Poids (kg)
                  <input type="number" min="0" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                </label>
                <label>
                  Date de naissance
                  <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
                </label>
                <label>
                  Sexe
                  <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
                    <option value="M">Mâle</option>
                    <option value="F">Femelle</option>
                  </select>
                </label>
                <label>
                  Couleur
                  <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                </label>
                <label>
                  Puce électronique
                  <input value={form.microchipId} onChange={(e) => setForm({ ...form, microchipId: e.target.value })} placeholder="978…" />
                </label>
                <label className="full">
                  Allergies connues
                  <input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Poulet, gluten…" />
                </label>
                <label className="full">
                  Notes
                  <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Habitudes, préférences alimentaires…" />
                </label>
                <label className="full" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={form.isNeutered} onChange={(e) => setForm({ ...form, isNeutered: e.target.checked })} />
                  Stérilisé / castré
                </label>
              </div>
              <div className="cpets-form-actions">
                <button type="button" className="cpets-btn cpets-btn--ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                  Annuler
                </button>
                <button type="submit" className="cpets-btn cpets-btn--primary" disabled={saving}>
                  {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPetsManager;
