import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Database, HardDrive, Camera, TrendingUp, Server } from 'lucide-react';
import { MOBILE_CLOUD_DOMAINS, countMobileCloudFeatures } from '../config/mobileCloudCatalog';
import MobileBottomNav, { AUTH_PUBLIC_MOBILE_NAV } from '../components/MobileBottomNav';
import './EnterpriseFeaturesPage.css';

const CLOUD_PROVIDERS = [
  { name: 'AWS', status: 'Actif', detail: 'ECS Fargate + RDS PostgreSQL + ALB + ECR + S3 — docs/AWS-SETUP.md', color: '#059669' },
  { name: 'Docker / VPS', status: 'Actif', detail: 'docker-compose.yml, GHCR, deploy-vps.yml', color: '#059669' },
  { name: 'Render', status: 'Legacy', detail: 'render.yaml — remplacé par AWS (docs/AWS-SETUP.md)', color: '#94a3b8' },
  { name: 'Azure', status: 'Compatible', detail: 'AKS + Azure Database + Blob Storage', color: '#d97706' },
  { name: 'Google Cloud', status: 'Compatible', detail: 'GKE + Cloud SQL + Cloud Storage', color: '#d97706' },
];

const STACK = [
  { id: 'postgres', icon: Database, label: 'PostgreSQL 16', value: 'RDS AWS · Docker pgdata volume', desc: 'Schéma Prisma, migrations, healthcheck pg_isready' },
  { id: 'storage', icon: Camera, label: 'ESP32-CAM cloud', value: 'API télémétrie + bucket prêt', desc: 'JSON qualité temps réel — images option S3/GCS/Azure Blob' },
  { id: 'scale', icon: TrendingUp, label: 'Scalabilité', value: 'Stateless + health checks', desc: 'Réplication API/ML, load balancer, HPA Kubernetes' },
];

const CloudInfrastructurePage = () => {
  const stats = countMobileCloudFeatures();
  const cloudDomain = MOBILE_CLOUD_DOMAINS.find((d) => d.id === 'cloud');

  return (
    <div className="ef-page">
      <Link to="/enterprise" className="ef-back">← Fonctionnalités entreprise</Link>

      <header className="ef-hero" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0369a1 100%)' }}>
        <h1><Cloud size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />Cloud Computing</h1>
        <p>
          Infrastructure cloud PetfoodTN — PostgreSQL managé, conteneurs Docker, sauvegardes
          et architecture multi-cloud (AWS, Azure, GCP).
        </p>
        <div className="ef-stats">
          <div className="ef-stat"><strong>{stats.total}</strong><span>Capacités</span></div>
          <div className="ef-stat"><strong>PG 16</strong><span>Base de données</span></div>
          <div className="ef-stat"><strong>3</strong><span>Clouds compatibles</span></div>
        </div>
      </header>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Server size={20} /> Fournisseurs &amp; déploiement
        </h2>
        <div className="ef-grid">
          {CLOUD_PROVIDERS.map((p) => (
            <article key={p.name} className="ef-card">
              <h3>{p.name}</h3>
              <p>{p.detail}</p>
              <span className={`ef-badge ef-badge--${p.status === 'Actif' ? 'ok' : 'partial'}`}>{p.status}</span>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Stack technique</h2>
        {STACK.map(({ id, icon: Icon, label, value, desc }) => (
          <article key={id} id={id} className="ef-card" style={{ marginBottom: 12 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon size={18} color="#1e40af" /> {label}
            </h3>
            <p><strong>{value}</strong></p>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{desc}</p>
          </article>
        ))}
      </section>

      <section className="ef-card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 8px' }}>Plateforme DevOps</h3>
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#475569' }}>
          CI/CD, Prometheus, Grafana, sauvegardes et interfaces admin — hub unifié{' '}
          <Link to="/devops">/devops →</Link>
        </p>
      </section>

      <section className="ef-card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 8px' }}>Plateforme Big Data</h3>
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#475569' }}>
          Kafka, Spark et Hadoop pour commandes massives, IoT temps réel et stockage images ESP32-CAM.
          {' '}
          <Link to="/big-data">Voir la plateforme →</Link>
        </p>
      </section>

      <section className="ef-card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <HardDrive size={18} /> Sauvegarde automatique
        </h3>
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#475569' }}>
          Volume PostgreSQL <code>pgdata</code>, snapshots planifiés via cron <code>pg_dump</code>,
          panel admin <Link to="/admin/backups">/admin/backups</Link>.
        </p>
        <pre style={{ margin: 0, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 11, overflow: 'auto' }}>
{`# Exemple cron VPS (docs/DEVOPS.md)
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/petfoodtn-$(date +\\%F).sql.gz`}
        </pre>
      </section>

      {cloudDomain && (
        <section>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Fichiers infrastructure</h2>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#475569', lineHeight: 1.9 }}>
            <li><code>infra/terraform/aws/</code> — Terraform ECS Fargate + RDS + ALB + ECR + S3</li>
            <li><code>.github/workflows/publish-ecr.yml</code> — CI images ECR</li>
            <li><code>.github/workflows/deploy-aws.yml</code> — CD ECS rolling deploy</li>
            <li><code>docker-compose.yml</code> — Stack locale PostgreSQL + backend + frontend</li>
            <li><code>docs/AWS-SETUP.md</code>, <code>docs/DEVOPS.md</code></li>
          </ul>
        </section>
      )}

      <MobileBottomNav items={AUTH_PUBLIC_MOBILE_NAV} />
    </div>
  );
};

export default CloudInfrastructurePage;
