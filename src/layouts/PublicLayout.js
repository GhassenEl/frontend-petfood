import React from 'react';
import ResponsiveShell from './ResponsiveShell';
import MobileBottomNav, { AUTH_PUBLIC_MOBILE_NAV } from '../components/MobileBottomNav';

/** Layout public minimal (contact, pages sans compte). */
const PublicLayout = ({ children }) => (
  <ResponsiveShell
    className="public-layout"
    bottomNav={<MobileBottomNav items={AUTH_PUBLIC_MOBILE_NAV} />}
  >
    {children}
  </ResponsiveShell>
);

export default PublicLayout;
