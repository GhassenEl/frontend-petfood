import { useCallback, useEffect, useRef, useState } from 'react';

const getRecognition = () => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const VOICE_INTENTS = [
  {
    patterns: [/croquette/i, /nourriture/i, /aliment/i, /repas/i],
    species: /chien|dog|canin/i,
    response: 'Voici les croquettes recommandées pour votre chien.',
    action: { type: 'navigate', path: '/client-products', query: 'chien' },
  },
  {
    patterns: [/croquette/i, /nourriture/i, /aliment/i],
    species: /chat|felin|félin/i,
    response: 'Voici les croquettes recommandées pour votre chat.',
    action: { type: 'navigate', path: '/client-products', query: 'chat' },
  },
  {
    patterns: [/commande/i, /livraison/i],
    response: 'Ouverture de vos commandes.',
    action: { type: 'navigate', path: '/client-orders' },
  },
  {
    patterns: [/vaccin/i, /veterinaire|vétérinaire/i],
    response: 'Consultation du dossier médical et rappels vaccins.',
    action: { type: 'navigate', path: '/medical-dossier' },
  },
  {
    patterns: [/traceabilite|traçabilité|origine|blockchain/i],
    response: 'Vérification de l\'origine de vos produits.',
    action: { type: 'navigate', path: '/client-traceability' },
  },
  {
    patterns: [/iot|distributeur|capteur/i],
    response: 'Ouverture du centre IoT.',
    action: { type: 'navigate', path: '/client-iot' },
  },
];

export const parseVoiceIntent = (transcript = '') => {
  const text = String(transcript).trim();
  if (!text) return null;

  for (const intent of VOICE_INTENTS) {
    if (intent.patterns.some((p) => p.test(text))) {
      if (intent.species && !intent.species.test(text)) continue;
      return { transcript: text, ...intent };
    }
  }

  return {
    transcript: text,
    response: `J'ai entendu : « ${text} ». Essayez : « Montre-moi les croquettes pour mon chien ».`,
    action: null,
  };
};

export default function useVoiceAssistant({ lang = 'fr-FR', onResult } = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const recRef = useRef(null);

  useEffect(() => {
    setSupported(Boolean(getRecognition()));
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    window.speechSynthesis.speak(u);
  }, [lang]);

  const start = useCallback(() => {
    const Recognition = getRecognition();
    if (!Recognition) {
      setError('Reconnaissance vocale non supportée sur ce navigateur (Chrome recommandé).');
      return;
    }

    setError('');
    setTranscript('');
    setResponse('');

    const rec = new Recognition();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recRef.current = rec;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      setListening(false);
      setError(e.error === 'not-allowed' ? 'Microphone refusé — autorisez l\'accès.' : `Erreur : ${e.error}`);
    };
    rec.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript || '';
      setTranscript(text);
      const intent = parseVoiceIntent(text);
      if (intent) {
        setResponse(intent.response);
        speak(intent.response);
        onResult?.(intent);
      }
    };

    try {
      rec.start();
    } catch {
      setError('Impossible de démarrer le micro.');
    }
  }, [lang, onResult, speak]);

  useEffect(() => () => {
    recRef.current?.abort?.();
    recRef.current?.stop?.();
  }, []);

  return { supported, listening, transcript, response, error, start, stop, speak };
}
