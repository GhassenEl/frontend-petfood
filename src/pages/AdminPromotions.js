import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Tag } from 'lucide-react';
import AdminProductPromotions from './AdminProductPromotions';
import AdminCouponsPanel from '../components/AdminCouponsPanel';

const AdminPromotions = () => {
  const [tab, setTab] = useState('products');

  return (
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
          <Package size={28} color="#e67e22" /> Promotions & coupons
        </h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Remises catalogue, codes promo checkout et campagnes commerciales
        </p>
      </motion.div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'products', label: 'Promotions produits', icon: Package },
          { id: 'coupons', label: 'Coupons & codes', icon: Tag },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 12,
              border: tab === id ? '2px solid #e67e22' : '1px solid #e5e7eb',
              background: tab === id ? '#fff7ed' : 'white',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'products' ? <AdminProductPromotions /> : <AdminCouponsPanel />}
    </div>
  );
};

export default AdminPromotions;
