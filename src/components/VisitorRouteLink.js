import React from 'react';
import { Link } from 'react-router-dom';

/** Liens internes avec ancre (#services, #acteurs…) compatibles React Router. */
export const resolveVisitorRoute = (route) => {
  if (!route || route === '#') {
    return { kind: 'anchor', href: '#' };
  }
  if (!route.startsWith('/')) {
    return { kind: 'anchor', href: route };
  }
  const hashIndex = route.indexOf('#');
  if (hashIndex === -1) {
    return { kind: 'route', to: route };
  }
  return {
    kind: 'route',
    to: { pathname: route.slice(0, hashIndex) || '/', hash: route.slice(hashIndex) },
  };
};

const VisitorRouteLink = ({ route, className, children, onClick, ...rest }) => {
  const resolved = resolveVisitorRoute(route);
  if (resolved.kind === 'anchor') {
    return (
      <a href={resolved.href} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={resolved.to} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
};

export default VisitorRouteLink;