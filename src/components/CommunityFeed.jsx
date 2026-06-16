import React from 'react';
import { POST_TYPES } from '../utils/communityPostTypes';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 3600000) return `Il y a ${Math.max(1, Math.floor(diff / 60000))} min`;
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const CommunityFeed = ({ posts = [] }) => {
  if (!posts.length) {
    return <p className="comm-empty">Aucune publication pour le moment. Soyez le premier à partager !</p>;
  }

  return (
    <div className="comm-feed">
      {posts.map((post) => {
        const typeMeta = POST_TYPES[post.type] || POST_TYPES.experience;
        return (
          <article key={post.id} className="comm-card comm-post">
            <header className="comm-post__head">
              <span className="comm-post__avatar" aria-hidden>{post.authorAvatar || '🐾'}</span>
              <div>
                <strong>{post.authorName}</strong>
                <div className="comm-post__meta">
                  <span className="comm-badge">{typeMeta.icon} {typeMeta.label}</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </header>
            {post.productName && (
              <p className="comm-post__product">
                {post.type === 'review' && post.rating ? `${post.rating}★ — ` : ''}
                {post.productName}
              </p>
            )}
            <p className="comm-post__body">{post.content}</p>
            <footer className="comm-post__foot">
              <span>❤️ {post.likes ?? 0}</span>
              <span>💬 {post.comments ?? 0}</span>
            </footer>
          </article>
        );
      })}
    </div>
  );
};

export default CommunityFeed;
