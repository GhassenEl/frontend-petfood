import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Heart, Utensils, Activity, Droplets, Shield, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [selectedAnimal, setSelectedAnimal] = useState('dog');
  const [expandedTip, setExpandedTip] = useState(null);

  const currentAdvice = ADVICE_DATA[selectedAnimal];

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
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

