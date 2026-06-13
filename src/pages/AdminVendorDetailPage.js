import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import VendorDashboardPage from './VendorDashboardPage';

const AdminVendorDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <div style={{ padding: '16px 24px 0', maxWidth: 1100, margin: '0 auto' }}>
        <Link
          to="/admin/vendors"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#0f766e', fontWeight: 700, textDecoration: 'none', fontSize: 14,
          }}
        >
          <ArrowLeft size={16} />
          Retour aux fournisseurs
        </Link>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
          Vue admin — détail marketplace (lecture seule)
        </p>
      </div>
      <VendorDashboardPage vendorId={id} adminPreview />
    </div>
  );
};

export default AdminVendorDetailPage;
