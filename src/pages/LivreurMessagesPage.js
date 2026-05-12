import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const LivreurMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages');
      setMessages(res.data || []);
    } catch (error) {
      console.error('Messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await api.post('/messages', {
        receiverId: 'admin',
        message: newMessage.trim()
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      window.alert('Erreur envoi message');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>💬</div>
        <p style={{ color: '#888' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}
      >
        💬 Messages
      </motion.h1>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {messages.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>Aucun message</p>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={msg._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '12px 16px',
                borderRadius: '14px',
                background: msg.sender?.type === 'livreur' ? 'rgba(39,174,96,0.08)' : 'rgba(0,0,0,0.02)',
                alignSelf: msg.sender?.type === 'livreur' ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{msg.message}</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#aaa' }}>
                {msg.createdAt ? new Date(msg.createdAt).toLocaleString('fr-FR') : ''}
              </p>
            </motion.div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrire un message..."
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            fontSize: '0.95rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 24px',
            background: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default LivreurMessagesPage;

