import React from 'react';
import PublicHubSidebar from './PublicHubSidebar';
import { MODERATOR_PUBLIC_SIDEBAR_SECTIONS } from '../config/publicSidebarConfig';

const ModeratorPublicSidebar = ({ onNavigate }) => (
  <PublicHubSidebar
    variant="moderator"
    logo="🛡️"
    title="Petfood Modération"
    subtitle="Communauté & contenus"
    sections={MODERATOR_PUBLIC_SIDEBAR_SECTIONS}
    onNavigate={onNavigate}
  />
);

export default ModeratorPublicSidebar;
