import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Search, Database, Camera } from 'lucide-react';
import {
  detectAnimal,
  detectAnimalFromImage,
  fetchSpeciesProfiles,
} from '../services/vetMlAssistService';

const speciesEmoji = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  rabbit: '🐰',
  fish: '🐠',
  reptile: '🦎',
  other: '🐾',
};

const VetAnimalDetectionPanel = ({ patients = [], loading: packLoading }) => {
  const [description, setDescription] = useState('Chien labrador beige, 28 kg, boiterie patte arrière');
  const [weightKg, setWeightKg] = useState('');
  const [temperatureC, setTemperatureC] = useState('');
  const [breedHint, setBreedHint] = useState('');
  const [ownerId, setOwnerId] = useState(patients[0]?.ownerId || '');
  const [result, setResult] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageHint, setImageHint] = useState('');

  useEffect(() => {
    fetchSpeciesProfiles().then(setProfiles).catch(() => setProfiles([]));
  }, []);

  useEffect(() => {
    if (patients[0]?.ownerId && !ownerId) setOwnerId(patients[0].ownerId);
  }, [patients, ownerId]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setPreview(dataUrl);
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const detect = async (e) => {
    e.preventDefault();
    if (!description.trim() && !imageBase64) return;
    setLoading(true);
    try {
      let data;
      if (imageBase64) {
        data = await detectAnimalFromImage({
          imageBase64,
          imageHint: imageHint || description,
          weightKg: weightKg ? Number(weightKg) : undefined,
          temperatureC: temperatureC ? Number(temperatureC) : undefined,
          ownerId: ownerId || undefined,
        });
      } else {
        data = await detectAnimal({
          description,
          weightKg: weightKg ? Number(weightKg) : undefined,
          temperatureC: temperatureC ? Number(temperatureC) : undefined,
          breedHint: breedHint || undefined,
          ownerId: ownerId || undefined,
        });
      }
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  if (packLoading) return <p className="vetih-muted">Chargement…</p>;

  return (
    <div className="vetih-panel">
      <p className="vetih-summary">
        <PawPrint size={16} aria-hidden />
        Détection ML d&apos;espèce — texte ou photo — profils en base ({profiles.length} espèce
        {profiles.length > 1 ? 's' : ''}) + correspondance patients.
      </p>

      <form className="vetih-form" onSubmit={detect}>
        <label>
          Photo de l&apos;animal
          <input type="file" accept="image/*" onChange={onFileChange} />
        </label>
        {preview && (
          <div style={{ marginBottom: 12 }}>
            <img
              src={preview}
              alt="Aperçu animal"
              style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 12, objectFit: 'cover' }}
            />
          </div>
        )}
        {imageBase64 && (
          <label>
            Description de la photo (optionnel)
            <input
              value={imageHint}
              onChange={(e) => setImageHint(e.target.value)}
              placeholder="Ex. chat tigré assis, pelage gris…"
            />
          </label>
        )}
        <label>
          Description texte
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Espèce, race, couleur, comportement…"
          />
        </label>
        <div className="vetih-form-row">
          <label>
            Poids (kg)
            <input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          </label>
          <label>
            Température (°C)
            <input type="number" step="0.1" value={temperatureC} onChange={(e) => setTemperatureC(e.target.value)} />
          </label>
        </div>
        <label>
          Indice race
          <input value={breedHint} onChange={(e) => setBreedHint(e.target.value)} placeholder="Ex. Siamois" />
        </label>
        {patients.length > 0 && (
          <label>
            Propriétaire (correspondance base)
            <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              <option value="">— Aucun —</option>
              {[...new Map(patients.map((p) => [p.ownerId, p.ownerName])).entries()].map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </label>
        )}
        <button type="submit" className="vetih-btn" disabled={loading}>
          {imageBase64 ? <Camera size={16} aria-hidden /> : <Search size={16} aria-hidden />}
          {' '}
          {loading ? 'Analyse ML…' : imageBase64 ? 'Détecter depuis la photo' : 'Détecter l\'espèce'}
        </button>
      </form>

      {result && (
        <div className="vetih-results">
          <div className="vetih-badge-row">
            <span className="vetih-badge" style={{ background: '#0ea5e9' }}>
              {speciesEmoji[result.detectedSpeciesCode] || '🐾'}{' '}
              {result.detectedLabel || result.detectedSpeciesCode}
              {' '}
              ({Math.round((result.confidence || 0) * 100)} %)
            </span>
            {result.imagePowered && <span className="vetih-tag">Photo IA</span>}
            {result.source && (
              <span className="vetih-tag">{result.source === 'python' ? 'FastAPI ML' : 'Moteur local'}</span>
            )}
          </div>

          {result.visionHints && (
            <p className="vetih-muted-inline">
              Vision : {[result.visionHints.breedGuess, result.visionHints.colorMarks, result.visionHints.posture]
                .filter(Boolean)
                .join(' · ') || '—'}
            </p>
          )}

          {result.speciesProfile && (
            <div className="vetih-card">
              <strong><Database size={14} aria-hidden /> Profil base — {result.speciesProfile.label}</strong>
              <p className="vetih-muted-inline">
                Poids norme : {result.speciesProfile.vitalsNorms?.weightMinKg}–
                {result.speciesProfile.vitalsNorms?.weightMaxKg} kg
              </p>
              {(result.speciesProfile.commonConditions || []).length > 0 && (
                <p>Pathologies fréquentes : {result.speciesProfile.commonConditions.join(', ')}</p>
              )}
            </div>
          )}

          {(result.alternatives || []).length > 1 && (
            <>
              <h4>Autres hypothèses</h4>
              <ul className="vetih-list vetih-list--compact">
                {result.alternatives.slice(1).map((alt) => (
                  <li key={alt.speciesCode}>
                    {speciesEmoji[alt.speciesCode] || '🐾'} {alt.label} — {Math.round((alt.confidence || 0) * 100)} %
                  </li>
                ))}
              </ul>
            </>
          )}

          {(result.matchedPets || []).length > 0 && (
            <>
              <h4>Patients correspondants</h4>
              <ul className="vetih-list">
                {result.matchedPets.map((p) => (
                  <li key={p.id} className="vetih-card">
                    <strong>{p.name}</strong> — {p.breed || p.type}
                    <Link to={`/vet/medical-dossiers?petName=${encodeURIComponent(p.name)}`} className="vetih-link">
                      Voir dossier →
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="vetih-disclaimer">{result.disclaimer}</p>
          <Link
            to={`/vet/intelligence?tab=prescription&species=${result.detectedSpeciesCode}`}
            className="vetih-link"
          >
            Générer ordonnance assistée →
          </Link>
        </div>
      )}
    </div>
  );
};

export default VetAnimalDetectionPanel;
