import React, { useRef, useState } from 'react';

const DEFAULT_AVATAR = '🐾';

export default function SmartAgentAvatar({ previewUrl, onAvatarFile, label = 'Avatar' }) {
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const pickFile = () => {
    inputRef.current?.click();
  };

  const validate = (file) => {
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (!file) return false;
    if (!file.type?.startsWith('image/')) {
      setLocalError('Veuillez importer une image (PNG/JPG/WebP).');
      return false;
    }
    if (file.size > maxBytes) {
      setLocalError('Image trop volumineuse (max ~5MB).');
      return false;
    }
    setLocalError('');
    return true;
  };

  const handleFile = (file) => {
    if (!validate(file)) return;
    onAvatarFile?.(file);
  };

  return (
    <div>
      <div
        onClick={pickFile}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const f = e.dataTransfer?.files?.[0];
          if (f) handleFile(f);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') pickFile();
        }}
        aria-label={label}
        style={{
          border: `2px dashed ${isDragging ? '#e67e22' : 'rgba(0,0,0,0.15)'}`,
          borderRadius: 18,
          padding: 16,
          cursor: 'pointer',
          background: isDragging ? 'rgba(230,126,34,0.06)' : 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: 'linear-gradient(135deg, rgba(230,126,34,0.12), rgba(39,174,96,0.08))',
              border: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: 34 }}>{DEFAULT_AVATAR}</span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, color: '#111827' }}>{label}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
              Glisser-déposer ou cliquer (max ~5MB)
            </div>

            {previewUrl ? (
              <div style={{ fontSize: 12, color: '#059669', fontWeight: 800, marginTop: 8 }}>
                Image chargée ✅
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          handleFile(file);
          e.target.value = '';
        }}
      />

      {localError ? (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 14,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#b91c1c',
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          {localError}
        </div>
      ) : null}

      {previewUrl ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAvatarFile?.(null);
          }}
          style={{
            marginTop: 12,
            width: '100%',
            padding: '10px 12px',
            borderRadius: 14,
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'white',
            fontWeight: 900,
            color: '#111827',
            cursor: 'pointer',
          }}
        >
          Retirer l’avatar
        </button>
      ) : null}
    </div>
  );
}

