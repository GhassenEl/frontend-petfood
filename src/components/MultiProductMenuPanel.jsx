import React from 'react';
import { ChefHat } from 'lucide-react';

const MultiProductMenuPanel = ({ menu, loading }) => {
  if (loading) return <p className="an-loading">Génération des menus hebdomadaires…</p>;
  if (!menu?.days?.length) return <p className="an-empty">{menu?.summary || 'Menus indisponibles.'}</p>;

  return (
    <div className="an-menus">
      <p className="an-ai-summary">
        <ChefHat size={16} aria-hidden /> {menu.summary}
      </p>

      {menu.products?.length > 0 && (
        <div className="an-menu-products">
          {menu.products.map((p) => (
            <span key={p.id} className="an-menu-product-chip">
              {p.name} <small>({p.score})</small>
            </span>
          ))}
        </div>
      )}

      <div className="an-days-grid">
        {menu.days.map((day) => (
          <article key={day.date} className="an-day-card">
            <h4>{day.dayName}</h4>
            <p className="an-day-totals">{day.totalGrams} g · {day.totalKcal} kcal</p>
            <ul className="an-meals">
              {day.meals.map((meal) => (
                <li key={meal.label}>
                  <span>{meal.label}</span>
                  <span>
                    {meal.items.map((it) => `${it.grams}g ${it.product}`).join(' + ')}
                  </span>
                </li>
              ))}
            </ul>
            {day.rotationNote && <p className="an-day-note">{day.rotationNote}</p>}
          </article>
        ))}
      </div>
    </div>
  );
};

export default MultiProductMenuPanel;
