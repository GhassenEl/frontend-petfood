import React from 'react';
import ModeratorPublicSidebar from '../components/ModeratorPublicSidebar';
import ChatAssistant from '../components/ChatAssistant';
import ResponsiveShell from './ResponsiveShell';
import MobileBottomNav, { MODERATOR_PUBLIC_MOBILE_NAV } from '../components/MobileBottomNav';

const ModeratorPublicLayout = ({ children }) => (
  <ResponsiveShell
    className="moderator-public-layout"
    roleBadge="Modération"
    bottomNav={<MobileBottomNav items={MODERATOR_PUBLIC_MOBILE_NAV} />}
    sidebar={(onClose) => <ModeratorPublicSidebar onNavigate={onClose} />}
  >
    {children}
    <ChatAssistant variant="moderator" />
  </ResponsiveShell>
);

export default ModeratorPublicLayout;
