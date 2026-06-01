import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Heart, Utensils, Activity, Droplets, Shield, ChevronDown, ChevronUp, Camera, Video, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import PetProductRecommendations from '../components/PetProductRecommendations';
import api from '../utils/api';

const ADVICE_DATA = {
  dog: {
    icon: '🐶',
    title: 'Chien',
    color: '#e67e22',
    tips: [
      { icon: <Utensils size={18} />, title: 'Alimentation', text: 'Privilégiez les croquettes riches en protéines animales (minimum 25%). Évitez le chocolat, l\'oignon et le raisin qui sont toxiques.' },
      { icon: <Droplets size={18} />, title: 'Hydratation', text: 'Un chien doit boire entre 50 et 80 ml d\'eau par kg de poids corporel par jour. Changez l\'eau fraîchement 2 fois par jour.' },
      { icon: <Activity size={18} />, title: 'Exercice', text: 'Au moins 30 minutes de marche quotidienne pour les petites races, jusqu\'à 2h pour les grandes races actives.' },
      { icon: <Shield size={18} />, title: 'Santé', text: 'Vaccination annuelle obligatoire (rage, maladie de Carré, hépatite). Vermifugation tous les 3-6 mois.' },
      { icon: <Heart size={18} />, title: 'Bien-être', text: 'Brossez le pelage 2-3 fois par semaine pour stimuler la circulation sanguine et réduire la perte de poils.' },
    ]
  },
  cat: {
    icon: '🐱',
    title: 'Chat',
    color: '#8e44ad',
    tips: [
      { icon: <Utensils size={18} />, title: 'Alimentation', text: 'Les chats sont carnivores stricts : leur alimentation doit contenir au moins 26% de protéines animales. Privilégiez les aliments riches en taurine.' },
      { icon: <Droplets size={18} />, title: 'Hydratation', text: 'Les chats ont une soif faible : proposez une fontaine à eau pour les inciter à boire. L\'eau fraîche changee quotidiennement est essentielle.' },
      { icon: <Activity size={18} />, title: 'Environnement', text: 'Un arbre à chat, des jouets interactifs et des griffoirs sont indispensables pour leur bien-être mental et physique.' },
      { icon: <Shield size={18} />, title: 'Santé', text: 'Stérilisation recommandée vers 6 mois. Vaccination (coryza, leucose, rage) et vermifugation régulière.' },
      { icon: <Heart size={18} />, title: 'Toilettage', text: 'Brossage régulier selon la longueur du poil. Les chats à poil long nécessitent un brossage quotidien.' },
    ]
  },
  bird: {
    icon: '🐦',
    title: 'Oiseau',
    color: '#3498db',
    tips: [
      { icon: <Utensils size={18} />, title: 'Alimentation', text: 'Mélange de graines de qualité + fruits frais (pomme, raisin sans pépins) et légumes (carotte, épinards). Évitez l\'avocat.' },
      { icon: <Droplets size={18} />, title: 'Hydratation', text: 'Eau fraîche changée quotidiennement. Proposez un bain 2-3 fois par semaine pour l\'hygiène du plumage.' },
      { icon: <Activity size={18} />, title: 'Environnement', text: 'Cage spacieuse (minimum 2x la largeur des ailes déployées). Placez-la dans un endroit lumineux sans courants d\'air.' },
      { icon: <Shield size={18} />, title: 'Santé', text: 'Vermifugation annuelle. Surveillez les selles : toute modification peut signaler une maladie.' },
      { icon: <Heart size={18} />, title: 'Socialisation', text: 'Parlez-leur régulièrement. Les oiseaux sociaux (perroquets) ont besoin d\'interaction quotidienne d\'au moins 2-3h.' },
    ]
  },
  fish: {
    icon: '🐠',
    title: 'Poisson',
    color: '#1abc9c',
    tips: [
      { icon: <Utensils size={18} />, title: 'Alimentation', text: 'Variez les aliments : granulés de base + nourriture vivante ou congelée (artémias, daphnies) 2-3 fois par semaine.' },
      { icon: <Droplets size={18} />, title: 'Eau', text: 'Testez régulièrement les paramètres (pH, nitrites, nitrates). Changez 20-25% de l\'eau hebdomadairement.' },
      { icon: <Activity size={18} />, title: 'Aquarium', text: 'Règle de base : 1 litre d\'eau par cm de poisson adulte. Un aquarium planté réduit le stress et améliore la qualité de l\'eau.' },
      { icon: <Shield size={18} />, title: 'Santé', text: 'Quarantaine de 2 semaines pour les nouveaux poissons. Surveillez les signes de maladie : nage anormale, taches blanches, refus de nourriture.' },
      { icon: <Heart size={18} />, title: 'Lumière', text: '8-10h de lumière par jour maximum. Trop de lumière favorise les algues. Utilisez un programmateur.' },
    ]
  },
  other: {
    icon: '🐾',
    title: 'Autres animaux',
    color: '#95a5a6',
    tips: [
      { icon: <Utensils size={18} />, title: 'Alimentation', text: 'Recherchez une alimentation spécifique à l\'espèce. Les lapins ont besoin de foin à volonté + légumes verts frais.' },
      { icon: <Droplets size={18} />, title: 'Hydratation', text: 'Biberon propre et eau fraîche pour les rongeurs. Certains animaux (hamsters) boivent très peu mais ont besoin d\'eau constante.' },
      { icon: <Activity size={18} />, title: 'Environnement', text: 'Enrichissement environnemental crucial : tunnels, roues d\'exercice, abris. Respectez la température adaptée à l\'espèce.' },
      { icon: <Shield size={18} />, title: 'Santé', text: 'Vétérinaire spécialisé NAC (Nouveaux Animaux de Compagnie). Les rongeurs cachent leurs maladies : soyez attentif aux changements de comportement.' },
      { icon: <Heart size={18} />, title: 'Hygiène', text: 'Nettoyage de la cage/hebdomadaire. Utilisez une litière non parfumée et non poussiéreuse pour éviter les problèmes respiratoires.' },
    ]
  }
};

const ClientPetAdvicePage = () => {
  const { user } = useAuth();
  const [selectedAnimal, setSelectedAnimal] = useState('dog');
  const [expandedTip, setExpandedTip] = useState(null);
  const [healthRecommendations, setHealthRecommendations] = useState(null);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState('');

  const [cameraActive, setCameraActive] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraResult, setCameraResult] = useState(null);
  const [detectLoading, setDetectLoading] = useState(false);
  const [detectError, setDetectError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [vaccineName, setVaccineName] = useState('');
  const [vaccineDate, setVaccineDate] = useState('');
  const [vaccineNotes, setVaccineNotes] = useState('');
  const [vaccineReminders, setVaccineReminders] = useState([]);

  useEffect(() => {
    fetchHealthRecommendations();
  }, [selectedAnimal]);

  useEffect(() => {
    const stored = localStorage.getItem('pet-advice:vaccine-reminders');
    if (stored) {
      try {
        setVaccineReminders(JSON.parse(stored) || []);
      } catch (e) {
        setVaccineReminders([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pet-advice:vaccine-reminders', JSON.stringify(vaccineReminders));
  }, [vaccineReminders]);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setDetectError('Votre navigateur ne prend pas en charge la caméra.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setDetectError('');
    } catch (err) {
      setDetectError('Impossible d’accéder à la caméra. Vérifiez les autorisations.');
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
    setCameraActive(false);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
    if (!blob) {
      setDetectError('Impossible de capturer l’image.');
      return;
    }
    const imageUrl = URL.createObjectURL(blob);
    setCapturedImage(imageUrl);
    await sendDetection(blob);
  };

  const sendDetection = async (blob) => {
    setDetectError('');
    setDetectLoading(true);
    setCameraResult(null);

    try {
      const formData = new FormData();
      formData.append('file', blob, 'capture.jpg');
      const res = await fetch('/fastapi/detect-image', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Erreur de détection');
      }
      const data = await res.json();
      setCameraResult(data);
    } catch (err) {
      setDetectError(
        err.message?.includes('fetch') || err.message?.includes('502')
          ? 'Service de détection IA indisponible (FastAPI). Les recommandations santé restent disponibles ci-dessous.'
          : err.message || 'Erreur lors de l\'analyse image.'
      );
    } finally {
      setDetectLoading(false);
    }
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCapturedImage(url);
    await sendDetection(file);
  };

  const fetchHealthRecommendations = async () => {
    setRecommendLoading(true);
    setRecommendError('');
    setHealthRecommendations(null);
    try {
      const { data } = await api.get(
        `/ai/health-recommendations?petType=${encodeURIComponent(selectedAnimal)}`
      );
      setHealthRecommendations(data);
    } catch (err) {
      setHealthRecommendations(null);
      setRecommendError(
        err.response?.data?.error ||
          'Impossible de charger les recommandations santé. Vérifiez votre connexion.'
      );
    } finally {
      setRecommendLoading(false);
    }
  };

  const addReminder = (e) => {
    e.preventDefault();
    if (!vaccineName || !vaccineDate) {
      return;
    }
    const reminder = {
      id: Date.now(),
      name: vaccineName,
      date: vaccineDate,
      notes: vaccineNotes,
      createdAt: new Date().toISOString(),
    };
    setVaccineReminders((prev) => [reminder, ...prev]);
    setVaccineName('');
    setVaccineDate('');
    setVaccineNotes('');
  };

  const removeReminder = (id) => {
    setVaccineReminders((prev) => prev.filter((item) => item.id !== id));
  };

  const nextReminder = vaccineReminders
    .map((item) => ({ ...item, dateValue: new Date(item.date) }))
    .filter((item) => !isNaN(item.dateValue))
    .sort((a, b) => a.dateValue - b.dateValue)[0];

  const buttonStyle = (background) => ({
    padding: '12px 18px',
    borderRadius: '14px',
    border: 'none',
    background,
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  });

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    outline: 'none',
    color: '#0f172a',
  };

  const uploadLabelStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 18px',
    borderRadius: '14px',
    border: '1px dashed #cbd5e1',
    background: 'white',
    cursor: 'pointer',
    color: '#334155',
  };

  const alertStyle = {
    padding: '12px 14px',
    borderRadius: '14px',
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
  };

  const hintStyle = {
    padding: '12px 14px',
    borderRadius: '14px',
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
  };

  const cardStyle = (bg) => ({
    background: bg,
    borderRadius: '18px',
    padding: '18px',
    border: '1px solid #e2e8f0',
  });

  const sectionLabelStyle = {
    margin: 0,
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '10px',
  };

  const RecommendationList = ({ items }) => (
    <div style={{ display: 'grid', gap: '10px' }}>
      {items?.length ? (
        items.map((item) => (
          <div key={item._id || item.id || item.name} style={{ padding: '12px 14px', background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name || item.product?.name || 'Produit'}</div>
            <div style={{ color: '#475569', fontSize: '13px' }}>{item.reason || item.product?.category || 'Recommandé pour votre animal'}</div>
          </div>
        ))
      ) : (
        <p style={{ margin: 0, color: '#64748b' }}>Aucune recommandation dans cette catégorie.</p>
      )}
    </div>
  );

  const currentAdvice = ADVICE_DATA[selectedAnimal];

  return (
    <div style={{ padding: '24px', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          marginBottom: '32px',
          padding: '36px 24px',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          borderRadius: '24px',
        }}
      >
        <Lightbulb size={40} style={{ color: '#059669', marginBottom: '12px' }} />
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#065f46', margin: '0 0 8px' }}>
          🐾 Conseils & Astuces
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
          Des conseils d'experts pour prendre soin de votre compagnon
        </p>
      </motion.div>

      <div style={{ marginBottom: '32px' }}>
        <PetProductRecommendations
          limit={6}
          compact
          filterPetType={selectedAnimal === 'other' ? null : selectedAnimal}
          title="🛒 Produits recommandés pour votre animal"
        />
      </div>

      {/* Animal Selector */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '32px',
      }}>
        {Object.entries(ADVICE_DATA).map(([key, data]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setSelectedAnimal(key); setExpandedTip(null); }}
            style={{
              padding: '12px 24px',
              borderRadius: '16px',
              border: '2px solid',
              borderColor: selectedAnimal === key ? data.color : '#e5e7eb',
              background: selectedAnimal === key ? data.color : 'white',
              color: selectedAnimal === key ? 'white' : '#374151',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: selectedAnimal === key ? `0 4px 14px ${data.color}40` : '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.3s',
            }}
          >
            <span style={{ fontSize: '20px' }}>{data.icon}</span>
            {data.title}
          </motion.button>
        ))}
      </div>

      {/* IA Santé & Détection Caméra */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Sparkles size={24} color="#059669" />
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Analyse santé IA</h2>
              <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>Détection d’animal, recommandations nutritionnelles, accessoires et suivi vétérinaire.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button onClick={fetchHealthRecommendations} disabled={recommendLoading} style={buttonStyle('#2563eb')}>
                {recommendLoading ? 'Chargement...' : 'Voir recommandations santé automatiques'}
              </button>
              <button onClick={() => window.dispatchEvent(new CustomEvent('petfood:open-chat'))} style={buttonStyle('#9333ea')}>
                Ouvrir chatbot intelligent
              </button>
              <button onClick={() => window.location.assign('/veterinary')} style={buttonStyle('#0f766e')}>
                Réserver un vétérinaire
              </button>
            </div>

            {recommendError && <div style={alertStyle}>{recommendError}</div>}

            {healthRecommendations && (
              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={cardStyle('#f0f9ff')}>
                  <p style={sectionLabelStyle}>Nourriture recommandée</p>
                  <RecommendationList items={healthRecommendations.food} />
                </div>
                <div style={cardStyle('#f7f3ff')}>
                  <p style={sectionLabelStyle}>Accessoires recommandés</p>
                  <RecommendationList items={healthRecommendations.accessories} />
                </div>
                <div style={cardStyle('#ecfdf5')}>
                  <p style={sectionLabelStyle}>Médicaments & soins</p>
                  <RecommendationList items={healthRecommendations.medicines} />
                </div>
                <div style={cardStyle('#fff7ed')}>
                  <p style={sectionLabelStyle}>Vaccins conseillés</p>
                  {healthRecommendations.vaccines?.length ? (
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155' }}>
                      {healthRecommendations.vaccines.map((vaccine, idx) => <li key={idx}>{vaccine}</li>)}
                    </ul>
                  ) : (
                    <p style={{ margin: 0, color: '#64748b' }}>Aucune recommandation spécifique pour le moment.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Camera size={24} color="#f97316" />
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Détection d’animal avec caméra</h2>
              <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>Capture une photo et identifie l’animal grâce à Ultralytics YOLO.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {!cameraActive ? (
                <button onClick={startCamera} style={buttonStyle('#f97316')}>Démarrer la caméra</button>
              ) : (
                <button onClick={stopCamera} style={buttonStyle('#ef4444')}>Arrêter la caméra</button>
              )}
              <label style={uploadLabelStyle}>
                Importer une photo
                <input type="file" accept="image/*" onChange={handleUploadImage} style={{ display: 'none' }} />
              </label>
              {cameraActive && <button onClick={captureImage} style={buttonStyle('#10b981')}>Capturer et analyser</button>}
            </div>

            {detectError && <div style={alertStyle}>{detectError}</div>}
            {detectLoading && <div style={hintStyle}>Analyse en cours…</div>}

            <div style={{ display: 'grid', gap: '12px' }}>
              {cameraActive && (
                <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', borderRadius: '18px', background: '#000' }} />
              )}
              {capturedImage && (
                <img src={capturedImage} alt="Capture" style={{ width: '100%', borderRadius: '18px', objectFit: 'cover' }} />
              )}
            </div>

            {cameraResult && (
              <div style={cardStyle('#eff6ff')}>
                <p style={sectionLabelStyle}>Résultat de la détection</p>
                <p style={{ margin: '8px 0', color: '#0f172a' }}><strong>Animal détecté :</strong> {cameraResult.animalType || 'Inconnu'}</p>
                <p style={{ margin: '8px 0', color: '#334155' }}><strong>Classes détectées :</strong> {cameraResult.labels?.join(', ') || 'Aucune'}</p>
                <p style={{ margin: '8px 0', color: '#334155' }}><strong>Confiance :</strong> {cameraResult.scores?.map((score) => `${Math.round(score * 100)}%`).join(', ') || '—'}</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Bell size={24} color="#c2410c" />
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Calendrier de vaccination</h2>
              <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>Planifiez les vaccins de votre compagnon et activez des rappels automatiques.</p>
            </div>
          </div>

          <form onSubmit={addReminder} style={{ display: 'grid', gap: '12px' }}>
            <input value={vaccineName} onChange={(e) => setVaccineName(e.target.value)} placeholder="Nom du vaccin / traitement" style={inputStyle} />
            <input type="date" value={vaccineDate} onChange={(e) => setVaccineDate(e.target.value)} style={inputStyle} />
            <input value={vaccineNotes} onChange={(e) => setVaccineNotes(e.target.value)} placeholder="Notes (ex: rappel 1 an)" style={inputStyle} />
            <button type="submit" style={buttonStyle('#c2410c')}>Ajouter un rappel</button>
          </form>

          {nextReminder ? (
            <div style={{ marginTop: '16px', padding: '16px', borderRadius: '16px', background: '#fffbeb', border: '1px solid #fde68a' }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#92400e' }}>Prochain rappel :</p>
              <p style={{ margin: '8px 0 0', color: '#334155' }}>{nextReminder.name} — {nextReminder.date}</p>
              {nextReminder.notes && <p style={{ margin: '4px 0 0', color: '#475569' }}>{nextReminder.notes}</p>}
            </div>
          ) : (
            <p style={{ marginTop: '16px', color: '#64748b' }}>Aucun rappel planifié pour le moment.</p>
          )}

          {vaccineReminders.length > 0 && (
            <div style={{ marginTop: '18px' }}>
              {vaccineReminders.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', padding: '12px 14px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                    <div style={{ color: '#475569', fontSize: '13px' }}>{item.date} {item.notes ? `• ${item.notes}` : ''}</div>
                  </div>
                  <button onClick={() => removeReminder(item.id)} type="button" style={{ border: 'none', background: '#fef2f2', color: '#b91c1c', borderRadius: '12px', padding: '8px 12px', cursor: 'pointer' }}>Supprimer</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tips Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedAnimal}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: currentAdvice.color,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '28px' }}>{currentAdvice.icon}</span>
            Conseils pour votre {currentAdvice.title.toLowerCase()}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {currentAdvice.tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '18px 22px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                  border: '1px solid #f0f0f0',
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedTip(expandedTip === index ? null : index)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: currentAdvice.color,
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: `${currentAdvice.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {tip.icon}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '16px', color: '#1f2937' }}>
                      {tip.title}
                    </span>
                  </div>
                  {expandedTip === index ? <ChevronUp size={20} color="#9ca3af" /> : <ChevronDown size={20} color="#9ca3af" />}
                </div>
                <AnimatePresence>
                  {expandedTip === index && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        margin: '12px 0 0 52px',
                        color: '#4b5563',
                        lineHeight: 1.7,
                        fontSize: '14px',
                      }}
                    >
                      {tip.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: '32px',
          padding: '24px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '18px',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#92400e', fontSize: '16px' }}>
          💡 Besoin de conseils personnalisés ?
        </p>
        <p style={{ margin: 0, color: '#a16207', fontSize: '14px' }}>
          Remplissez le profil de votre animal dans <strong>Mon Profil</strong> pour recevoir des recommandations adaptées à ses besoins spécifiques.
        </p>
      </motion.div>
    </div>
  );
};

export default ClientPetAdvicePage;

