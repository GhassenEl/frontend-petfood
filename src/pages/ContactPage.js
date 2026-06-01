import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Phone, MapPin, Clock, Send, Building2,
  MessageCircle, CheckCircle2, ExternalLink, Share2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import PetfoodLogo from '../components/PetfoodLogo';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'contact@petfood.tn', href: 'mailto:contact@petfood.tn' },
  { icon: Phone, label: 'Téléphone', value: '+216 71 100 100', href: 'tel:+21671100100' },
  { icon: MapPin, label: 'Siège social', value: 'Les Berges du Lac 2, 1053 Tunis', href: 'https://maps.google.com/?q=Les+Berges+du+Lac+2+Tunis' },
  { icon: Clock, label: 'Horaires', value: 'Lun – Ven, 08:30 – 17:30', href: null },
];

const socialLinks = [
  { name: 'Facebook', emoji: 'f', url: 'https://facebook.com/petfoodtn', color: '#1877f2' },
  { name: 'Instagram', emoji: '📷', url: 'https://instagram.com/petfoodtn', color: '#e4405f' },
  { name: 'LinkedIn', emoji: 'in', url: 'https://linkedin.com/company/petfoodtn', color: '#0a66c2' },
];

const subjectOptions = [
  'Information produit',
  'Suivi de commande',
  'Partenariat / entreprise',
  'Support technique',
  'Autre demande',
];

const services = [
  { emoji: '🐶', title: 'Nutrition canine', text: 'Croquettes premium, plans NutriPro et distributeur IoT.' },
  { emoji: '🐱', title: 'Nutrition féline', text: 'Formules adaptées chats adultes, stérilisés ou sensibles.' },
  { emoji: '🩺', title: 'Réseau vétérinaire', text: 'Consultations, dossiers médicaux et ordonnances digitales.' },
];

const ContactPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', subject: subjectOptions[0], message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setForm((f) => ({
          ...f,
          name: data.name || user?.name || '',
          email: data.email || user?.email || '',
        }));
      } catch {
        if (user?.name || user?.email) {
          setForm((f) => ({ ...f, name: user.name || '', email: user.email || '' }));
        }
      }
    };
    loadProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/contact', {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        userId: user?.id || user?._id,
      });
      setSuccess('Votre message a été envoyé. Notre équipe vous répond sous 24 h ouvrées.');
      setForm((f) => ({ ...f, subject: subjectOptions[0], message: '' }));
    } catch (err) {
      setError(err?.response?.data?.error || 'Envoi impossible. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 40px' }}>
      {/* Hero entreprise avec logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 45%, #ea580c 100%)',
          borderRadius: 24,
          padding: '36px 32px',
          color: 'white',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <PetfoodLogo size="lg" showTagline variant="light" />
            <div style={{ marginTop: 20, maxWidth: 480 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                <Building2 size={14} /> Contact entreprise
              </div>
              <h1 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>
                Parlons nutrition, commandes & partenariats
              </h1>
              <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.65, fontSize: 15 }}>
                L&apos;équipe PetfoodTN vous accompagne pour le suivi de commande, les conseils produits
                et les demandes professionnelles en Tunisie.
              </p>
            </div>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: '20px 24px',
              minWidth: 220,
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Réponse moyenne</div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>&lt; 24 h</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageCircle size={14} /> Support client & B2B
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 24 }}>
        {/* Formulaire */}
        <motion.section
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={cardStyle}
        >
          <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Send size={20} color="#ea580c" /> Envoyer un message
          </h2>
          <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 14 }}>
            Décrivez votre demande — nous vous recontactons par email.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={labelStyle}>
              Nom complet
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
                required
                placeholder="Votre nom"
              />
            </label>
            <label style={labelStyle}>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                required
                placeholder="vous@email.tn"
              />
            </label>
            <label style={labelStyle}>
              Objet
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                style={inputStyle}
              >
                {subjectOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              Message
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                style={{ ...inputStyle, minHeight: 130, resize: 'vertical' }}
                required
                placeholder="Votre message…"
                rows={5}
              />
            </label>

            {success && (
              <div style={successBox}>
                <CheckCircle2 size={18} /> {success}
              </div>
            )}
            {error && <div style={errorBox}>{error}</div>}

            <button type="submit" disabled={loading} style={btnPrimary}>
              {loading ? 'Envoi en cours…' : 'Envoyer à PetfoodTN'}
            </button>
          </form>
        </motion.section>

        {/* Coordonnées */}
        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>Coordonnées</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {contactInfo.map(({ icon: Icon, label, value, href }) => (
                <div key={label} style={infoRow}>
                  <div style={iconWrap}><Icon size={18} color="#ea580c" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</div>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={linkStyle}>
                        {value} {href.startsWith('http') && <ExternalLink size={12} style={{ verticalAlign: 'middle' }} />}
                      </a>
                    ) : (
                      <strong style={{ color: '#1e293b', fontSize: 14 }}>{value}</strong>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Share2 size={18} color="#64748b" /> Réseaux sociaux
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {socialLinks.map(({ name, emoji, url, color }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    background: color,
                    color: 'white',
                    borderRadius: 12,
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{emoji}</span> {name}
                </a>
              ))}
            </div>
          </div>

          {/* Carte identité entreprise */}
          <div style={{ ...cardStyle, textAlign: 'center', padding: '28px 20px' }}>
            <PetfoodLogo size="md" showTagline />
            <p style={{ margin: '16px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
              Société tunisienne spécialisée dans la nutrition animale,
              la e-boutique et les services vétérinaires connectés.
            </p>
            <div style={{ marginTop: 14, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
              RC · MF · Tunisie 🇹🇳
            </div>
          </div>
        </motion.aside>
      </div>

      {/* Services */}
      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {services.map((s) => (
          <article key={s.title} style={{ ...cardStyle, padding: '20px 22px' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{s.emoji}</div>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800 }}>{s.title}</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.55 }}>{s.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

const cardStyle = {
  background: 'white',
  borderRadius: 20,
  padding: '24px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 13,
  fontWeight: 600,
  color: '#475569',
};

const inputStyle = {
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  fontSize: 14,
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
};

const btnPrimary = {
  padding: '14px 20px',
  background: 'linear-gradient(135deg, #ea580c, #c2410c)',
  color: 'white',
  border: 'none',
  borderRadius: 12,
  fontWeight: 800,
  fontSize: 15,
  cursor: 'pointer',
  marginTop: 4,
};

const successBox = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: 12,
  background: '#ecfdf5',
  color: '#047857',
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 600,
};

const errorBox = {
  padding: 12,
  background: '#fef2f2',
  color: '#b91c1c',
  borderRadius: 12,
  fontSize: 14,
};

const infoRow = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '12px 0',
  borderBottom: '1px solid #f1f5f9',
};

const iconWrap = {
  width: 40,
  height: 40,
  borderRadius: 12,
  background: '#fff7ed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const linkStyle = {
  color: '#1e293b',
  fontWeight: 700,
  fontSize: 14,
  textDecoration: 'none',
};

export default ContactPage;
