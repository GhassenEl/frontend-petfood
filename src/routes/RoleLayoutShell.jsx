import React from 'react';
import AdminLayout from '../layouts/AdminLayout';
import ClientLayout from '../layouts/ClientLayout';
import LivreurLayout from '../layouts/LivreurLayout';
import VetLayout from '../layouts/VetLayout';
import VendorLayout from '../layouts/VendorLayout';
import ModeratorLayout from '../layouts/ModeratorLayout';
import ServiceClientLayout from '../layouts/ServiceClientLayout';

const LAYOUT_BY_ROLE = {
  admin: AdminLayout,
  client: ClientLayout,
  livreur: LivreurLayout,
  vet: VetLayout,
  vendor: VendorLayout,
  moderator: ModeratorLayout,
  support: ServiceClientLayout,
};

const RoleLayoutShell = ({ user, children }) => {
  const Layout = LAYOUT_BY_ROLE[user?.role];
  return Layout ? <Layout>{children}</Layout> : children;
};

export default RoleLayoutShell;
