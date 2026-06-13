import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import AdminNlpModelSelector from '../components/AdminNlpModelSelector';

const AdminNlpModelsPage = () => (
  <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginBottom: 24,
        padding: '24px 28px',
        borderRadius: 20,
        background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #8b5cf6 100%)',
        color: 'white',
      }}
    >
      <h1 style={{ margin: '0 0 8px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Brain size={28} /> Modèles NLP — administration
      </h1>
      <p style={{ margin: 0, opacity: 0.92, fontSize: 14, lineHeight: 1.5 }}>
        Choisissez le modèle de prédiction texte (sentiment, intent) entre BERT, LSTM et GRU
        en fonction des métriques d&apos;évaluation sur le jeu de validation.
      </p>
      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13 }}>
        <Link to="/admin/powerbi" style={{ color: '#ede9fe' }}>← Power BI</Link>
        <Link to="/admin/dashboard" style={{ color: '#ede9fe' }}>Dashboard →</Link>
      </div>
    </motion.header>

    <AdminNlpModelSelector />
  </div>
);

export default AdminNlpModelsPage;
