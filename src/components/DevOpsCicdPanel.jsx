import React from 'react';
import { GitBranch, CheckCircle2, XCircle, MinusCircle, Clock } from 'lucide-react';
import { DEVOPS_PIPELINES } from '../config/devopsPlatformCatalog';

const RUN_STATUS = {
  success: { icon: CheckCircle2, label: 'Succès', className: 'devops-badge--ok' },
  failed: { icon: XCircle, label: 'Échec', className: 'devops-badge--partial' },
  skipped: { icon: MinusCircle, label: 'Ignoré', className: 'devops-badge--local' },
  running: { icon: Clock, label: 'En cours', className: 'devops-badge--local' },
};

const DevOpsCicdPanel = ({ runs = [] }) => {
  const runByPipeline = Object.fromEntries(runs.map((r) => [r.pipelineId, r]));

  return (
    <div className="devops-pipeline-list">
      {DEVOPS_PIPELINES.map((p) => {
        const run = runByPipeline[p.id];
        const meta = RUN_STATUS[run?.status] || RUN_STATUS.success;
        const Icon = meta.icon;
        return (
          <article key={p.id} className="devops-pipeline">
            <div className="devops-pipeline__head">
              <strong>{p.name}</strong>
              <span className={`devops-badge ${meta.className}`}>
                <Icon size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} aria-hidden />
                {run ? meta.label : 'Actif'}
              </span>
            </div>
            <p>{p.detail}</p>
            <code>{p.file}</code>
            {run && (
              <div className="devops-pipeline__run">
                <span><GitBranch size={12} aria-hidden /> {run.branch}</span>
                {run.commit && run.commit !== '—' && <span>commit {run.commit}</span>}
                <span>{run.duration}</span>
                <span>{new Date(run.at).toLocaleString('fr-FR')}</span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default DevOpsCicdPanel;
