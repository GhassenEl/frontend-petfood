import React, { useState } from 'react';
import { Terminal, Copy } from 'lucide-react';
import { DEVOPS_RUNBOOKS } from '../utils/devopsDemoData';

const DevOpsRunbookPanel = () => {
  const [copied, setCopied] = useState('');

  const copy = (cmd) => {
    navigator.clipboard?.writeText(cmd).then(() => {
      setCopied(cmd);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <div className="devops-runbooks">
      {DEVOPS_RUNBOOKS.map((item) => (
        <article key={item.id} className="devops-runbook">
          <div className="devops-runbook__label">
            <Terminal size={14} aria-hidden />
            {item.label}
          </div>
          <code>{item.cmd}</code>
          <button type="button" className="devops-runbook__copy" onClick={() => copy(item.cmd)} aria-label={`Copier ${item.label}`}>
            <Copy size={14} />
            {copied === item.cmd ? 'Copié' : 'Copier'}
          </button>
        </article>
      ))}
    </div>
  );
};

export default DevOpsRunbookPanel;
