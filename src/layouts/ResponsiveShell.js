import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import PlatformLiveBadge from '../components/PlatformLiveBadge';
import CitySelector from '../components/CitySelector';
import GlobalSearchBar from '../components/GlobalSearchBar';

/**
 * En-tête mobile + panneau latéral coulissant pour les trois plateformes (client / admin / livreur).
 */
const ResponsiveShell = ({ children, sidebar, roleBadge, className = '', bottomNav = null, showCitySelector = true }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const openMenu = () => setMobileNavOpen(true);
    window.addEventListener('petfood:open-mobile-nav', openMenu);
    return () => window.removeEventListener('petfood:open-mobile-nav', openMenu);
  }, []);

  const closeNav = () => setMobileNavOpen(false);
  const toggleNav = () => setMobileNavOpen((o) => !o);

  return (
    <div
      className={`workspace flex platform-workspace ${bottomNav ? 'platform-workspace--with-bottom-nav' : ''} ${mobileNavOpen ? 'platform-workspace--nav-open' : ''} ${className}`.trim()}
    >
      <a href="#contenu-principal" className="skip-to-content">
        Aller au contenu
      </a>

      <header className="platform-mobile-header">
        <button
          type="button"
          className="platform-mobile-menu-btn"
          onClick={toggleNav}
          aria-expanded={mobileNavOpen}
          aria-controls="platform-sidebar-panel"
        >
          {mobileNavOpen ? <X size={22} strokeWidth={2.25} aria-hidden /> : <Menu size={22} strokeWidth={2.25} aria-hidden />}
          <span className="sr-only">{mobileNavOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
        </button>
        {roleBadge ? (
          <span className="platform-mobile-role" aria-hidden="true">
            {roleBadge}
          </span>
        ) : null}
        <GlobalSearchBar compact />
        <PlatformLiveBadge />
      </header>

      {mobileNavOpen ? (
        <button
          type="button"
          className="platform-sidebar-backdrop"
          aria-label="Fermer le menu de navigation"
          onClick={closeNav}
        />
      ) : null}

      <div id="platform-sidebar-panel" className="platform-sidebar-panel">
        {typeof sidebar === 'function' ? sidebar(closeNav) : sidebar}
      </div>

      <main id="contenu-principal" className="main-area main-area--platform" tabIndex={-1}>
        <div className="platform-live-bar">
          <GlobalSearchBar />
          <div className="platform-live-bar__right">
            <PlatformLiveBadge />
            {showCitySelector ? <CitySelector compact /> : null}
          </div>
        </div>
        <div className="page-content-shell">{children}</div>
      </main>
      {bottomNav}
    </div>
  );
};

export default ResponsiveShell;
