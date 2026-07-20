import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { JURY_COMBINED_VIDEOS } from '../config/juryDemoConfig';

/**
 * Lecteur séquentiel commercial → plateforme → Flutter + CTAs live pour le jury.
 */
const JuryCombinedVideosPanel = ({ onLiveAction }) => {
  const [activeId, setActiveId] = useState(JURY_COMBINED_VIDEOS[0].id);
  const [autoChain, setAutoChain] = useState(true);
  const [status, setStatus] = useState('');
  const videoRef = useRef(null);

  const active = JURY_COMBINED_VIDEOS.find((v) => v.id === activeId) || JURY_COMBINED_VIDEOS[0];
  const activeIndex = JURY_COMBINED_VIDEOS.findIndex((v) => v.id === activeId);

  const selectChapter = useCallback((id, { play = true } = {}) => {
    setActiveId(id);
    setStatus('');
    if (play) {
      requestAnimationFrame(() => {
        const el = videoRef.current;
        if (el) {
          el.load();
          el.play().catch(() => setStatus('Cliquez Play sur la vidéo (autoplay bloqué).'));
        }
      });
    }
  }, []);

  const playTrilogy = useCallback(() => {
    setAutoChain(true);
    selectChapter(JURY_COMBINED_VIDEOS[0].id, { play: true });
  }, [selectChapter]);

  const handleEnded = useCallback(() => {
    if (!autoChain) {
      setStatus('Chapitre terminé — choisissez le suivant ou ouvrez une interface live.');
      return;
    }
    const next = JURY_COMBINED_VIDEOS[activeIndex + 1];
    if (next) {
      setStatus(`Enchaînement → ${next.title}`);
      selectChapter(next.id, { play: true });
    } else {
      setStatus('Trilogie terminée — passez aux interfaces live ci-dessous.');
    }
  }, [autoChain, activeIndex, selectChapter]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return undefined;
    el.load();
    return undefined;
  }, [active.src]);

  return (
    <section className="jury-section jury-videos">
      <h2>Démo combinée — commercial · plateforme · Flutter</h2>
      <p className="jury-lead">
        Ordre soutenance : 1) vidéo commerciale, 2) plateforme web multi-acteurs, 3) app Flutter.
        Enchaînez les chapitres, puis ouvrez les écrans live pour le jury.
      </p>

      <div className="jury-videos__toolbar">
        <button type="button" className="jury-btn jury-btn--primary" onClick={playTrilogy}>
          ▶ Lancer la trilogie
        </button>
        <label className="jury-videos__chain">
          <input
            type="checkbox"
            checked={autoChain}
            onChange={(e) => setAutoChain(e.target.checked)}
          />
          Enchaîner automatiquement les 3 vidéos
        </label>
        {status && <p className="jury-videos__status" role="status">{status}</p>}
      </div>

      <ol className="jury-videos__chapters" aria-label="Chapitres vidéo">
        {JURY_COMBINED_VIDEOS.map((chapter, idx) => (
          <li key={chapter.id}>
            <button
              type="button"
              className={`jury-videos__chapter${activeId === chapter.id ? ' jury-videos__chapter--active' : ''}`}
              style={{ '--chapter-accent': chapter.accent }}
              onClick={() => selectChapter(chapter.id, { play: true })}
            >
              <span className="jury-videos__order">{idx + 1}</span>
              <span className="jury-videos__chapter-text">
                <strong>{chapter.title}</strong>
                <em>{chapter.subtitle}</em>
                <small>{chapter.durationHint}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="jury-videos__player-wrap">
        <video
          key={active.src}
          ref={videoRef}
          className="jury-videos__player"
          controls
          playsInline
          preload="metadata"
          src={active.src}
          onEnded={handleEnded}
          onError={() => setStatus(
            `Vidéo introuvable (${active.file}). Vérifiez public/demo-videos/ ou demo-videos/.`,
          )}
        >
          <track kind="captions" />
        </video>
        <div className="jury-videos__now" style={{ borderColor: active.accent }}>
          <span className="jury-pill" style={{ background: active.accent }}>
            Chapitre {active.order}/3
          </span>
          <h3>{active.title}</h3>
          <p>{active.subtitle}</p>
          <ul className="jury-list jury-videos__points">
            {active.talkingPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="jury-videos__live">
        <h3>Après ce chapitre — démo live</h3>
        <div className="jury-videos__live-actions">
          {active.liveActions.map((action) => (
            action.kind === 'link' ? (
              <Link key={action.path + action.label} to={action.path} className="jury-btn jury-btn--sm">
                {action.label} →
              </Link>
            ) : (
              <button
                key={action.path + action.label}
                type="button"
                className="jury-btn jury-btn--sm"
                onClick={() => onLiveAction?.(action)}
              >
                {action.label} →
              </button>
            )
          ))}
        </div>
        <p className="jury-note">
          Fichiers : <code>demo-videos/{active.file}</code>
          {' · '}
          URL : <code>{active.src}</code>
        </p>
      </div>
    </section>
  );
};

export default JuryCombinedVideosPanel;
