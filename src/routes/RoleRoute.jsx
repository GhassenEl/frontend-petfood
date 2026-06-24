import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getRoleHome } from '../config/roleConfig';
import {
  needs2FASetup,
  canAccessWithout2FA,
  getSecurityHubRoute,
  TWO_FA_CHANGED_EVENT,
} from '../utils/twoFactorPolicy';
import { isAuditProtectedPath, canAccessAuditFeatures } from '../utils/auditSecurityPolicy';

const RoleRoute = ({ user, roles, children }) => {
  const location = useLocation();
  const [, setGateTick] = useState(0);

  useEffect(() => {
    const onChange = () => setGateTick((n) => n + 1);
    window.addEventListener(TWO_FA_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(TWO_FA_CHANGED_EVENT, onChange);
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  if (needs2FASetup(user) && !canAccessWithout2FA(location, user.role)) {
    const hub = getSecurityHubRoute(user.role);
    return <Navigate to={hub} replace state={{ require2fa: true }} />;
  }

  if (isAuditProtectedPath(location.pathname) && !canAccessAuditFeatures(user)) {
    return (
      <Navigate
        to="/admin/account-security"
        replace
        state={{ require2fa: true, auditBlocked: true }}
      />
    );
  }

  return children;
};

export default RoleRoute;
