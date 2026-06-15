import React, { useRef } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';

/**
 * Barre import / export réutilisable (admin).
 * onImport reçoit le fichier ; onExportJson / onExportCsv déclenchent le téléchargement.
 */
const AdminImportExportBar = ({
  label = 'Données',
  onExportJson,
  onExportCsv,
  onImport,
  disabled = false,
  accept = '.csv,.json',
}) => {
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onImport) return;
    await onImport(file);
    e.target.value = '';
  };

  return (
    <div className="adm-export-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginRight: 4 }}>{label}</span>
      {onExportCsv && (
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={disabled} onClick={onExportCsv}>
          <FileSpreadsheet size={14} /> Export CSV
        </button>
      )}
      {onExportJson && (
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={disabled} onClick={onExportJson}>
          <FileJson size={14} /> Export JSON
        </button>
      )}
      {onImport && (
        <>
          <button
            type="button"
            className="adm-btn adm-btn--primary adm-btn--sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={14} /> Import
          </button>
          <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={handleFile} />
        </>
      )}
      <span style={{ fontSize: 11, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Download size={12} /> CSV ou JSON
      </span>
    </div>
  );
};

export default AdminImportExportBar;
