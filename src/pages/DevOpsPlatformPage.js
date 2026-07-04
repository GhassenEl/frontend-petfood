import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch, Activity, Server, Shield, HardDrive, Container, Workflow, Zap, Rocket, Key,
} from 'lucide-react';
import {
  DEVOPS_MONITORING,
  DEVOPS_STACKS,
  DEVOPS_ADMIN_INTERFACES,
  DEVOPS_PLATFORM_LINKS,
  DEVOPS_METRICS_DEMO,
} from '../config/devopsPlatformCatalog';
import { fetchDevOpsStatus, fetchStackHealth } from '../services/devopsStatusService';
import DevOpsLiveStatusPanel, { DevOpsAlertsPanel } from '../components/DevOpsLiveStatusPanel';
import DevOpsCicdPanel from '../components/DevOpsCicdPanel';
import DevOpsPipelineFlow from '../components/DevOpsPipelineFlow';
import DevOpsDeploymentsPanel from '../components/DevOpsDeploymentsPanel';
import DevOpsEnvSecretsPanel from '../components/DevOpsEnvSecretsPanel';
import DevOpsRunbookPanel from '../components/DevOpsRunbookPanel';
import DevOpsMetricsCharts from '../components/DevOpsMetricsCharts';
import AdminPrometheusGrafanaPanel from '../components/AdminPrometheusGrafanaPanel';
import DevOpsBiAutomationPanel from '../components/DevOpsBiAutomationPanel';
import DemoModePill from '../components/DemoModePill';
import MobileBottomNav, { AUTH_PUBLIC_MOBILE_NAV } from '../components/MobileBottomNav';
import './DevOpsPlatformPage.css';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
  { id: 'cicd', label: 'CI / CD', icon: GitBranch },
  { id: 'deploy', label: 'Déploiements', icon: Rocket },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'infra', label: 'Infrastructure', icon: Server },
  { id: 'security', label: 'DevSecOps', icon: Shield },
];

const REFRESH_MS = 30000;

const statusClass = (status) => {
  if (status === 'ok' || status === 'healthy') return 'devops-badge--ok';
  if (status === 'local') return 'devops-badge--local';
  return 'devops-badge--partial';
};

const healthLabel = (health) => {
  if (health === 'healthy') return 'Opérationnel';
  if (health === 'degraded') return 'Dégradé';
  if (health === 'critical') return 'Critique';
  return health || '—';
};

const DevOpsPlatformPage = ({ adminMode = false }) => {
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = adminMode ? await fetchDevOpsStatus() : await fetchStackHealth();
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [adminMode]);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const hero = useMemo(() => {
    if (status?.hero) return status.hero;
    const demo = DEVOPS_METRICS_DEMO;
    const up = status?.summary?.up ?? demo.pipelinesOk;
    const total = status?.summary?.total ?? demo.pipelinesTotal;
    return {
      score: status?.performance?.score ?? demo.score,
      health: status?.summary?.stackStatus === 'healthy' ? 'healthy' : status?.summary?.stackStatus === 'critical' ? 'critical' : 'degraded',
      uptime: status?.performance?.uptime?.formatted ?? demo.uptime,
      pipelinesOk: up,
      pipelinesTotal: total,
      containersRunning: demo.containersRunning,
      lastDeploy: status?.hero?.lastDeploy,
    };
  }, [status]);

  const services = status?.services || [];
  const alerts = status?.alerts || [];
  const pipelines = status?.pipelines || [];
  const deployments = status?.deployments || [];
  const envSecrets = status?.envSecrets || [];
  const isDemo = status?.mode === 'demo';

  return (
    <div className={`devops-page${adminMode ? ' devops-page--admin' : ''}`}>
      {!adminMode && (
        <Link to="/enterprise" className="devops-back">← Fonctionnalités entreprise</Link>
      )}

      <header className="devops-hero">
        <div className="devops-hero__top">
          <p className="devops-hero__eyebrow">PetfoodTN DevOps Platform</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`devops-hero__health devops-hero__health--${hero.health}`}>
              {healthLabel(hero.health)}
            </span>
            {isDemo && <DemoModePill />}
          </div>
        </div>
        <h1>
          <Workflow size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          DevOps &amp; observabilité
        </h1>
        <p>
          CI/CD GitHub Actions, pipeline AWS ECS, DevSecOps, monitoring Prometheus/Grafana,
          Docker, secrets et runbooks — tableau de bord live.
        </p>
        <div className="devops-stats">
          <div><strong>{hero.score ?? '—'}</strong><span>Score santé</span></div>
          <div><strong>{hero.pipelinesOk}/{hero.pipelinesTotal}</strong><span>Services UP</span></div>
          <div><strong>{hero.uptime}</strong><span>Uptime API</span></div>
          <div><strong>{hero.containersRunning}</strong><span>Conteneurs actifs</span></div>
        </div>
        {hero.lastDeploy && (
          <p className="devops-hero__deploy">
            Dernier déploiement prod : {new Date(hero.lastDeploy).toLocaleString('fr-FR')}
          </p>
        )}
        {adminMode && (
          <div className="devops-hero__actions">
            <Link to="/admin/performance" className="devops-hero__link">
              <Zap size={15} /> Performance détaillée →
            </Link>
            <Link to="/admin/backups" className="devops-hero__link">
              <HardDrive size={15} /> Sauvegardes →
            </Link>
            <Link to="/admin/security-framework" className="devops-hero__link">
              <Shield size={15} /> Cadre sécurité →
            </Link>
          </div>
        )}
      </header>

      <div className="devops-tabs" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`devops-tab${tab === id ? ' devops-tab--active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {(tab === 'overview' || tab === 'monitoring') && (
        <>
          <DevOpsLiveStatusPanel
            services={services}
            summary={status?.summary}
            collectedAt={status?.collectedAt}
            loading={loading}
            onRefresh={load}
            hero={status?.hero}
            showHeroMetrics={adminMode}
          />
          {alerts.length > 0 && <DevOpsAlertsPanel alerts={alerts} />}
          {status?.performance && <DevOpsMetricsCharts performance={status.performance} />}
          {adminMode && (
            <AdminPrometheusGrafanaPanel refreshMs={5000} />
          )}
        </>
      )}

      {tab === 'overview' && (
        <>
          <section className="devops-section">
            <h2>Runbooks rapides</h2>
            <p className="devops-section__hint">Commandes npm — copier-coller pour opérations courantes.</p>
            <DevOpsRunbookPanel />
          </section>

          {adminMode && (
            <section className="devops-section">
              <h2>Interfaces admin intégrées</h2>
              <p className="devops-section__hint">
                Connexion <strong>admin@petfood.tn</strong> requise pour les panneaux sécurisés.
              </p>
              <div className="devops-grid">
                {DEVOPS_ADMIN_INTERFACES.map((item) => (
                  <Link key={item.id} to={item.route} className="devops-card devops-card--link">
                    <span className="devops-card__icon">{item.icon}</span>
                    <h3>{item.label}</h3>
                    <p>{item.desc}</p>
                    <span className="devops-card__cta">Ouvrir →</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="devops-section">
            <h2>Plateformes liées</h2>
            <div className="devops-grid devops-grid--3">
              {DEVOPS_PLATFORM_LINKS.map((item) => (
                <Link key={item.id} to={item.route} className="devops-card devops-card--link">
                  <span className="devops-card__icon">{item.icon}</span>
                  <h3>{item.label}</h3>
                  <p>{item.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === 'cicd' && (
        <>
          <DevOpsPipelineFlow runs={pipelines} />
          <section className="devops-section">
            <h2>Pipelines CI/CD</h2>
            <p className="devops-section__hint">
              Orchestrateur <code>platform-pipeline.yml</code> — push <code>main</code>, PR et déclenchement manuel.
            </p>
            <DevOpsCicdPanel runs={pipelines} />
          </section>
          <section className="devops-section">
            <h2>Commandes locales</h2>
            <div className="devops-grid devops-grid--2">
              <div className="devops-card devops-card--code">
                <h3>CI &amp; pipeline</h3>
                <pre>{`npm run devops:ci
npm run devops:pipeline
npm run devops:health`}</pre>
              </div>
              <div className="devops-card devops-card--code">
                <h3>Déploiement AWS</h3>
                <pre>{`npm run devops:aws:auto
npm run devops:aws:status
npm run docker:stack:full`}</pre>
                <p style={{ margin: '12px 0 0', fontSize: 13, color: '#64748b' }}>
                  Docs : <code>docs/DEVOPS-PIPELINE.md</code>
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {tab === 'deploy' && (
        <section className="devops-section">
          <h2>Historique des déploiements</h2>
          <p className="devops-section__hint">
            AWS ECS, ECR et VPS — versions et statuts des releases.
          </p>
          <DevOpsDeploymentsPanel deployments={deployments} />
          <div className="devops-card" style={{ marginTop: 16 }}>
            <h3>Pipeline production</h3>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              <code>platform-pipeline.yml</code> — CI → DevSecOps → Readiness → ECR → ECS.
              Manuel : Actions → <strong>Platform Pipeline</strong> → Run workflow.
            </p>
          </div>
        </section>
      )}

      {tab === 'monitoring' && (
        <>
          <section className="devops-section">
            <h2>Outils d&apos;observabilité</h2>
            <div className="devops-grid">
              {DEVOPS_MONITORING.map((item) => {
                const live = services.find((s) => s.id === item.id);
                const isUp = live?.ok;
                return (
                  <article key={item.id} className="devops-card">
                    <h3>{item.label}</h3>
                    <p>{item.desc}</p>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="devops-ext-link">
                        {item.url}
                      </a>
                    ) : (
                      <Link to={item.route} className="devops-card__cta">Ouvrir dans l&apos;app →</Link>
                    )}
                    <span className={`devops-badge ${statusClass(live ? (isUp ? 'ok' : 'partial') : item.status === 'app' ? 'ok' : 'local')}`}>
                      {live ? (isUp ? 'UP · live' : 'DOWN') : (item.status === 'app' ? 'Intégré' : 'Local Docker')}
                    </span>
                  </article>
                );
              })}
            </div>
          </section>
          {adminMode && (
            <section className="devops-section">
              <DevOpsBiAutomationPanel />
            </section>
          )}
          {adminMode && (
            <section className="devops-section">
              <AdminPrometheusGrafanaPanel refreshMs={5000} />
            </section>
          )}
        </>
      )}

      {tab === 'infra' && (
        <>
          <section className="devops-section">
            <h2>Stacks Docker</h2>
            <div className="devops-grid">
              {DEVOPS_STACKS.map((s) => (
                <article key={s.id} className="devops-card">
                  <Container size={20} color="#1e40af" />
                  <h3>{s.label}</h3>
                  <p>{s.desc}</p>
                  <code>{s.cmd}</code>
                </article>
              ))}
            </div>
          </section>
          <section className="devops-section">
            <h2>
              <Key size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} aria-hidden />
              Variables &amp; secrets
            </h2>
            <p className="devops-section__hint">
              Secrets jamais en git — AWS Secrets Manager, GitHub Actions secrets, Docker env.
            </p>
            <DevOpsEnvSecretsPanel items={envSecrets} />
          </section>
          <section className="devops-section">
            <h2>Fichiers infrastructure</h2>
            <ul className="devops-file-list">
              <li><code>.github/workflows/platform-pipeline.yml</code> — Orchestrateur CI/CD</li>
              <li><code>infra/terraform/aws/</code> — ECS Fargate + RDS + ALB</li>
              <li><code>docker-compose.monitoring.yml</code> — Prometheus + Grafana</li>
              <li><code>docker-compose.iot.yml</code> — MQTT Mosquitto</li>
              <li><code>jenkins/Jenkinsfile</code> — Pipeline Jenkins (labo)</li>
            </ul>
            <Link to="/cloud" className="devops-card__cta" style={{ display: 'inline-block', marginTop: 12 }}>
              Voir Cloud Computing →
            </Link>
            {' · '}
            <Link to="/big-data" className="devops-card__cta" style={{ display: 'inline-block' }}>
              Big Data →
            </Link>
          </section>
        </>
      )}

      {tab === 'security' && (
        <section className="devops-section">
          <h2>DevSecOps</h2>
          {status?.performance?.security && (
            <div className="devops-inline-metrics devops-inline-metrics--security">
              <div><strong>{status.performance.security.eventsLast24h}</strong><span>Événements IDS 24h</span></div>
              <div><strong>{status.performance.security.monitoredIps}</strong><span>IP surveillées</span></div>
              <div><strong>{status.performance.security.idsEnabled ? 'ON' : 'OFF'}</strong><span>IDS actif</span></div>
            </div>
          )}
          <div className="devops-grid devops-grid--2">
            <Link to="/admin/security-framework" className="devops-card devops-card--link">
              <Shield size={22} color="#7c3aed" />
              <h3>Cadre sécurité (12 piliers)</h3>
              <p>Auth, RBAC, chiffrement, audit, API, cloud.</p>
            </Link>
            <Link to="/admin/database-security" className="devops-card devops-card--link">
              <h3>🗄️ Sécurité PostgreSQL</h3>
              <p>TLS, Prisma, sauvegardes chiffrées, anti-SQLi.</p>
            </Link>
            <Link to="/admin/security" className="devops-card devops-card--link">
              <Shield size={22} color="#dc2626" />
              <h3>Centre de sécurité</h3>
              <p>IDS, anti-virus, scans et menaces.</p>
            </Link>
            <Link to="/admin/intelligent-security" className="devops-card devops-card--link">
              <h3>🧠 Sécurité intelligente</h3>
              <p>Fraude IA, sessions, JWT, 2FA.</p>
            </Link>
            <Link to="/admin/activity-logs" className="devops-card devops-card--link">
              <h3>📋 Journaux d&apos;activité</h3>
              <p>Audit connexions, actions sensibles.</p>
            </Link>
            <Link to="/admin/backups" className="devops-card devops-card--link">
              <HardDrive size={22} color="#059669" />
              <h3>Sauvegardes</h3>
              <p>pg_dump planifié, restauration, snapshots.</p>
            </Link>
          </div>
          <div className="devops-card devops-card--code" style={{ marginTop: 16 }}>
            <h3>Pipeline DevSecOps</h3>
            <p>
              <code>.github/workflows/security.yml</code> — Gitleaks (secrets), Trivy (images Docker),
              OWASP dependency-check, npm audit. Planifié chaque lundi 03:00 UTC.
            </p>
          </div>
        </section>
      )}

      {!adminMode && <MobileBottomNav items={AUTH_PUBLIC_MOBILE_NAV} />}
    </div>
  );
};

export default DevOpsPlatformPage;
