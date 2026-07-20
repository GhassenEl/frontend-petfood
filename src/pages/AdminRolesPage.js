import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Shield, Trash2, Save, X, RefreshCw } from 'lucide-react';
import {
  fetchRoles,
  fetchPermissionCatalog,
  createRole,
  updateRole,
  deleteRole,
} from '../services/adminRolesService';
import './AdminPages.css';

const emptyForm = () => ({
  label: '',
  slug: '',
  description: '',
  homeRoute: '/admin/dashboard',
  basedOn: 'moderator',
  permissions: [],
  isActive: true,
});

const AdminRolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [catalog, setCatalog] = useState({ permissions: [], byModule: {}, systemRoles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [roleList, permCat] = await Promise.all([fetchRoles(), fetchPermissionCatalog()]);
      setRoles(Array.isArray(roleList) ? roleList : []);
      setCatalog(permCat || { permissions: [], byModule: {}, systemRoles: [] });
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Impossible de charger les rôles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const customRoles = useMemo(() => roles.filter((r) => !r.isSystem), [roles]);
  const systemRoles = useMemo(() => roles.filter((r) => r.isSystem), [roles]);

  const modules = useMemo(() => Object.keys(catalog.byModule || {}).sort(), [catalog]);

  const openCreate = () => {
    setEditingId(null);
    const base = emptyForm();
    const basedPerms = catalog.systemRoles?.length
      ? roles.find((r) => r.slug === 'moderator')?.permissions?.filter((p) => p !== '*') || []
      : [];
    setForm({ ...base, permissions: basedPerms });
    setShowForm(true);
  };

  const openEdit = (role) => {
    if (role.isSystem) return;
    setEditingId(role.id);
    setForm({
      label: role.label,
      slug: role.slug,
      description: role.description || '',
      homeRoute: role.homeRoute || '/admin/dashboard',
      basedOn: role.basedOn || '',
      permissions: [...(role.permissions || [])],
      isActive: role.isActive !== false,
    });
    setShowForm(true);
  };

  const togglePerm = (key) => {
    setForm((f) => {
      const has = f.permissions.includes(key);
      return {
        ...f,
        permissions: has ? f.permissions.filter((p) => p !== key) : [...f.permissions, key],
      };
    });
  };

  const applyBasedOn = (slug) => {
    const src = roles.find((r) => r.slug === slug);
    setForm((f) => ({
      ...f,
      basedOn: slug,
      permissions: (src?.permissions || []).filter((p) => p !== '*'),
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) {
      setError('Le libellé est obligatoire.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateRole(editingId, {
          label: form.label,
          description: form.description,
          homeRoute: form.homeRoute,
          permissions: form.permissions,
          isActive: form.isActive,
          basedOn: form.basedOn || null,
        });
        setFlash('Rôle mis à jour.');
      } else {
        await createRole({
          label: form.label,
          slug: form.slug || undefined,
          description: form.description,
          homeRoute: form.homeRoute,
          permissions: form.permissions,
          basedOn: form.basedOn || undefined,
          isActive: form.isActive,
        });
        setFlash('Nouveau rôle créé.');
      }
      setShowForm(false);
      setForm(emptyForm());
      setEditingId(null);
      await load();
      setTimeout(() => setFlash(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Échec enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (role) => {
    if (!window.confirm(`Supprimer le rôle « ${role.label} » ?`)) return;
    try {
      await deleteRole(role.id);
      setFlash('Rôle supprimé.');
      await load();
      setTimeout(() => setFlash(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Suppression impossible.');
    }
  };

  if (loading) {
    return (
      <div className="adm-page">
        <p>Chargement des rôles…</p>
      </div>
    );
  }

  return (
    <div className="adm-page" style={{ maxWidth: 1100 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={26} /> Rôles & permissions
          </h1>
          <p style={{ margin: '8px 0 0', color: '#64748b', maxWidth: 560 }}>
            Créez des rôles personnalisés et cochez les permissions. Assignez-les ensuite dans{' '}
            <Link to="/admin/users">Utilisateurs</Link>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={load} title="Actualiser">
            <RefreshCw size={16} />
          </button>
          <button type="button" className="adm-btn adm-btn--primary" onClick={openCreate}>
            <Plus size={16} /> Nouveau rôle
          </button>
        </div>
      </header>

      {flash && (
        <div role="status" style={{ background: '#ecfdf5', color: '#065f46', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>
          {flash}
        </div>
      )}
      {error && (
        <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Rôles personnalisés ({customRoles.length})</h2>
        {customRoles.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Aucun rôle custom pour l’instant. Cliquez sur « Nouveau rôle ».</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {customRoles.map((role) => (
              <article
                key={role.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                    {role.label}{' '}
                    <code style={{ fontWeight: 500, fontSize: 12, color: '#0f766e', background: '#f0fdfa', padding: '2px 6px', borderRadius: 4 }}>
                      {role.slug}
                    </code>
                    {!role.isActive && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: '#b45309', background: '#fffbeb', padding: '2px 8px', borderRadius: 999 }}>
                        Inactif
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '6px 0', color: '#64748b', fontSize: 13 }}>{role.description || '—'}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                    Accueil : {role.homeRoute} · {role.permissions?.length || 0} permission(s)
                    {role.basedOn ? ` · basé sur ${role.basedOn}` : ''}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {(role.permissions || []).slice(0, 8).map((p) => (
                      <span key={p} style={{ fontSize: 11, background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: 4 }}>
                        {p}
                      </span>
                    ))}
                    {(role.permissions || []).length > 8 && (
                      <span style={{ fontSize: 11, color: '#64748b' }}>+{role.permissions.length - 8}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button type="button" className="adm-btn adm-btn--ghost" onClick={() => openEdit(role)}>
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn--ghost"
                    onClick={() => remove(role)}
                    title="Supprimer"
                    style={{ color: '#b91c1c' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Rôles système (lecture seule)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
          {systemRoles.map((role) => (
            <div
              key={role.slug}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: 12,
              }}
            >
              <strong>{role.label}</strong>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                <code>{role.slug}</code>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                {role.permissions?.includes('*')
                  ? 'Toutes les permissions'
                  : `${role.permissions?.length || 0} permissions`}
              </div>
            </div>
          ))}
        </div>
      </section>

      {showForm && (
        <div
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.45)',
            zIndex: 80,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '40px 16px',
            overflow: 'auto',
          }}
          onClick={() => setShowForm(false)}
        >
          <form
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            onSubmit={save}
            style={{
              background: '#fff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 720,
              padding: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>{editingId ? 'Modifier le rôle' : 'Nouveau rôle'}</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Fermer" style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Libellé *</span>
                <input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Ex. Responsable SAV"
                  required
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Slug {editingId ? '(fixe)' : '(auto)'}</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="responsable_sav"
                  disabled={Boolean(editingId)}
                  style={{ ...inputStyle, opacity: editingId ? 0.6 : 1 }}
                />
              </label>
            </div>

            <label style={{ display: 'grid', gap: 4, marginTop: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Qui utilise ce rôle et pour quoi ?"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Page d’accueil</span>
                <input
                  value={form.homeRoute}
                  onChange={(e) => setForm({ ...form, homeRoute: e.target.value })}
                  placeholder="/admin/dashboard"
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Partir du modèle</span>
                <select
                  value={form.basedOn}
                  onChange={(e) => applyBasedOn(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">— Aucun —</option>
                  {systemRoles
                    .filter((r) => r.slug !== 'admin')
                    .map((r) => (
                      <option key={r.slug} value={r.slug}>
                        {r.label}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Rôle actif (assignable aux utilisateurs)
            </label>

            <h3 style={{ margin: '20px 0 8px', fontSize: '0.95rem' }}>
              Permissions ({form.permissions.length})
            </h3>
            <div style={{ maxHeight: 320, overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
              {modules.map((mod) => (
                <div key={mod} style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: '#0f766e', marginBottom: 6 }}>
                    {mod}
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    {(catalog.byModule[mod] || []).map((p) => (
                      <label
                        key={p.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 13,
                          padding: '4px 6px',
                          borderRadius: 6,
                          background: form.permissions.includes(p.key) ? '#f0fdfa' : 'transparent',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(p.key)}
                          onChange={() => togglePerm(p.key)}
                        />
                        <span>{p.label}</span>
                        <code style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8' }}>{p.key}</code>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setShowForm(false)}>
                Annuler
              </button>
              <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
};

export default AdminRolesPage;
