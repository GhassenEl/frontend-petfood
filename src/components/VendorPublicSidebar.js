import React from 'react';
import PublicHubSidebar from './PublicHubSidebar';
import { VENDOR_PUBLIC_SIDEBAR_SECTIONS } from '../config/publicSidebarConfig';

const VendorPublicSidebar = ({ onNavigate }) => (
  <PublicHubSidebar
    variant="vendor"
    logo="🏬"
    title="Petfood Vendeur"
    subtitle="Marketplace publique"
    sections={VENDOR_PUBLIC_SIDEBAR_SECTIONS}
    onNavigate={onNavigate}
  />
);

export default VendorPublicSidebar;
