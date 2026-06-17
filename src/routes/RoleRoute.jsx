import React from 'react';
import { Navigate } from 'react-router-dom';
import { getRoleHome } from '../config/roleConfig';

const RoleRoute = ({ user, roles, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }
  return children;
};

export default RoleRoute;
