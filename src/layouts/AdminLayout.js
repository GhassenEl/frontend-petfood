import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="workspace flex">
      <Sidebar user={user} onLogout={logout} />
      <main className="main-area">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

