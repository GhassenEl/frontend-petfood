import React from 'react';
import { CheckCircle2, Circle, ArrowRight, Server } from 'lucide-react';
import {
  PIPELINE_STAGES,
  PIPELINE_TARGET,
  PIPELINE_SECONDARY,
  getPipelineProgress,
} from '../config/devopsPipelineCatalog';

const STAGE_STATUS = {
  success: CheckCircle2,
  running: Circle,
  failed: Circle,
  skipped: Circle,
};

const DevOpsPipelineFlow = ({ runs = [] }) => {
  const { completed, total, runs: runById } = getPipelineProgress(runs);

  return (
    <section className="devops-pipeline-flow">
      <div className="devops-pipeline-flow__header">
        <div>
          <h3>Pipeline plateforme</h3>
          <p className="devops-section__hint">
            Orchestrateur <code>.github/workflows/platform-pipeline.yml</code>
            {' — '}
            {completed}/{total} étapes OK (demo)
          </p>
        </div>
        <div className="devops-pipeline-flow__target">
          <Server size={16} aria-hidden />
          <span>{PIPELINE_TARGET.label}</span>
          <span className="devops-badge devops-badge--ok">Primary</span>
        </div>
      </div>

      <div className="devops-pipeline-flow__track" role="list">
        {PIPELINE_STAGES.map((stage, idx) => {
          const run = runById[stage.id];
          const status = run?.status || 'idle';
          const Icon = STAGE_STATUS[status] || Circle;
          const done = status === 'success';
          return (
            <React.Fragment key={stage.id}>
              <article
                role="listitem"
                className={`devops-pipeline-flow__stage${done ? ' devops-pipeline-flow__stage--done' : ''}`}
                style={{ '--stage-color': stage.color }}
              >
                <div className="devops-pipeline-flow__badge" aria-hidden>
                  <Icon size={14} />
                  <span>{stage.order}</span>
                </div>
                <strong>{stage.short}</strong>
                <span className="devops-pipeline-flow__label">{stage.label}</span>
                <code>{stage.workflow}</code>
              </article>
              {idx < PIPELINE_STAGES.length - 1 && (
                <ArrowRight size={16} className="devops-pipeline-flow__arrow" aria-hidden />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="devops-pipeline-flow__legend">
        {PIPELINE_STAGES.map((s) => (
          <details key={s.id} className="devops-pipeline-flow__detail">
            <summary>{s.label}</summary>
            <ul>
              {s.jobs.map((j) => (
                <li key={j}>{j}</li>
              ))}
            </ul>
            <span className="devops-pipeline-flow__trigger">Déclencheur : {s.trigger}</span>
          </details>
        ))}
      </div>

      {PIPELINE_SECONDARY.length > 0 && (
        <div className="devops-pipeline-flow__secondary">
          <h4>Pipelines secondaires</h4>
          <ul>
            {PIPELINE_SECONDARY.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong> — <code>{p.file}</code> — {p.detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default DevOpsPipelineFlow;
