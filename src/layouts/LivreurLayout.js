import React from 'react';
import LivreurSidebar from '../components/LivreurSidebar';
import { useAuth } from '../contexts/AuthContext';

const LivreurLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="livreur-layout workspace">
      <LivreurSidebar user={user} onLogout={logout} />
      <main className="main-area">
        {children}
      </main>
    </div>
  );

};

export default LivreurLayout;

