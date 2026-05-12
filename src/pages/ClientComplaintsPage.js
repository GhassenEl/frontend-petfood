import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const ClientComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState({ subject: '', description: '', orderId: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (error) {
      console.error('Complaints error', error);
      setComplaints([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/complaints', formData);
      setFormData({ subject: '', description: '', orderId: '' });
      fetchComplaints();
      window.alert('Reclamation envoyee');
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur reclamation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={heroStyle}>
        <h1 style={{ fontSize: '34px', marginTop: 0 }}>Mes Reclamations</h1>
        <p style={{ color: '#6b7280', marginBottom: 0 }}>
          Un espace propre pour signaler un souci sur la commande, la livraison ou le produit.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={formStyle}>
        <h3 style={{ marginTop: 0 }}>Nouvelle reclamation</h3>
        <input
          type="text"
          placeholder="Sujet"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          style={inputStyle}
          required
        />
        <input
          type="text"
          placeholder="Numero de commande (optionnel)"
          value={formData.orderId}
          onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
          style={inputStyle}
        />
        <textarea
          placeholder="Description detaillee..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={textareaStyle}
          rows={6}
          required
        />
        <button type="submit" disabled={loading} style={submitButtonStyle}>
          {loading ? 'Envoi...' : 'Envoyer reclamation'}
        </button>
      </form>

      <div style={{ display: 'grid', gap: '16px' }}>
{complaints.map((complaint) => {
            const handleDelete = async () => {
              if (window.confirm('Supprimer cette reclamation ?')) {
                try {
                  await api.delete(`/complaints/${complaint._id}`);
                  fetchComplaints();
                } catch (error) {
                  window.alert('Erreur suppression');
                }
              }
            };
            return (
              <article key={complaint._id} style={complaintCardStyle}>
                <div style={complaintHeadStyle}>
                  <h3 style={{ margin: 0 }}>{complaint.subject}</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ ...statusStyle, background: complaint.status === 'resolved' ? '#dcfce7' : '#fef3c7', color: complaint.status === 'resolved' ? '#166534' : '#92400e' }}>
                      {complaint.status}
                    </span>
                    <button onClick={handleDelete} style={{ padding: '4px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                      Supprimer
                    </button>
                  </div>
                </div>
                <p style={{ color: '#4b5563', lineHeight: 1.6 }}>{complaint.message || complaint.description}</p>
                {complaint.response ? <p style={{ color: '#2563eb', fontWeight: '600' }}>Reponse admin: {complaint.response}</p> : null}
                <small style={{ color: '#6b7280' }}>{new Date(complaint.createdAt).toLocaleDateString('fr-FR')}</small>
              </article>
            );
          })}
      </div>
    </div>
  );
};

const heroStyle = {
  background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)',
  borderRadius: '18px',
  padding: '24px',
  marginBottom: '24px',
  boxShadow: '0 10px 28px rgba(0,0,0,0.06)',
};

const formStyle = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '18px',
  boxShadow: '0 10px 28px rgba(0,0,0,0.06)',
  marginBottom: '24px',
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '16px',
  border: '1px solid #d1d5db',
  borderRadius: '10px',
  fontSize: '16px',
  boxSizing: 'border-box',
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  fontFamily: 'inherit',
};

const submitButtonStyle = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#ef4444',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const complaintCardStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  borderLeft: '4px solid #f59e0b',
};

const complaintHeadStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '10px',
  flexWrap: 'wrap',
};

const statusStyle = {
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 'bold',
};

export default ClientComplaintsPage;
