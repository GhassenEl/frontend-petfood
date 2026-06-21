import React, { useState } from 'react';
import { RefreshCw, Zap } from 'lucide-react';
import { IOT_QUICK_COMMANDS } from '../config/iotEcosystemCatalog';
import { sendIoTCommand } from '../services/iotService';

const IoTCommandCenter = ({ pack, onRefresh }) => {
  const [running, setRunning] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const deviceTypes = new Set((pack?.devices || []).map((d) => d.type));

  const runCommand = async (cmd) => {
    setRunning(cmd.id);
    setFeedback(null);
    try {
      const res = await sendIoTCommand(cmd.id, pack);
      setFeedback({ type: 'success', text: res.message });
      onRefresh?.();
    } catch {
      setFeedback({ type: 'error', text: 'Commande échouée — réessayez.' });
    } finally {
      setRunning(null);
    }
  };

  const visible = IOT_QUICK_COMMANDS.filter(
    (c) => c.roles.includes('all') || c.roles.some((r) => deviceTypes.has(r)),
  );

  return (
    <section className="iot-cmd-center">
      <header className="iot-cmd-center__head">
        <div>
          <span className="iot-cmd-center__badge">Contrôle à distance</span>
          <h3><Zap size={18} /> Centre de commandes IoT</h3>
          <p>Actions instantanées sur vos appareils connectés</p>
        </div>
        <button type="button" className="iot-cmd-center__refresh" onClick={onRefresh} aria-label="Actualiser">
          <RefreshCw size={16} />
        </button>
      </header>

      {feedback && (
        <div className={`iot-cmd-center__feedback iot-cmd-center__feedback--${feedback.type}`}>
          {feedback.text}
        </div>
      )}

      <div className="iot-cmd-center__grid">
        {visible.map((cmd) => (
          <button
            key={cmd.id}
            type="button"
            className="iot-cmd-center__btn"
            disabled={running === cmd.id}
            onClick={() => runCommand(cmd)}
          >
            <span className="iot-cmd-center__icon">{cmd.icon}</span>
            <strong>{cmd.label}</strong>
            <small>{running === cmd.id ? 'En cours…' : cmd.desc}</small>
          </button>
        ))}
      </div>
    </section>
  );
};

export default IoTCommandCenter;
