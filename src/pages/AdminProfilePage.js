import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { Card, CardContent, Button, Typography, TextField, CircularProgress, Alert } from '@mui/material';
import { User, Shield, Phone, MapPin, Mail } from 'lucide-react';

const AdminProfilePage = () => {
  useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        address: res.data.address || ''
      });
    } catch (error) {
      console.error('Profile fetch error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/users/profile', profile);
      setMessage('✅ Profil administrateur mis à jour avec succès !');
    } catch (error) {
      setMessage('❌ Erreur lors de la mise à jour : ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <CircularProgress sx={{ color: '#e67e22' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-2xl border border-white/50">
            <img 
              src="https://images.unsplash.com/photo-1581578731548-67da954d8d0f?w=300&h=300&fit=crop&crop=face" 
              alt="Admin Profile" 
              className="w-16 h-16 rounded-full object-cover shadow-2xl ring-4 ring-orange-200/50 hover:scale-105 transition-transform duration-300 cursor-pointer drop-shadow-lg" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{display: 'none'}} className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full shadow-2xl drop-shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1">
                Mon Profil Admin
              </h1>
              <p className="text-base text-gray-600 font-medium">Gérez vos informations administrateur</p>
            </div>
          </div>
        </div>

        {message && (
          <Alert severity={message.includes('✅') ? "success" : "error"} className="mx-auto max-w-xl">
            {message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="shadow-xl hover:shadow-2xl transition-all overflow-hidden border-0">
            <CardContent className="p-8">
              <Typography variant="h5" className="font-bold mb-8 flex items-center gap-2 text-gray-800">
                <User size={24} className="text-orange-500" />
                Informations administrateur
              </Typography>

              <div className="space-y-6">
                {/* Email (readonly) */}
                <div className="flex items-start gap-4">
                  <div className="mt-3 text-orange-400">
                    <Mail size={20} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <TextField
                      fullWidth
                      value={profile.email}
                      disabled
                      variant="outlined"
                      InputProps={{ className: 'bg-gray-50' }}
                    />
                    <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
                  </div>
                </div>

                {/* Name */}
                <div className="flex items-start gap-4">
                  <div className="mt-3 text-orange-400">
                    <User size={20} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
                    <TextField
                      fullWidth
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                      variant="outlined"
                      placeholder="Votre nom complet"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="mt-3 text-orange-400">
                    <Phone size={20} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                    <TextField
                      fullWidth
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+216 XX XXX XXX"
                      variant="outlined"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="mt-3 text-orange-400">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      placeholder="Votre adresse..."
                      variant="outlined"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="text-center mt-8">
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={saving}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 px-12 py-3 text-lg font-bold shadow-2xl hover:shadow-3xl min-w-[200px]"
            >
              {saving ? (
                <>
                  <CircularProgress size={24} className="mr-2" sx={{ color: 'white' }} />
                  Sauvegarde...
                </>
              ) : (
                '💾 Enregistrer les modifications'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfilePage;

