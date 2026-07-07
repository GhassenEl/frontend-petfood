import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Globe, Server, Sparkles } from 'lucide-react';

const TYPE_META = {
  page: { icon: Globe, label: 'Page', color: '#2563eb', bg: '#eff6ff' },
  api: { icon: Server, label: 'API', color: '#059669', bg: '#ecfdf5' },
  doc: { icon: BookOpen, label: 'Doc', color: '#7c3aed', bg: '#f5f3ff' },
  ai: { icon: Sparkles, label: 'IA', color: '#d97706', bg: '#fffbeb' },
};

const ChatSourcesPanel = ({ sources = [] }) => {
  if (!sources?.length) return null;

  return (
    <div
      style={{
        marginTop: 8,
        padding: '8px 10px',
        borderRadius: 10,
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        fontSize: 11,
      }}
    >
      <p style={{ margin: '0 0 6px', fontWeight: 800, color: '#475569', fontSize: 11 }}>
        Sources
      </p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sources.map((source) => {
          const meta = TYPE_META[source.type] || TYPE_META.page;
          const Icon = meta.icon;
          const isInternalRoute = source.type === 'page' && source.ref?.startsWith('/');
          return (
            <li key={`${source.type}-${source.ref || source.label}`}>
              {isInternalRoute ? (
                <Link
                  to={source.ref}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    textDecoration: 'none',
                    color: '#334155',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      padding: '1px 6px',
                      borderRadius: 6,
                      background: meta.bg,
                      color: meta.color,
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    <Icon size={10} />
                    {meta.label}
                  </span>
                  {source.label}
                </Link>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#334155', fontWeight: 600 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      padding: '1px 6px',
                      borderRadius: 6,
                      background: meta.bg,
                      color: meta.color,
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    <Icon size={10} />
                    {meta.label}
                  </span>
                  {source.label}
                  {source.ref && source.ref !== source.label ? (
                    <code style={{ fontSize: 10, color: '#64748b' }}>{source.ref}</code>
                  ) : null}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChatSourcesPanel;
