import React from 'react';

const statusLabel = {
  up_to_date: 'À jour',
  due_soon: 'Bientôt',
  overdue: 'En retard',
};

const DigitalTwinMedicalPanel = ({ twin }) => {
  const { medical, healthRisks } = twin || {};

  return (
    <div className="dtwin-panel">
      {medical?.allergies && (
        <div className="dtwin-alert dtwin-alert--warn">
          Allergies : <strong>{medical.allergies}</strong>
        </div>
      )}

      {(medical?.chronicConditions || []).length > 0 && (
        <section className="dtwin-card">
          <h3>Conditions chroniques</h3>
          <ul className="dtwin-tags">
            {medical.chronicConditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="dtwin-card">
        <h3>Vaccinations</h3>
        {!medical?.vaccines?.length ? (
          <p className="dtwin-muted">Aucune donnée vaccinale.</p>
        ) : (
          <ul className="dtwin-list">
            {medical.vaccines.map((v) => (
              <li key={v.name}>
                <strong>{v.name}</strong>
                <span className={`dtwin-status dtwin-status--${v.status || 'up_to_date'}`}>
                  {statusLabel[v.status] || v.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dtwin-card">
        <h3>Consultations vétérinaires</h3>
        {!medical?.consultations?.length ? (
          <p className="dtwin-muted">Historique vide.</p>
        ) : (
          <ul className="dtwin-timeline">
            {medical.consultations.map((c, i) => (
              <li key={i}>
                <time>{new Date(c.date).toLocaleDateString('fr-FR')}</time>
                <strong>{c.type}</strong>
                <span className="dtwin-muted">{c.vet}</span>
                {c.notes && <p>{c.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {(medical?.prescriptions || []).length > 0 && (
        <section className="dtwin-card">
          <h3>Traitements en cours</h3>
          <ul className="dtwin-list">
            {medical.prescriptions.map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong>
                {p.active && <span className="dtwin-badge dtwin-badge--ok">Actif</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(healthRisks || []).length > 0 && (
        <section className="dtwin-card">
          <h3>Risques détectés (IA)</h3>
          {healthRisks.map((r) => (
            <div key={r.id} className={`dtwin-risk dtwin-risk--${r.severity}`}>
              <strong>{r.title}</strong>
              <p>{r.detail}</p>
              <span className="dtwin-muted">→ {r.action}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default DigitalTwinMedicalPanel;
