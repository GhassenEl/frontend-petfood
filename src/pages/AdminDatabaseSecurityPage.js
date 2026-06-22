import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';
import DatabaseSecurityPanel from '../components/DatabaseSecurityPanel';
import { loadDatabaseSecurityPack } from '../services/databaseSecurityService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import DemoModePill from '../components/DemoModePill';
import './AdminIntelligentSecurity.css';
import './AdminPages.css';

const AdminDatabaseSecurityPage = () => {
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadDatabaseSecurityPack());
    } catch (e) {
      console.error(e);
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load, [load]);

  return (
    <div className="ais-page">
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.6rem' }}>
            <Database size={28} color="#2563eb" aria-hidden />
            Sécurité base de données
          </h1>
          {pack?.mode === 'demo' && <DemoModePill />}
        </div>
        <p className="ais-lead">
          PostgreSQL — chiffrement, contrôle d&apos;accès, requêtes paramétrées, sauvegardes et journal anti-injection SQL.
          {' '}
          <Link to="/admin/security" style={{ color: '#7c3aed', fontWeight: 700 }}>Centre de sécurité →</Link>
          {' · '}
          <Link to="/admin/performance" style={{ color: '#2563eb', fontWeight: 700 }}>Performance SQL →</Link>
        </p>
      </header>

      <DatabaseSecurityPanel pack={pack} loading={loading} onRefresh={load} />
    </div>
  );
};

export default AdminDatabaseSecurityPage;
