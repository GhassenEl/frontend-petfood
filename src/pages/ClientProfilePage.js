import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import RegionSelect from '../components/RegionSelect';
import SidebarAvatar from '../components/SidebarAvatar';
import { CardContent, Button, TextField, Tabs, Tab, Box, CircularProgress, Alert } from '@mui/material';
import { User } from 'lucide-react';

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ClientProfilePage = () => {
  useAuth();
  const [value, setValue] = useState(0);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', region: '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await api.get('/users/profile');
      setProfile({
        name: profileRes.data.name || '',
        email: profileRes.data.email || '',
        phone: profileRes.data.phone || '',
        address: profileRes.data.address || '',
        region: profileRes.data.region || '',
      });
    } catch (error) {
      console.error('Data fetch error', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmNewPassword) {
      setMessage('❌ Les mots de passe ne correspondent pas');
      return;
    }
    if (pwdForm.newPassword.length < 8) {
      setMessage('❌ Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setPwdSaving(true);
    try {
      await api.put('/auth/change-password', pwdForm);
      setMessage('✅ Mot de passe modifié !');
      setPwdForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      setMessage('❌ Erreur: ' + (error.response?.data?.error || error.message));
    } finally {
      setPwdSaving(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...profile };
      await api.put('/users/profile', payload);
      setMessage('✅ Profil sauvegardé !');
    } catch (error) {
      setMessage('❌ Erreur: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-2xl border border-white/50">
            <SidebarAvatar
              user={profile}
              role="client"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
              }}
            />
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-1">
                Mon Profil
              </h1>
              <p className="text-lg text-gray-600 font-medium">Gérez vos informations personnelles</p>
            </div>
          </div>
        </div>

        {message && (
          <Alert severity={message.includes('✅') ? "success" : "error"} className="mx-auto max-w-2xl animate-pulse">
            {message}
            <Button onClick={() => setMessage('')} size="small" sx={{ ml: 2 }}>
              Fermer
            </Button>
          </Alert>
        )}

        <Box sx={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}>
          <Tabs value={value} onChange={handleChange} variant="fullWidth" className="bg-white">
            <Tab label="👤 Profil Personnel" />
            <Tab label="🔐 Mot de passe" />
          </Tabs>

          {/* Profile Tab */}
          <TabPanel value={value} index={0}>
            <CardContent className="p-8">
              <form onSubmit={handleProfileSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <TextField fullWidth value={profile.email} disabled variant="outlined" slotProps={{ input: { className: 'bg-gray-50' } }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
                    <TextField fullWidth value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} required variant="outlined" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                    <TextField fullWidth value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} variant="outlined" />
                  </div>
                  <div>
                    <RegionSelect
                      label="Région / zone de livraison"
                      value={profile.region}
                      onChange={(region) => setProfile({ ...profile, region })}
                      emptyLabel="— Détectée depuis l'adresse —"
                      hint="Utilisée pour trouver le vétérinaire le plus proche et filtrer les offres locales."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                    <TextField fullWidth multiline rows={3} value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} variant="outlined" />
                  </div>
                  <Button type="submit" disabled={saving} variant="contained" size="large" className="bg-gradient-to-r from-emerald-500 to-emerald-600 w-full">
                    {saving ? <CircularProgress size={24} /> : '💾 Sauvegarder'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </TabPanel>

          <TabPanel value={value} index={1}>
            <CardContent className="p-8">
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe actuel</label>
                    <TextField
                      fullWidth
                      type="password"
                      value={pwdForm.currentPassword}
                      onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                      required
                      variant="outlined"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nouveau mot de passe</label>
                    <TextField
                      fullWidth
                      type="password"
                      value={pwdForm.newPassword}
                      onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                      required
                      variant="outlined"
                      helperText="Minimum 8 caractères"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                    <TextField
                      fullWidth
                      type="password"
                      value={pwdForm.confirmNewPassword}
                      onChange={(e) => setPwdForm({ ...pwdForm, confirmNewPassword: e.target.value })}
                      required
                      variant="outlined"
                    />
                  </div>
                  <Button type="submit" disabled={pwdSaving} variant="contained" size="large" className="bg-gradient-to-r from-emerald-500 to-emerald-600 w-full">
                    {pwdSaving ? <CircularProgress size={24} /> : '🔐 Mettre à jour le mot de passe'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </TabPanel>

        </Box>

      </div>
    </div>
  );
};

export default ClientProfilePage;
