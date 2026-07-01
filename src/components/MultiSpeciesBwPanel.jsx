import React from 'react';
import { computeHydrationScore } from '../utils/nutritionHydrationEngine';
import { resolveSpecies, estimateTargetMl } from '../utils/speciesCatalog';
import './MultiSpeciesBwPanel.css';

const MultiSpeciesBwPanel = ({ pets = [], selectedPetId, onSelectPet }) => {
  if (!pets.length) return null;

  const effectiveTarget = (p) => (p.targetMl > 0 ? p.targetMl : estimateTargetMl(p.type || p.petType));
  const effectivePct = (p) => {
    if (p.percentOfTarget > 0) return Math.min(100, p.percentOfTarget);
    const target = effectiveTarget(p);
    return target > 0 ? Math.min(100, Math.round((p.todayMl / target) * 100)) : 0;
  };

  return (
    <section className="ms-bw-panel" aria-label="Vue noir et blanc tous animaux">
      <header className="ms-bw-panel__head">
        <span className="ms-bw-panel__icon" aria-hidden>◐</span>
        <div>
          <h2>Vue noir &amp; blanc — Tous les animaux</h2>
          <p>{pets.length} espèce{pets.length > 1 ? 's' : ''} · comparaison hydratation</p>
        </div>
      </header>
      <div className="ms-bw-panel__list">
        {pets.map((p) => {
          const species = resolveSpecies(p.type || p.petType);
          const pct = effectivePct(p);
          const score = computeHydrationScore({
            todayMl: p.todayMl ?? 0,
            targetMl: effectiveTarget(p),
          });
          const selected = p.petId === selectedPetId;
          const barClass = pct >= 80 ? 'ms-bw-bar--high' : pct >= 50 ? 'ms-bw-bar--mid' : 'ms-bw-bar--low';

          return (
            <button
              key={p.petId}
              type="button"
              className={`ms-bw-row${selected ? ' is-selected' : ''}`}
              onClick={() => onSelectPet?.(p.petId)}
            >
              <div className="ms-bw-row__top">
                <span className="ms-bw-row__emoji">{species.emoji}</span>
                <div className="ms-bw-row__meta">
                  <strong>{p.name || p.petName}</strong>
                  <span>{species.labelFr}</span>
                </div>
                <span className="ms-bw-row__score">{score}</span>
              </div>
              <div className="ms-bw-bar">
                <div className={`ms-bw-bar__fill ${barClass}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="ms-bw-row__sub">
                {species.usesAquarium
                  ? 'Aquarium · qualité eau'
                  : `${p.todayMl ?? 0} / ${effectiveTarget(p)} ml · ${pct} %`}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default MultiSpeciesBwPanel;
