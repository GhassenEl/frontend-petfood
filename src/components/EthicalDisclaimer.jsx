import React from 'react';
import { Info, ShieldAlert, Cpu, Link2, Eye } from 'lucide-react';
import './EthicalDisclaimer.css';

const COPY = {
  ai: {
    icon: Cpu,
    title: 'Aide à la décision — pas un diagnostic',
    text: 'Les scores et recommandations IA sont indicatifs (règles métier ou modèles en démo). Validez avec un vétérinaire avant tout changement alimentaire ou de soin.',
  },
  blockchain: {
    icon: Link2,
    title: 'Preuve locale de traçabilité',
    text: 'La vérification SHA-256/Merkle s’exécute dans votre navigateur (mode démo ou chaîne interne). Ce n’est pas une blockchain publique distribuée — consultez les certificats officiels du lot.',
  },
  iot: {
    icon: ShieldAlert,
    title: 'Capteurs IoT — vérification humaine recommandée',
    text: 'Les alertes qualité, température et stock peuvent comporter des faux positifs. Ne jetez pas l’aliment ni ne modifiez la ration sans contrôle visuel.',
  },
  analytics: {
    icon: Eye,
    title: 'Mesure d’audience',
    text: 'Avec votre accord (cookies analytique), nous enregistrons la page visitée (chemins sensibles masqués) pour améliorer le service. Les administrateurs voient des statistiques agrégées.',
  },
};

const EthicalDisclaimer = ({ variant = 'ai', compact = false }) => {
  const meta = COPY[variant] || COPY.ai;
  const Icon = meta.icon || Info;

  return (
    <aside
      className={`ethical-disclaimer ethical-disclaimer--${variant}${compact ? ' ethical-disclaimer--compact' : ''}`}
      role="note"
    >
      <Icon size={compact ? 16 : 18} aria-hidden className="ethical-disclaimer__icon" />
      <div>
        <strong>{meta.title}</strong>
        <p>{meta.text}</p>
      </div>
    </aside>
  );
};

export default EthicalDisclaimer;
