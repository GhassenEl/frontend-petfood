import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [errors, setErrors] = useState({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const validateNewPassword = (password) => {
    if (!password) return 'Nouveau mot de passe requis';
    if (password.length < 8) return 'Min 8 caractères';
    if (!/[A-Z]/.test(password)) return '1 majuscule requise';
    if (!/[a-z]/.test(password)) return '1 minuscule requise';
    if (!/\d/.test(password)) return '1 chiffre requis';
    if (!/[@$!%*?&]/.test(password)) return '1 caractère spécial requis';
    return '';
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'newPassword') {
      const error = validateNewPassword(value);
      setPasswordStrength(getPasswordStrength(value));
      setErrors(prev => ({ ...prev, newPassword: error }));

      if (formData.confirmNewPassword) {
        const confirmError = value !== formData.confirmNewPassword ? 'Ne correspondent pas' : '';
        setErrors(prev => ({ ...prev, confirmNewPassword: confirmError }));
      }
    }

    if (field === 'confirmNewPassword') {
      const confirmError = value !== formData.newPassword ? 'Ne correspondent pas' : '';
      setErrors(prev => ({ ...prev, confirmNewPassword: confirmError }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPassError = validateNewPassword(formData.newPassword);
    const confirmError = formData.newPassword !== formData.confirmNewPassword ? 'Ne correspondent pas' : '';

    if (newPassError || confirmError) {
      setErrors({ newPassword: newPassError, confirmNewPassword: confirmError });
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', formData);

      setMessage('✅ Mot de passe modifié avec succès! Reconnectez-vous.');
      setTimeout(async () => {
        setMessage('');
        await logout();
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      setMessage('❌ Erreur: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="container py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-lock text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Changer Mot de Passe</h1>
          <p className="text-gray-600">Sécurité renforcée pour {user?.prenom || 'votre'} compte</p>
        </div>

        <div className="card glass-panel p-6">
          {message && (
            <div className={`p-4 mb-6 rounded-xl text-white font-medium text-center ${message.includes('succès') ? 'bg-green-500' : 'bg-red-500'
              }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label block mb-2 font-medium">Mot de passe actuel</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleChange('currentPassword', e.target.value)}
                  className="form-control w-full p-3 pr-12 border rounded-xl focus:border-primary transition-all"
                  placeholder="Mot de passe actuel"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  <i className={`fa-solid ${showCurrent ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div>
              <label className="form-label block mb-2 font-medium">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                  className={`form-control w-full p-3 pr-12 border-2 rounded-xl transition-all ${errors.newPassword ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'
                    }`}
                  placeholder="Nouveau mot de passe sécurisé"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowNew(!showNew)}
                >
                  <i className={`fa-solid ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}

              {/* Strength Meter */}
              <div className="flex gap-1 mt-2 h-2">
                <div className={`flex-1 rounded-full ${getStrengthColor()}`}></div>
                <div className={`flex-1 rounded-full bg-gray-200`}></div>
                <div className={`flex-1 rounded-full bg-gray-200`}></div>
              </div>
              <small className={`block mt-1 capitalize font-medium ${passwordStrength === 'strong' ? 'text-green-600' :
                  passwordStrength === 'medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                Force: {passwordStrength.toUpperCase()}
              </small>
            </div>

            <div>
              <label className="form-label block mb-2 font-medium">Confirmer nouveau mot de passe</label>
              <input
                type={showNew ? 'text' : 'password'}
                value={formData.confirmNewPassword}
                onChange={(e) => handleChange('confirmNewPassword', e.target.value)}
                className={`form-control w-full p-3 border-2 rounded-xl transition-all ${errors.confirmNewPassword ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'
                  }`}
                placeholder="Répétez le nouveau mot de passe"
                required
              />
              {errors.confirmNewPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn w-full py-3 text-lg font-semibold rounded-xl transition-all ${loading ? 'btn-disabled cursor-not-allowed' : 'btn-primary hover:shadow-xl hover:-translate-y-1'
                }`}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner mr-2"></span>
                  Modification...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-lock-open mr-2"></i>
                  Modifier le mot de passe
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
