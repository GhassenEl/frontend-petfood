import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPets } from '../services/userService';
import NearestVetCard from './NearestVetCard';
import { getPetPhoto, PET_EMOJI, PET_LABEL } from '../utils/petAvatars';
import { calculatePetCalories } from '../utils/petCalorieCalculator';
import { VISIT_MODES, isHomeVisit, isOnlineVisit } from '../constants/visitModes';

const card = {
  background: 'white',
  borderRadius: 18,
  padding: 18,
  border: '1px solid rgba(0,0,0,0.06)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

const label = { fontSize: 13, fontWeight: 800, color: '#111827' };
const input = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const ClientVetHealthHub = ({
  selectedPet,
  onSelectPet,
  contactForm,
  setContactForm,
  onSubmitContact,
  contactLoading,
  contactError,
  contactSuccess,
  contactRequests,
  contactStatusLabel,
}) => {
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(true);

  useEffect(() => {
    getPets()
      .then((data) => setPets(Array.isArray(data) ? data : []))
      .catch(() => setPets([]))
      .finally(() => setPetsLoading(false));
  }, []);

  const pickPet = (pet) => {
    onSelectPet(pet);
    setContactForm((f) => ({
      ...f,
      petName: pet.name || '',
      animalType: pet.type || pet.animalType || 'dog',
    }));
  };

  const profilePetFallback = pets.length === 0 && !petsLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={card}>
        <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>🥗 Bilan nutritionnel vétérinaire</h2>
        <p style={{ margin: '0 0 14px', color: '#6b7280', fontSize: 14, lineHeight: 1.5 }}>
          Analyse du régime, besoins caloriques et plan alimentaire personnalisé — réalisé par un vétérinaire PetfoodTN
          (pas un produit boutique).
        </p>
        <button
          type="button"
          onClick={() => {
            setContactForm((f) => ({
              ...f,
              subject: `Bilan nutritionnel vétérinaire${f.petName ? ` — ${f.petName}` : ''}`,
              message:
                'Je souhaite un bilan nutritionnel complet pour mon animal : analyse du régime actuel, besoins caloriques, recommandations alimentaires et plan personnalisé.',
            }));
          }}
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #16a34a, #059669)',
            color: 'white',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Demander un bilan nutritionnel
        </button>
      </div>

      <div style={card}>
        <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>🐾 Mes animaux</h2>
        <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: 14 }}>
          Sélectionnez un compagnon pour pré-remplir votre demande de consultation santé.{' '}
          <Link to="/pet-calories" style={{ color: '#ea580c', fontWeight: 700 }}>Calcul calories</Link>
        </p>

        {petsLoading ? (
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Chargement de vos animaux…</p>
        ) : pets.length === 0 ? (
          <div style={{ padding: 16, background: '#f8fafc', borderRadius: 14, fontSize: 14, color: '#64748b' }}>
            Aucun animal enregistré. Complétez votre{' '}
            <Link to="/client-profile" style={{ color: '#0ea5e9', fontWeight: 700 }}>profil</Link>
            {' '}ou saisissez les informations ci-dessous.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
            {pets.map((pet) => {
              const id = pet.id || pet._id;
              const type = pet.type || pet.animalType || 'other';
              const active = selectedPet && (selectedPet.id || selectedPet._id) === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => pickPet(pet)}
                  style={{
                    border: active ? '2px solid #e67e22' : '1px solid #e5e7eb',
                    borderRadius: 16,
                    padding: 12,
                    background: active ? 'rgba(230,126,34,0.06)' : 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <img
                    src={getPetPhoto(type)}
                    alt={pet.name}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: 8,
                      border: '3px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    }}
                  />
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{pet.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {PET_EMOJI[type]} {PET_LABEL[type] || type}
                  </div>
                  {(() => {
                    const cal = calculatePetCalories(pet, { mealCount: 2 });
                    if (cal.supported) {
                      return (
                        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 800, color: '#ea580c' }}>
                          🔥 ~{cal.dailyKcal} kcal/j
                        </div>
                      );
                    }
                    if (cal.needsWeight) {
                      return (
                        <div style={{ marginTop: 6, fontSize: 10, color: '#94a3b8' }}>
                          Poids à renseigner
                        </div>
                      );
                    }
                    return null;
                  })()}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <div style={card}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800 }}>📋 Demande santé</h3>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6b7280' }}>
            Décrivez symptômes, comportement ou besoin de suivi. Le vétérinaire le plus proche pourra répondre.
          </p>

          {selectedPet && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
              padding: 10, background: '#ecfdf5', borderRadius: 12,
            }}>
              <img
                src={getPetPhoto(selectedPet.type || selectedPet.animalType)}
                alt=""
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                Demande pour {selectedPet.name}
              </span>
            </div>
          )}

          <form onSubmit={onSubmitContact} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={label}>Type d&apos;animal</span>
                <select
                  value={contactForm.animalType}
                  onChange={(e) => setContactForm((p) => ({ ...p, animalType: e.target.value }))}
                  style={input}
                >
                  {Object.entries(PET_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={label}>Nom</span>
                <input
                  value={contactForm.petName}
                  onChange={(e) => setContactForm((p) => ({ ...p, petName: e.target.value }))}
                  placeholder="Ex: Rex"
                  style={input}
                />
              </label>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={label}>Sujet *</span>
              <input
                required
                value={contactForm.subject}
                onChange={(e) => setContactForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Ex: Toux persistante / Contrôle annuel"
                style={input}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={label}>Description *</span>
              <textarea
                required
                value={contactForm.message}
                onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Symptômes, durée, alimentation, traitements en cours…"
                style={{ ...input, minHeight: 100, resize: 'vertical' }}
              />
            </label>

            <div>
              <span style={label}>Mode de consultation</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {VISIT_MODES.map((mode) => {
                  const sel = contactForm.visitMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setContactForm((p) => ({ ...p, visitMode: mode.value }))}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: `2px solid ${sel ? '#e67e22' : '#e5e7eb'}`,
                        background: sel ? 'rgba(230,126,34,0.08)' : '#fafafa',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {mode.icon} {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {contactForm.visitMode === 'home' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={label}>Adresse *</span>
                <input
                  value={contactForm.homeAddress}
                  onChange={(e) => setContactForm((p) => ({ ...p, homeAddress: e.target.value }))}
                  style={input}
                />
              </label>
            )}

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={label}>Date souhaitée (optionnel)</span>
              <input
                type="date"
                value={contactForm.preferredDate}
                onChange={(e) => setContactForm((p) => ({ ...p, preferredDate: e.target.value }))}
                style={input}
              />
            </label>

            {contactError && (
              <div style={{ padding: 12, borderRadius: 12, background: '#fef2f2', color: '#b91c1c', fontSize: 13, fontWeight: 700 }}>
                {contactError}
              </div>
            )}
            {contactSuccess && (
              <div style={{ padding: 12, borderRadius: 12, background: '#ecfdf5', color: '#065f46', fontSize: 13, fontWeight: 700 }}>
                {contactSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={contactLoading}
              style={{
                padding: '14px 18px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #e67e22, #d35400)',
                color: 'white',
                fontWeight: 800,
                cursor: contactLoading ? 'wait' : 'pointer',
                opacity: contactLoading ? 0.7 : 1,
              }}
            >
              {contactLoading ? 'Envoi…' : 'Envoyer la demande au vétérinaire'}
            </button>
          </form>
        </div>

        <div>
          <NearestVetCard compact={false} />
        </div>
      </div>

      {contactRequests.length > 0 && (
        <div style={card}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>📬 Mes demandes récentes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {contactRequests.slice(0, 5).map((r) => (
              <div
                key={r._id || r.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: 14,
                  background: '#fafafa',
                  borderRadius: 14,
                  border: '1px solid #f3f4f6',
                }}
              >
                <img
                  src={getPetPhoto(r.animalType)}
                  alt=""
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                    {r.subject || 'Demande santé'}
                    {isHomeVisit(r) && (
                      <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#fef3c7', color: '#b45309' }}>Domicile</span>
                    )}
                    {isOnlineVisit(r) && (
                      <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#ede9fe', color: '#6d28d9' }}>En ligne</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                    {r.petName ? `${PET_LABEL[r.animalType] || r.animalType} · ${r.petName}` : PET_LABEL[r.animalType]}
                  </div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{r.message}</div>
                  <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: r.status === 'pending' ? '#d97706' : '#059669' }}>
                    {contactStatusLabel(r)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profilePetFallback && !selectedPet && (
        <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: 0 }}>
          Astuce : ajoutez vos animaux dans le profil pour les retrouver ici avec leur photo.
        </p>
      )}
    </div>
  );
};

export default ClientVetHealthHub;
