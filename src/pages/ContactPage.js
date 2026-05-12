import React from 'react';

const animalCards = [
  {
    title: 'Conseil Chien',
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=80',
    text: 'Nutrition quotidienne, produits premium et suivi de commande rapide.',
  },
  {
    title: 'Conseil Chat',
    image: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80',
    text: 'Selection adaptee aux chats adultes, sterilises ou sensibles.',
  },
];

const contactInfo = [
  { label: 'Email', value: 'contact@petfood.tn' },
  { label: 'Telephone', value: '+216 71 100 100' },
  { label: 'Adresse', value: 'Lac 2, Tunis' },
  { label: 'Horaires', value: 'Lun - Ven, 08:30 - 17:30' },
];

const socialLinks = [
  { name: 'Facebook', icon: 'fa-brands fa-facebook', url: 'https://facebook.com/petfoodtn', color: '#1877f2' },
  { name: 'Instagram', icon: 'fa-brands fa-instagram', url: 'https://instagram.com/petfoodtn', color: '#e4405f' },
  { name: 'LinkedIn', icon: 'fa-brands fa-linkedin', url: 'https://linkedin.com/company/petfoodtn', color: '#0a66c2' },
  { name: 'TikTok', icon: 'fa-brands fa-tiktok', url: 'https://tiktok.com/@petfoodtn', color: '#000000' },
];

const ContactPage = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={heroStyle}>
        <div>
          <h1 style={{ marginTop: 0, fontSize: '38px' }}>Contact entreprise</h1>
          <p style={{ color: '#6b7280', fontSize: '17px', lineHeight: 1.7 }}>
            Une section professionnelle pour joindre l entreprise, demander un suivi de commande
            ou obtenir un conseil produit.
          </p>
        </div>
        <div style={contactGridStyle}>
          {contactInfo.map((item) => (
            <div key={item.label} style={contactCardStyle}>
              <small style={{ color: '#6b7280', display: 'block', marginBottom: '6px' }}>{item.label}</small>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        {/* Social Media Links */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Suivez-nous sur les réseaux sociaux</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: social.color,
                  color: 'white',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <i className={social.icon}></i>
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div style={animalsGridStyle}>
        {animalCards.map((card) => (
          <article key={card.title} style={animalCardStyle}>
            <img src={card.image} alt={card.title} style={animalImageStyle} />
            <div style={{ padding: '18px' }}>
              <h3 style={{ marginTop: 0 }}>{card.title}</h3>
              <p style={{ marginBottom: 0, color: '#6b7280', lineHeight: 1.6 }}>{card.text}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const heroStyle = {
  background: 'white',
  borderRadius: '20px',
  padding: '28px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  marginBottom: '24px',
};

const contactGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
  marginTop: '24px',
};

const contactCardStyle = {
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '16px',
};

const animalsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
};

const animalCardStyle = {
  background: 'white',
  borderRadius: '18px',
  overflow: 'hidden',
  boxShadow: '0 10px 28px rgba(0,0,0,0.08)',
};

const animalImageStyle = {
  width: '100%',
  height: '240px',
  objectFit: 'cover',
};

export default ContactPage;
