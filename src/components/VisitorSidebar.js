import React from 'react';
import PublicHubSidebar from './PublicHubSidebar';
import { VISITOR_SIDEBAR_SECTIONS } from '../config/publicSidebarConfig';

const VisitorSidebar = ({ onNavigate }) => (
  <PublicHubSidebar
    variant="visitor"
    logo="👀"
    title="Petfood Visiteur"
    subtitle="Accès libre"
    sections={VISITOR_SIDEBAR_SECTIONS}
    onNavigate={onNavigate}
  />
);

export default VisitorSidebar;
