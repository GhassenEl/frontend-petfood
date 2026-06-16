import React, { useState } from 'react';
import { POST_TYPES } from '../utils/communityPostTypes';
import { addCommunityPost } from '../services/communityService';

const CommunityPostForm = ({ onPosted }) => {
  const [type, setType] = useState('tip');
  const [content, setContent] = useState('');
  const [productName, setProductName] = useState('');
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);

  const meta = POST_TYPES[type] || POST_TYPES.tip;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    try {
      const post = addCommunityPost({
        type,
        content,
        productName: type === 'review' ? productName : null,
        rating: type === 'review' ? rating : null,
      });
      setContent('');
      setProductName('');
      onPosted?.(post);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="comm-post-form" onSubmit={handleSubmit}>
      <h3 className="comm-post-form__title">Partager avec la communauté</h3>
      <div className="comm-type-row">
        {Object.values(POST_TYPES).map((t) => (
          <button
            key={t.id}
            type="button"
            className={`comm-type-btn${type === t.id ? ' comm-type-btn--active' : ''}`}
            onClick={() => setType(t.id)}
          >
            <span aria-hidden>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>
      {type === 'review' && (
        <div className="comm-form-row">
          <input
            type="text"
            className="comm-input"
            placeholder="Nom du produit"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <select className="comm-select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} ★</option>
            ))}
          </select>
        </div>
      )}
      <textarea
        className="comm-textarea"
        rows={3}
        placeholder={meta.placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button type="submit" className="comm-btn comm-btn--primary" disabled={busy || !content.trim()}>
        {busy ? 'Publication…' : 'Publier'}
      </button>
    </form>
  );
};

export default CommunityPostForm;
