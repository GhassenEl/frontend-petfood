import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, AlertTriangle, Stethoscope, Calendar } from 'lucide-react';

const cardStyle = {
  background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)',
  border: '2px solid #fca5a5',
  borderRadius: 16,
  padding: '20px 22px',
  marginBottom: 24,
};

const btnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 16px',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 14,
  textDecoration: 'none',
};

const VetEmergencyPanel = ({ emergencyPhone, clinicName }) => {
  const phone = emergencyPhone?.trim();
  const telHref = phone ? `tel:${phone.replace(/\s/g, '')}` : null;

  return (
    <section style={cardStyle} aria-label="Urgences vétérinaires">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 260px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={22} aria-hidden />
            Urgences vétérinaires
          </h2>
          <p style={{ margin: '0 0 12px', color: '#7f1d1d', fontSize: 14, lineHeight: 1.5 }}>
            {clinicName ? `${clinicName} — ` : ''}
            En cas de détresse vitale (convulsions, hémorragie, empoisonnement, inconscience),
            contactez immédiatement la ligne urgence ou lancez une analyse prioritaire.
          </p>
          {phone ? (
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#dc2626' }}>
              <Phone size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} aria-hidden />
              {phone}
            </p>
          ) : (
            <p style={{ margin: 0, color: '#92400e', fontSize: 13 }}>
              Renseignez le numéro d&apos;urgence ci-dessous pour l&apos;afficher aux clients et à l&apos;équipe.
            </p>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {telHref && (
            <a href={telHref} style={{ ...btnStyle, background: '#dc2626', color: '#fff' }}>
              <Phone size={16} aria-hidden />
              Appeler urgence
            </a>
          )}
          <Link
            to="/vet/diagnostics?scenario=dog-urgent"
            style={{ ...btnStyle, background: '#fff', color: '#b91c1c', border: '2px solid #fca5a5' }}
          >
            <Stethoscope size={16} aria-hidden />
            Analyse urgence IA
          </Link>
          <Link
            to="/vet/calendar"
            style={{ ...btnStyle, background: '#0ea5e9', color: '#fff' }}
          >
            <Calendar size={16} aria-hidden />
            RDV prioritaire
          </Link>
        </div>
      </div>
    </section>
  );
};

export default VetEmergencyPanel;
