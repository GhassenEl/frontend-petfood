import React from 'react';
import ClientSidebar from '../components/ClientSidebar';
import { useAuth } from '../contexts/AuthContext';

const ClientLayout = ({ children }) => {
  const { logout } = useAuth();

  return (
    <div className="workspace flex">
      <ClientSidebar onLogout={logout} />
      <main className="main-area">
        {children}
      </main>
    </div>
  );
};
export default ClientLayout;