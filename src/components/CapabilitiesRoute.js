import React from 'react';
import AdminLayout from '../layouts/AdminLayout';
import ClientLayout from '../layouts/ClientLayout';
import LivreurLayout from '../layouts/LivreurLayout';
import VetLayout from '../layouts/VetLayout';
import VendorLayout from '../layouts/VendorLayout';
import ModeratorLayout from '../layouts/ModeratorLayout';
import ServiceClientLayout from '../layouts/ServiceClientLayout';
import VisitorLayout from '../layouts/VisitorLayout';
import PlatformCapabilitiesPage from '../pages/PlatformCapabilitiesPage';

const LAYOUT_BY_ROLE = {
  admin: AdminLayout,
  client: ClientLayout,
  livreur: LivreurLayout,
  vet: VetLayout,
  vendor: VendorLayout,
  moderator: ModeratorLayout,
  support: ServiceClientLayout,
};

/** Matrice capacités dans le layout du rôle connecté (mobile + sidebar). */
const CapabilitiesRoute = ({ user }) => {
  if (!user) {
    return (
      <VisitorLayout>
        <PlatformCapabilitiesPage />
      </VisitorLayout>
    );
  }
  const Layout = LAYOUT_BY_ROLE[user.role] || ClientLayout;
  return (
    <Layout>
      <PlatformCapabilitiesPage />
    </Layout>
  );
};

export default CapabilitiesRoute;
