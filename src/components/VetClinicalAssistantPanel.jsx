import React, { useState } from 'react';
import { Bot, Send, Copy, Check } from 'lucide-react';
import { generateClinicalReport, VET_CLINICAL_QUICK_PROMPTS } from '../services/vetIntelligenceHubService';

const VetClinicalAssistantPanel = ({ patients = [], quickPrompts = VET_CLINICAL_QUICK_PROMPTS, loading: packLoading }) => {
  const [petId, setPetId] = useState(patients[0]?.id || '');
  const [prompt, setPrompt] = useState('');
  const [report, setReport] = useState(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const pet = patients.find((p) => p.id === petId) || patients[0];

  const runPrompt = async (text) => {
    const msg = String(text || prompt).trim();
    if (!msg || busy) return;
    setBusy(true);
    setPrompt('');
    try {
      const draft = await generateClinicalReport({
        pet: { name: pet?.petName, type: pet?.type },
        diagnosis: msg.includes('dermat') ? 'Dermatite allergique' : pet?.chronicCondition || 'Consultation',
        exam: 'Examen clinique réalisé — état général satisfaisant.',
        treatment: 'Traitement adapté selon protocole clinique.',
        followUpDays: 14,
      });
      setReport({ ...draft, userPrompt: msg });
    } finally {
      setBusy(false);
    }
  };

  const copyReport = () => {
    if (!report?.fullText) return;
    navigator.clipboard?.writeText(report.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (packLoading) return <p className="vetih-muted">Chargement assistant…</p>;

  return (
    <div className="vetih-panel">
      <p className="vetih-summary">
        <Bot size={16} aria-hidden />
        Aide à la rédaction rapide des comptes rendus médicaux et réponses aux questions fréquentes des propriétaires.
      </p>

      <label className="vetih-select-inline">
        Patient
        <select value={petId} onChange={(e) => setPetId(e.target.value)}>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.petName}</option>
          ))}
        </select>
      </label>

      <div className="vetih-quick">
        {(quickPrompts || []).map((q) => (
          <button key={q} type="button" className="vetih-quick-btn" onClick={() => runPrompt(q)} disabled={busy}>
            {q}
          </button>
        ))}
      </div>

      <form className="vetih-chat-input" onSubmit={(e) => { e.preventDefault(); runPrompt(); }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex. Rédiger CR consultation, message rappel vaccin…"
          disabled={busy}
        />
        <button type="submit" disabled={busy || !prompt.trim()} aria-label="Envoyer">
          <Send size={18} />
        </button>
      </form>

      {report && (
        <div className="vetih-report">
          <div className="vetih-report-head">
            <h4>{report.title}</h4>
            <button type="button" className="vetih-btn-ghost" onClick={copyReport}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copié' : 'Copier'}
            </button>
          </div>
          {report.userPrompt && <p className="vetih-muted-inline">Demande : {report.userPrompt}</p>}
          <pre className="vetih-report-body">{report.fullText}</pre>
        </div>
      )}
    </div>
  );
};

export default VetClinicalAssistantPanel;
