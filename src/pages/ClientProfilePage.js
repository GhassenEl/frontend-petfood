import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import ClientPetsManager from '../components/ClientPetsManager';
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
  const [regions, setRegions] = useState([]);
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
      const [profileRes, regionsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/users/regions').catch(() => ({ data: [] })),
      ]);
      setProfile({
        name: profileRes.data.name || '',
        email: profileRes.data.email || '',
        phone: profileRes.data.phone || '',
        address: profileRes.data.address || '',
        region: profileRes.data.region || '',
      });
      setRegions(regionsRes.data || []);
    } catch (error) {
      console.error('Data fetch error', error);
    } finally {
      setLoading(false);
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
            <img 
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop&crop=face" 
              alt="Client Profile" 
              className="w-20 h-20 rounded-full object-cover shadow-2xl ring-4 ring-emerald-200/50 hover:scale-105 transition-transform duration-300 cursor-pointer drop-shadow-lg" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{display: 'none'}} className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-2xl drop-shadow-lg">
              <User size={28} className="text-white" />
            </div>
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
            <Tab label="🐾 Mes animaux" />
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Région / zone de livraison</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
                      value={profile.region}
                      onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                    >
                      <option value="">— Détectée depuis l&apos;adresse —</option>
                      {regions.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Utilisée pour trouver le vétérinaire le plus proche de chez vous.</p>
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
            <CardContent className="p-6">
              <ClientPetsManager compact />
            </CardContent>
          </TabPanel>

        </Box>

      </div>
    </div>
  );
};

export default ClientProfilePage;
