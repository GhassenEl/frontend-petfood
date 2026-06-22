import React from 'react';
import { Rocket, CheckCircle2, XCircle } from 'lucide-react';

const DevOpsDeploymentsPanel = ({ deployments = [] }) => {
  if (!deployments.length) {
    return <p className="devops-section__hint">Aucun déploiement enregistré.</p>;
  }

  return (
    <div className="devops-deploy-timeline">
      {deployments.map((dep) => (
        <article key={dep.id} className={`devops-deploy${dep.status === 'failed' ? ' devops-deploy--failed' : ''}`}>
          <div className="devops-deploy__icon" aria-hidden>
            {dep.status === 'failed' ? <XCircle size={20} color="#dc2626" /> : <CheckCircle2 size={20} color="#059669" />}
          </div>
          <div className="devops-deploy__body">
            <div className="devops-deploy__head">
              <strong>
                <Rocket size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} aria-hidden />
                {dep.env} → {dep.target}
              </strong>
              <span className={`devops-badge ${dep.status === 'success' ? 'devops-badge--ok' : 'devops-badge--partial'}`}>
                {dep.status === 'success' ? 'Déployé' : 'Échec'}
              </span>
            </div>
            <p>
              Version <code>{dep.version}</code>
              {' · '}
              {new Date(dep.at).toLocaleString('fr-FR')}
            </p>
            <p className="devops-deploy__services">
              {(dep.services || []).join(' · ')}
            </p>
            {dep.note && <p className="devops-deploy__note">{dep.note}</p>}
          </div>
        </article>
      ))}
    </div>
  );
};

export default DevOpsDeploymentsPanel;
