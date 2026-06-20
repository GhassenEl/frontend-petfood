import React, { useRef, useState } from 'react';
import { uploadAdminImage, resolveUploadPreviewUrl } from '../services/uploadService';
import SafeImage from './SafeImage';
import { PLATFORM_IMAGES } from '../utils/platformImages';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

/**
 * Upload fichier + URL manuelle pour formulaires admin.
 */
const AdminImageUpload = ({
  label = 'Image',
  value = '',
  onChange,
  folder = 'products',
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const previewUrl = resolveUploadPreviewUrl(value);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const result = await uploadAdminImage(file, folder);
      onChange?.(result.url);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Échec de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <label style={styles.label}>{label}</label>

      {previewUrl ? (
        <div style={styles.previewRow}>
          <SafeImage
            src={previewUrl}
            fallback={PLATFORM_IMAGES.productDefault}
            alt="Aperçu"
            style={styles.preview}
          />
          <button
            type="button"
            style={styles.clearBtn}
            disabled={disabled || uploading}
            onClick={() => onChange?.('')}
          >
            Retirer
          </button>
        </div>
      ) : (
        <p style={styles.hint}>Aucune image — uploadez un fichier ou collez une URL.</p>
      )}

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.uploadBtn}
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Envoi…' : '📷 Choisir un fichier'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      <input
        type="url"
        placeholder="Ou URL externe (https://…)"
        value={value}
        disabled={disabled || uploading}
        onChange={(e) => {
          setError('');
          onChange?.(e.target.value);
        }}
        style={styles.urlInput}
      />

      {error && <p style={styles.error} role="alert">⚠ {error}</p>}
      <p style={styles.meta}>JPEG, PNG, WebP, GIF — max 5 Mo. Stockage dynamique sur le serveur.</p>
    </div>
  );
};

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 700, color: '#374151' },
  previewRow: { display: 'flex', alignItems: 'center', gap: 12 },
  preview: {
    width: 96,
    height: 96,
    objectFit: 'cover',
    borderRadius: 12,
    border: '2px solid #e5e7eb',
    background: '#f9fafb',
  },
  clearBtn: {
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid #fecaca',
    background: '#fff1f2',
    color: '#b91c1c',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  hint: { margin: 0, fontSize: 12, color: '#9ca3af' },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  uploadBtn: {
    padding: '10px 14px',
    borderRadius: 12,
    border: '2px dashed #c7d2fe',
    background: '#eef2ff',
    color: '#4338ca',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
  },
  urlInput: {
    width: '100%',
    borderRadius: 12,
    border: '2px solid #e5e7eb',
    padding: '12px 14px',
    fontSize: 14,
    boxSizing: 'border-box',
  },
  error: { margin: 0, fontSize: 12, color: '#dc2626', fontWeight: 600 },
  meta: { margin: 0, fontSize: 11, color: '#94a3b8' },
};

export default AdminImageUpload;
