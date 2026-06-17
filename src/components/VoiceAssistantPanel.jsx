import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import useVoiceAssistant from '../hooks/useVoiceAssistant';
import EthicalDisclaimer from './EthicalDisclaimer';

const VOICE_HINTS = [
  'Montre-moi les croquettes recommandées pour mon chien.',
  'Quelles sont mes commandes en cours ?',
  'Vérifie l\'origine de mes croquettes.',
  'Ouvre le centre IoT.',
];

const VoiceAssistantPanel = () => {
  const navigate = useNavigate();
  const {
    supported, listening, transcript, response, error, start, stop,
  } = useVoiceAssistant({
    onResult: (intent) => {
      if (intent?.action?.type === 'navigate' && intent.action.path) {
        const q = intent.action.query ? `?q=${encodeURIComponent(intent.action.query)}` : '';
        setTimeout(() => navigate(`${intent.action.path}${q}`), 1200);
      }
    },
  });

  return (
    <section className="shub-panel shub-panel--voice">
      <header className="shub-panel__head">
        <Volume2 size={20} color="#7c3aed" />
        <div>
          <h3>Assistant vocal IA</h3>
          <p>Parlez naturellement — l&apos;assistant répond et affiche les résultats.</p>
        </div>
      </header>

      <EthicalDisclaimer variant="ai" compact />

      {!supported && (
        <p className="shub-voice-warn">Utilisez Chrome ou Edge pour la reconnaissance vocale (Web Speech API).</p>
      )}

      <ul className="shub-voice-hints">
        {VOICE_HINTS.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      <div className="shub-voice-controls">
        <button
          type="button"
          className={`shub-voice-btn${listening ? ' is-listening' : ''}`}
          onClick={listening ? stop : start}
          disabled={!supported}
          aria-pressed={listening}
        >
          {listening ? <MicOff size={22} /> : <Mic size={22} />}
          {listening ? 'Arrêter' : 'Parler'}
        </button>
      </div>

      {error && <p className="shub-voice-error" role="alert">{error}</p>}
      {transcript && (
        <blockquote className="shub-voice-transcript">
          <strong>Vous :</strong> {transcript}
        </blockquote>
      )}
      {response && (
        <blockquote className="shub-voice-response">
          <strong>Assistant :</strong> {response}
        </blockquote>
      )}
    </section>
  );
};

export default VoiceAssistantPanel;
