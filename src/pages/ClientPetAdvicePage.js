import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Heart, Utensils, Activity, Droplets, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api';

const ADVICE_DATA = {
  dog: {
    icon: '🐶',
    title: 'Chien',
    color: '#e67e22',
    tips: [
      { icon: <Utensils size={18} />, title: 'Alimentation', text: 'Privilégiez les croquettes riches en protéines animales (minimum 25 %). Évitez le chocolat, l\'oignon et le raisin qui sont toxiques.' },
      { icon: <Droplets size={18} />, title: 'Hydratation', text: 'Un chien doit boire entre 50 et 80 ml d\'eau par kg de poids corporel par jour. Changez l\'eau fraîchement 2 fois par jour.' },
      { icon: <Activity size={18} />, title: 'Exercice', text: 'Au moins 30 minutes de marche quotidienne pour les petites races, jusqu\'à 2 h pour les grandes races actives.' },
      { icon: <Shield size={18} />, title: 'Santé', text: 'Vaccination annuelle obligatoire (rage, maladie de Carré, hépatite). Vermifugation tous les 3-6 mois.' },
      { icon: <Heart size={18} />, title: 'Bien-être', text: 'Brossez le pelage 2-3 fois par semaine pour stimuler la circulation sanguine et réduire la perte de poils.' },
    ],
  },
  cat: {
    icon: '🐱',
    title: 'Chat',
    color: '#8e44ad',
    tips: [
      { icon: <Utensils size={18} />, title: 'Alimentation', text: 'Les chats sont carnivores stricts : leur alimentation doit contenir au moins 26 % de protéines animales. Privilégiez les aliments riches en taurine.' },
      { icon: <Droplets size={18} />, title: 'Hydratation', text: 'Les chats ont une soif faible : proposez une fontaine à eau pour les inciter à boire. L\'eau fraîche changée quotidiennement est essentielle.' },
      { icon: <Activity size={18} />, title: 'Environnement', text: 'Un arbre à chat, des jouets interactifs et des griffoirs sont indispensables pour leur bien-être mental et physique.' },
      { icon: <Shield size={18} />, title: 'Santé', text: 'Stérilisation recommandée vers 6 mois. Vaccination (coryza, leucose, rage) et vermifugation régulière.' },
      { icon: <Heart size={18} />, title: 'Toilettage', text: 'Brossage régulier selon la longueur du poil. Les chats à poil long nécessitent un brossage quotidien.' },
    ],
  },
  bird: {
    icon: '🐦',
    title: 'Oiseau',
    color: '#3498db',
    tips: [
      { icon: <Utensils size={18} />, title: 'Alimentation', text: 'Mélange de graines de qualité + fruits frais (pomme, raisin sans pépins) et légumes (carotte, épinards). Évitez l\'avocat.' },
      { icon: <Droplets size={18} />, title: 'Hydratation', text: 'Eau fraîche changée quotidiennement. Proposez un bain 2-3 fois par semaine pour l\'hygiène du plumage.' },
      { icon: <Activity size={18} />, title: 'Environnement', text: 'Cage spacieuse (minimum 2× la largeur des ailes déployées). Placez-la dans un endroit lumineux sans courants d\'air.' },
      { icon: <Shield size={18} />, title: 'Santé', text: 'Vermifugation annuelle. Surveillez les selles : toute modification peut signaler une maladie.' },
      { icon: <Heart size={18} />, title: 'Socialisation', text: 'Parlez-leur régulièrement. Les oiseaux sociaux (perroquets) ont besoin d\'interaction quotidienne d\'au moins 2-3 h.' },
    ],
  },
  fish: {
    icon: '🐠',
    title: 'Poisson',
    color: '#1abc9c',
    tips: [
      { icon: <Utensils size={18} />, title: 'Alimentation', text: 'Variez les aliments : granulés de base + nourriture vivante ou congelée (artémias, daphnies) 2-3 fois par semaine.' },
      { icon: <Droplets size={18} />, title: 'Eau', text: 'Testez régulièrement les paramètres (pH, nitrites, nitrates). Changez 20-25 % de l\'eau hebdomadairement.' },
      { icon: <Activity size={18} />, title: 'Aquarium', text: 'Règle de base : 1 litre d\'eau par cm de poisson adulte. Un aquarium planté réduit le stress et améliore la qualité de l\'eau.' },
      { icon: <Shield size={18} />, title: 'Santé', text: 'Quarantaine de 2 semaines pour les nouveaux poissons. Surveillez les signes de maladie : nage anormale, taches blanches, refus de nourriture.' },
      { icon: <Heart size={18} />, title: 'Lumière', text: '8-10 h de lumière par jour maximum. Trop de lumière favorise les algues. Utilisez un programmateur.' },
    ],
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
    ],
  },
};

const PET_LABELS = { dog: 'chien', cat: 'chat', bird: 'oiseau', fish: 'poisson', other: 'animal' };

const ClientPetAdvicePage = () => {
  const { user } = useAuth();
  const [selectedAnimal, setSelectedAnimal] = useState('dog');
  const [expandedTip, setExpandedTip] = useState(null);
  const [clientPets, setClientPets] = useState([]);
  const [profilePetType, setProfilePetType] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profileRes, petsRes] = await Promise.all([
          api.get('/users/profile').catch(() => ({ data: null })),
          api.get('/pets').catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;
        const profile = profileRes.data;
        const pets = Array.isArray(petsRes.data) ? petsRes.data : [];
        setClientPets(pets);
        const type = profile?.petType || pets[0]?.type;
        if (type && ADVICE_DATA[type]) {
          setProfilePetType(type);
          setSelectedAnimal(type);
        }
      } catch {
        /* profil indisponible — défaut chien */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const currentAdvice = ADVICE_DATA[selectedAnimal];
  const firstName = user?.name?.split(' ')[0] || 'Client';
  const profilePetLabel = profilePetType ? PET_LABELS[profilePetType] : null;

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          marginBottom: '28px',
          padding: '32px 24px',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          borderRadius: '24px',
        }}
      >
        <Lightbulb size={40} style={{ color: '#059669', marginBottom: '12px' }} />
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#065f46', margin: '0 0 8px' }}>
          🐾 Conseils & Astuces
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
          {profilePetLabel
            ? `Bonjour ${firstName} — conseils adaptés à votre ${profilePetLabel} et aux autres compagnons.`
            : `Bonjour ${firstName} — des conseils d'experts pour chaque type d'animal.`}
        </p>
      </motion.div>

      {clientPets.length > 0 && (
        <div style={{
          marginBottom: '24px',
          padding: '16px 20px',
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
        }}
        >
          <p style={{ margin: '0 0 10px', fontWeight: 800, color: '#334155', fontSize: 14 }}>
            🐾 Vos animaux enregistrés
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {clientPets.map((pet) => {
              const type = pet.type && ADVICE_DATA[pet.type] ? pet.type : 'other';
              return (
                <button
                  key={pet.id || pet._id || pet.name}
                  type="button"
                  onClick={() => { setSelectedAnimal(type); setExpandedTip(null); }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 12,
                    border: selectedAnimal === type ? `2px solid ${ADVICE_DATA[type].color}` : '1px solid #e2e8f0',
                    background: selectedAnimal === type ? `${ADVICE_DATA[type].color}15` : '#f8fafc',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {ADVICE_DATA[type]?.icon || '🐾'} {pet.name}
                  {pet.type ? ` (${ADVICE_DATA[type]?.title || pet.type})` : ''}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '28px',
      }}
      >
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
            }}
          >
            <span style={{ fontSize: '20px' }}>{data.icon}</span>
            {data.title}
          </motion.button>
        ))}
      </div>

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
          }}
          >
            <span style={{ fontSize: '28px' }}>{currentAdvice.icon}</span>
            Conseils pour votre {currentAdvice.title.toLowerCase()}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {currentAdvice.tips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
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
                }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: currentAdvice.color }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: `${currentAdvice.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    >
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
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
        <p style={{ margin: '0 0 12px', color: '#a16207', fontSize: '14px' }}>
          Utilisez l&apos;assistant en bas à droite (sous le panier) ou complétez votre profil animal.
        </p>
        <Link to="/profile" style={{ color: '#b45309', fontWeight: 700, fontSize: 14 }}>
          Mon profil →
        </Link>
      </motion.div>
    </div>
  );
};

export default ClientPetAdvicePage;
