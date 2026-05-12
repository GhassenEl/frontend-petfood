import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Trash2, Edit3 } from 'lucide-react';
import api from '../utils/api';

const ClientReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ productId: '', rating: 5, comment: '', emotion: 'neutral' });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [reviewsRes, productsRes] = await Promise.all([api.get('/reviews'), api.get('/products')]);
      setReviews(reviewsRes.data);
      setProducts(productsRes.data);
      if (productsRes.data.length && !formData.productId) {
        setFormData((current) => ({ ...current, productId: productsRes.data[0]._id }));
      }
    } catch (error) {
      console.error('Reviews load error', error);
    }
  };

  const analyzeComment = async () => {
    if (!formData.comment.trim()) {
      window.alert('Écrivez votre avis avant l\'analyse IA');
      return;
    }
    setAnalyzing(true);
    try {
      const response = await fetch('/fastapi/analyze-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: formData.comment }),
      });
      if (!response.ok) throw new Error('Analyse IA échouée');
      const suggestion = await response.json();
      setAiSuggestion(suggestion);
      setFormData(prev => ({ ...prev, emotion: suggestion.emotion, aiSuggested: true }));
      window.alert(`🤖 IA suggère: ${suggestion.emotion.toUpperCase()} (${(suggestion.confidence*100).toFixed(0)}%)`);
    } catch (error) {
      console.error('AI Analysis error:', error);
      window.alert('Analyse IA indisponible, sélectionnez manuellement');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      aiSuggested: !!aiSuggestion && formData.emotion === aiSuggestion.emotion,
    };
    setLoading(true);
    try {
      if (editingReview) {
        await api.put(`/reviews/${editingReview._id}`, submitData);
        setEditingReview(null);
      } else {
        await api.post('/reviews', submitData);
      }
      setFormData((current) => ({ ...current, comment: '', rating: 5 }));
      setAiSuggestion(null);
      setShowForm(false);
      fetchData();
      window.alert(editingReview ? 'Avis modifié avec succès' : 'Avis ajouté avec succès');
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      productId: review.productId?._id || '',
      rating: review.rating,
      comment: review.comment,
      emotion: review.emotion || 'neutral',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet avis ?')) {
      try {
        await api.delete(`/reviews/${id}`);
        fetchData();
      } catch (error) {
        window.alert('Erreur suppression');
      }
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={heroStyle}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', fontWeight: 800 }}>⭐ Mes Avis</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Donnez votre avis sur les produits achetés.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setShowForm(!showForm); setEditingReview(null); setFormData({ productId: products[0]?._id || '', rating: 5, comment: '' }); }}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #e67e22, #d35400)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(230,126,34,0.3)',
            }}
          >
            <Plus size={18} /> {showForm ? 'Fermer' : 'Ajouter un avis'}
          </motion.button>
        </div>
      </motion.div>

      {/* Form */}
      {showForm && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSubmit} 
          style={formStyle}
        >
          <h3 style={{ marginTop: 0 }}>{editingReview ? '✏️ Modifier l\'avis' : '➕ Nouvel avis'}</h3>
          <div style={gridStyle}>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              style={inputStyle}
              required
            >
              {products.map((product) => (
                <option key={product._id} value={product._id}>{product.name}</option>
              ))}
            </select>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              style={inputStyle}
            >
              <option value={5}>5/5 Excellent</option>
              <option value={4}>4/5 Très bon</option>
              <option value={3}>3/5 Bon</option>
              <option value={2}>2/5 Moyen</option>
              <option value={1}>1/5 Faible</option>
            </select>
            <select
              value={formData.emotion}
              onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
              style={inputStyle}
            >
              <option value="happy">😊 Très heureux</option>
              <option value="satisfied">🙂 Satisfait</option>
              <option value="neutral">😐 Neutre</option>
              <option value="disappointed">😞 Déçu</option>
              <option value="frustrated">😠 Frustré</option>
            </select>
          </div>
          <textarea
            placeholder="Votre avis détaillé..."
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            style={textareaStyle}
            rows={5}
            required
          />
          <motion.button
            type="button"
            onClick={analyzeComment}
            disabled={analyzing || !formData.comment.trim()}
            whileHover={{ scale: 1.02 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px',
              background: analyzing ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: analyzing || !formData.comment.trim() ? 'not-allowed' : 'pointer',
              marginBottom: '12px',
            }}
          >
            {analyzing ? '🤖 Analyse en cours...' : '🤖 Analyser sentiment avec IA'}
          </motion.button>
          {aiSuggestion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                border: '2px solid #10b981',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '20px' }}>✨</span>
              <div>
                <strong>IA suggère:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>{aiSuggestion.emotion.toUpperCase()}</span> 
              <span style={{ color: '#6b7280', fontSize: '14px' }}>({Math.round(aiSuggestion.confidence * 100)}% confiance)</span>
              </div>
            </motion.div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ ...submitButtonStyle, background: '#9ca3af' }}>
              Annuler
            </button>
            <button type="submit" disabled={loading} style={submitButtonStyle}>
              {loading ? 'Envoi...' : (editingReview ? '💾 Modifier' : '✅ Publier')}
            </button>
          </div>
        </motion.form>
      )}

      {/* Reviews List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', background: 'white', borderRadius: '18px' }}>
            <Star size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p>Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
          </div>
        ) : (
          reviews.map((review, i) => (
            <motion.article 
              key={review._id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={reviewCardStyle}
            >
              <div style={reviewHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {review.productId?.imageUrl ? (
                    <img src={review.productId.imageUrl} alt={review.productId.name} style={thumbStyle} />
                  ) : (
                    <div style={{ ...thumbStyle, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      🐾
                    </div>
                  )}
                <div>
                    <strong style={{ fontSize: '1rem', color: '#333' }}>{review.productId?.name || 'Produit'}</strong>
                    <div style={{ color: '#f59e0b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} size={16} fill={idx < review.rating ? '#f59e0b' : 'none'} style={{ color: idx < review.rating ? '#f59e0b' : '#d1d5db' }} />
                      ))}
                      <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '4px' }}>({review.rating}/5)</span>
                      {review.emotion && (
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          marginLeft: '6px',
                          background: review.emotion === 'happy' ? '#dcfce7' : review.emotion === 'satisfied' ? '#dbeafe' : review.emotion === 'neutral' ? '#f3f4f6' : review.emotion === 'disappointed' ? '#fef3c7' : '#fee2e2',
                          color: review.emotion === 'happy' ? '#166534' : review.emotion === 'satisfied' ? '#1e40af' : review.emotion === 'neutral' ? '#4b5563' : review.emotion === 'disappointed' ? '#92400e' : '#991b1b',
                          fontWeight: 600,
                        }}>
                          {review.emotion === 'happy' ? '😊' : review.emotion === 'satisfied' ? '🙂' : review.emotion === 'neutral' ? '😐' : review.emotion === 'disappointed' ? '😞' : '😠'} {review.emotion}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <small style={{ color: '#9ca3af' }}>{new Date(review.createdAt).toLocaleDateString('fr-FR')}</small>
                  <button onClick={() => handleEdit(review)} style={{ padding: '6px 12px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Edit3 size={12} /> Modifier
                  </button>
                  <button onClick={() => handleDelete(review._id)} style={{ padding: '6px 12px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Trash2 size={12} /> Suppr
                  </button>
                </div>
              </div>
              <p style={{ margin: '12px 0 0', color: '#4b5563', lineHeight: 1.6 }}>{review.comment}</p>
            </motion.article>
          ))
        )}
      </div>
    </div>
  );
};

const heroStyle = {
  background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
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

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '14px',
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
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const reviewCardStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
};

const reviewHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px',
  flexWrap: 'wrap',
};

const thumbStyle = {
  width: '64px',
  height: '64px',
  objectFit: 'cover',
  borderRadius: '12px',
};

export default ClientReviewsPage;
