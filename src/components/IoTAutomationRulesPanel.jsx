import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { toggleIoTAutomation } from '../services/iotService';

const IoTAutomationRulesPanel = ({ automations = [], onToggle }) => {
  const [busy, setBusy] = useState(null);
  const [local, setLocal] = useState(() =>
    Object.fromEntries((automations || []).map((a) => [a.id, a.enabled !== false])),
  );

  const handleToggle = async (auto) => {
    const next = !local[auto.id];
    setBusy(auto.id);
    setLocal((prev) => ({ ...prev, [auto.id]: next }));
    try {
      await toggleIoTAutomation(auto.id, next);
      onToggle?.(auto.id, next);
    } catch {
      setLocal((prev) => ({ ...prev, [auto.id]: !next }));
    } finally {
      setBusy(null);
    }
  };

  if (!automations.length) {
    return <p className="iot-muted">Aucune règle d&apos;automatisation configurée.</p>;
  }

  return (
    <div className="iot-auto-grid">
      {automations.map((auto) => {
        const enabled = local[auto.id] !== false;
        return (
          <div key={auto.id} className={`iot-auto-card${enabled ? ' iot-auto-card--on' : ''}`}>
            <div className="iot-auto-head">
              <Zap size={18} aria-hidden />
              <h4>{auto.label}</h4>
              <button
                type="button"
                className={`iot-auto-toggle${enabled ? ' is-on' : ''}`}
                disabled={busy === auto.id}
                onClick={() => handleToggle(auto)}
                aria-pressed={enabled}
              >
                {enabled ? 'Actif' : 'Inactif'}
              </button>
            </div>
            <p>{auto.description}</p>
            <Link to={auto.link}>Configurer →</Link>
          </div>
        );
      })}
    </div>
  );
};

export default IoTAutomationRulesPanel;
