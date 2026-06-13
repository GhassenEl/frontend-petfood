import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import ThemeToggles from './ThemeToggles';
import VisitorRouteLink from './VisitorRouteLink';

const sidebarBtnStyle = {
  width: '100%',
  boxSizing: 'border-box',
  border: 'none',
  background: 'transparent',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
};

const PublicSidebarItem = ({ item, basePath, onNavigate }) => {
  const content = (
    <>
      <span className="icon">{item.icon}</span>
      <span>{item.label}</span>
    </>
  );

  if (item.action === 'open-chat') {
    return (
      <button
        type="button"
        className="admin-sidebar-item"
        style={sidebarBtnStyle}
        onClick={() => {
          window.dispatchEvent(new CustomEvent('petfood:open-chat'));
          onNavigate?.();
        }}
      >
        {content}
      </button>
    );
  }

  if (item.href) {
    return (
      <a href={item.href} className="admin-sidebar-item" onClick={() => onNavigate?.()}>
        {content}
      </a>
    );
  }

  if (item.route) {
    return (
      <VisitorRouteLink
        route={item.route}
        className="admin-sidebar-item"
        onClick={() => onNavigate?.()}
      >
        {content}
      </VisitorRouteLink>
    );
  }

  if (item.to) {
    return (
      <NavLink
        to={item.to}
        onClick={() => onNavigate?.()}
        className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
      >
        {content}
      </NavLink>
    );
  }

  if (item.id && basePath) {
    return (
      <NavLink
        to={`${basePath}/${item.id}`}
        onClick={() => onNavigate?.()}
        className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
      >
        {content}
      </NavLink>
    );
  }

  return null;
};

const PublicHubSidebar = ({
  variant = 'visitor',
  title,
  subtitle,
  logo,
  sections = [],
  basePath,
  userBlock,
  onLogout,
  onNavigate,
}) => {
  const className = `livreur-sidebar public-hub-sidebar public-hub-sidebar--${variant}`;

  return (
    <aside className={className} aria-label={`Navigation ${variant}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">{logo}</div>
        <div>
          <h2>{title}</h2>
          <span>{subtitle}</span>
        </div>
      </div>

      {userBlock || null}

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.title} className="admin-sidebar-section">
            <p className="admin-sidebar-section-title">{section.title}</p>
            {section.items.map((item) => (
              <PublicSidebarItem
                key={item.id}
                item={item}
                basePath={basePath}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <ThemeToggles />
        {onLogout ? (
          <button type="button" onClick={onLogout} className="btn btn-danger">
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        ) : (
          <Link to="/login" className="btn btn-primary public-hub-sidebar__cta" onClick={() => onNavigate?.()}>
            <span>🔑</span>
            <span>Se connecter</span>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default PublicHubSidebar;
