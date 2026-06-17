import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Rendu navigation config-driven — réutilisable par rôle (client, vet, etc.).
 */
const ConfigSidebarNav = ({
  sections = [],
  routePrefix = '',
  onNavigate,
  getBadge,
  itemClassName = 'admin-sidebar-item',
  sectionTitleClassName = 'admin-sidebar-section-title',
}) => (
  <>
    {sections.map((section) => (
      <div key={section.title} className="admin-sidebar-section">
        <p className={sectionTitleClassName}>{section.title}</p>
        {section.items.map((item) => {
          if (item.action === 'open-chat') {
            return (
              <button
                key={item.id}
                type="button"
                className={itemClassName}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: 'none',
                  background: 'transparent',
                  font: 'inherit',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('petfood:open-chat'));
                  onNavigate?.();
                }}
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          }

          const badge = getBadge?.(item.id);
          const to = item.route || `${routePrefix}${item.id}`;

          return (
            <NavLink
              key={item.id}
              to={to}
              onClick={() => onNavigate?.()}
              className={({ isActive }) => `${itemClassName} ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}
            >
              <span className="icon">{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {badge && (
                <span className={`vet-sidebar-badge${badge.tone === 'warn' ? ' vet-sidebar-badge--warn' : badge.tone === 'info' ? ' vet-sidebar-badge--info' : ''}`}>
                  {badge.count}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    ))}
  </>
);

export default ConfigSidebarNav;
