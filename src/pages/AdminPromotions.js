import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import AdminProductPromotions from './AdminProductPromotions';

const AdminPromotions = () => (
  <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
        borderRadius: 18,
        padding: 24,
        marginBottom: 24,
        border: '1px solid #fed7aa',
      }}
    >
      <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Package size={28} color="#e67e22" /> Promotions produits
      </h1>
      <p style={{ margin: 0, color: '#6b7280' }}>
        Gérez les remises et soldes sur le catalogue (sans codes promo au checkout).
      </p>
    </motion.div>
    <AdminProductPromotions />
  </div>
);

export default AdminPromotions;
