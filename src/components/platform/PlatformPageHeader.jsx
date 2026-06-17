import React from 'react';
import { Link } from 'react-router-dom';

/**
 * En-tête de page unifié — titre, description, liens et actions.
 */
const PlatformPageHeader = ({
  title,
  description,
  links = [],
  actions = null,
  emoji,
}) => (
  <header className="platform-page-header">
    <div className="platform-page-header__main">
      <h1 className="platform-page-header__title">
        {emoji ? <span className="platform-page-header__emoji" aria-hidden>{emoji}</span> : null}
        {title}
      </h1>
      {description && <p className="platform-page-header__desc">{description}</p>}
      {links.length > 0 && (
        <div className="platform-page-header__links">
          {links.map((link) => (
            <Link key={link.to} to={link.to}>{link.label}</Link>
          ))}
        </div>
      )}
    </div>
    {actions && <div className="platform-page-header__actions">{actions}</div>}
  </header>
);

export default PlatformPageHeader;
