import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, Zap, Flame, HardDrive, RefreshCw, Activity, Camera, ShoppingCart, Users } from 'lucide-react';
import { BIG_DATA_USE_CASES } from '../config/bigDataCatalog';
import fetchBigDataPlatform from '../services/bigDataPlatformService';
import './BigDataPlatformPage.css';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Database },
  { id: 'kafka', label: 'Kafka', icon: Zap },
  { id: 'spark', label: 'Spark', icon: Flame },
  { id: 'hadoop', label: 'Hadoop', icon: HardDrive },
];

const formatNum = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};

const BigDataPlatformPage = () => {
  const [tab, setTab] = useState('overview');
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await fetchBigDataPlatform());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (TABS.some((t) => t.id === hash)) setTab(hash);
  }, []);

  const s = pack?.summary || {};
  const kafka = pack?.pipelines?.find((p) => p.id === 'kafka');
  const spark = pack?.pipelines?.find((p) => p.id === 'spark');
  const hadoop = pack?.pipelines?.find((p) => p.id === 'hadoop');

  return (
    <div className="bd-page">
      <Link to="/enterprise" className="bd-back">← Fonctionnalités entreprise</Link>

      <header className="bd-hero">
        <p className="bd-hero__eyebrow">PetfoodTN Data Platform</p>
        <h1><Database size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />Big Data</h1>
        <p>
          Traitement de milliers de commandes et données IoT, analyse temps réel des comportements clients,
          stockage massif des images ESP32-CAM — Apache Spark, Hadoop et Kafka.
        </p>
        <div className="bd-stats">
          <div><strong>{formatNum(s.ordersPerDay || 0)}</strong><span>Commandes/j</span></div>
          <div><strong>{formatNum(s.iotEventsPerDay || 0)}</strong><span>Événements IoT/j</span></div>
          <div><strong>{(s.esp32CamImagesGb || 0).toLocaleString('fr-FR')} Go</strong><span>Images CAM</span></div>
          <div><strong>{formatNum(s.kafkaThroughputMsgMin || 0)}/min</strong><span>Throughput Kafka</span></div>
        </div>
        <button type="button" className="bd-refresh" onClick={load} disabled={loading}>
          <RefreshCw size={14} /> {loading ? 'Actualisation…' : 'Actualiser métriques'}
        </button>
        {pack?.mode === 'demo' && <span className="bd-demo-pill">Mode démo pipeline</span>}
      </header>

      <div className="bd-tabs" role="tablist" aria-label="Technologies Big Data">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`bd-tab${tab === id ? ' is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <div className="bd-content" role="tabpanel">
        {tab === 'overview' && (
          <>
            <section className="bd-use-cases">
              {BIG_DATA_USE_CASES.map((u) => (
                <article key={u.id} className="bd-use-card">
                  <h3>{u.title}</h3>
                  <p>{u.desc}</p>
                  <strong>{u.metric}</strong>
                  <div className="bd-tech-chips">
                    {u.tech.map((t) => <span key={t}>{t}</span>)}
                  </div>
                </article>
              ))}
            </section>

            {pack?.behaviorInsights && (
              <section className="bd-panel">
                <h2><Users size={18} /> Analyse comportements clients (temps réel)</h2>
                <div className="bd-insight-grid">
                  {pack.behaviorInsights.map((i) => (
                    <div key={i.segment} className="bd-insight-card">
                      <span>{i.segment}</span>
                      <strong>{i.value}</strong>
                      <small>{i.trend} · {i.action}</small>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="bd-links">
              <Link to="/client-iot" className="bd-link-card"><Camera size={18} /> IoT &amp; ESP32-CAM</Link>
              <Link to="/admin/powerbi" className="bd-link-card"><Activity size={18} /> BI Admin</Link>
              <Link to="/client-smart-hub" className="bd-link-card"><ShoppingCart size={18} /> Hub intelligent</Link>
            </section>
          </>
        )}

        {tab === 'kafka' && kafka && (
          <section className="bd-panel">
            <header className="bd-panel__head">
              <Zap size={22} color="#e11d48" />
              <div>
                <h2>{kafka.tech}</h2>
                <p>{kafka.description}</p>
              </div>
            </header>
            <table className="bd-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Partitions</th>
                  <th>Débit</th>
                  <th>Consommateurs</th>
                </tr>
              </thead>
              <tbody>
                {kafka.topics.map((t) => (
                  <tr key={t.name}>
                    <td><code>{t.name}</code></td>
                    <td>{t.partitions}</td>
                    <td>{t.rate}</td>
                    <td>{t.consumers.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pack?.kafkaLag && (
              <>
                <h3 className="bd-subtitle">Consumer lag</h3>
                <ul className="bd-lag-list">
                  {pack.kafkaLag.map((l) => (
                    <li key={l.group}>
                      <code>{l.group}</code>
                      <span>{l.topic}</span>
                      <strong className={l.lag > 1000 ? ' is-warn' : ''}>{l.lag} msg</strong>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <pre className="bd-code">{`# Démarrage local
docker compose -f docker-compose.yml -f docker-compose.bigdata.yml up -d

# Producteur IoT (exemple)
kafka-console-producer --topic petfood.iot.telemetry --bootstrap-server localhost:9092`}</pre>
          </section>
        )}

        {tab === 'spark' && spark && (
          <section className="bd-panel">
            <header className="bd-panel__head">
              <Flame size={22} color="#f59e0b" />
              <div>
                <h2>{spark.tech}</h2>
                <p>{spark.description}</p>
              </div>
            </header>
            <ul className="bd-job-list">
              {spark.jobs.map((j) => (
                <li key={j.name} className={`bd-job-item bd-job--${j.status}`}>
                  <div>
                    <strong>{j.name}</strong>
                    <span>{j.mode} · latence {j.latency}</span>
                  </div>
                  <span className="bd-job-status">{j.status}</span>
                </li>
              ))}
            </ul>
            <pre className="bd-code">{`# Spark Structured Streaming — comportements clients
spark.readStream
  .format("kafka")
  .option("subscribe", "petfood.client.behavior")
  .load()
  .groupBy(window("5 minutes"), col("clientId"))
  .agg(count("*").alias("events"))`}</pre>
          </section>
        )}

        {tab === 'hadoop' && hadoop && (
          <section className="bd-panel">
            <header className="bd-panel__head">
              <HardDrive size={22} color="#0369a1" />
              <div>
                <h2>{hadoop.tech}</h2>
                <p>{hadoop.description}</p>
              </div>
            </header>
            <p className="bd-hdfs-usage">
              HDFS utilisé : <strong>{s.hdfsUsedTb || 2.34} To</strong> — dont images ESP32-CAM qualité alimentaire.
            </p>
            <table className="bd-table">
              <thead>
                <tr>
                  <th>Chemin HDFS</th>
                  <th>Taille</th>
                  <th>Fichiers</th>
                  <th>Format</th>
                </tr>
              </thead>
              <tbody>
                {hadoop.storage.map((row) => (
                  <tr key={row.path}>
                    <td><code>{row.path}</code></td>
                    <td>{row.size}</td>
                    <td>{row.files}</td>
                    <td>{row.format}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pack?.recentBatches && (
              <>
                <h3 className="bd-subtitle">Jobs batch récents</h3>
                <ul className="bd-batch-list">
                  {pack.recentBatches.map((b) => (
                    <li key={b.id}>
                      <strong>{b.job}</strong>
                      <span>{formatNum(b.records)} enreg. · {b.duration}</span>
                      <span className={`bd-batch-status bd-batch--${b.status}`}>{b.status}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default BigDataPlatformPage;
