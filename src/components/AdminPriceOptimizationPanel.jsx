import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const actionIcon = { increase: TrendingUp, decrease: TrendingDown, promote: TrendingDown, maintain: Minus, review: Minus };

const AdminPriceOptimizationPanel = ({ items = [] }) => (
  <div className="mi-panel">
    <p className="mi-summary">Suggestions de prix selon demande, stock et tendances marché.</p>
    <ul className="mi-list">
      {items.map((item) => {
        const Icon = actionIcon[item.action] || Minus;
        return (
          <li key={item.productId} className={`mi-item mi-item--${item.action}`}>
            <Icon size={18} aria-hidden />
            <div>
              <strong>{item.name}</strong>
              <p>{item.aiSummary}</p>
              <div className="mi-meta">
                <span>Actuel : {item.currentPrice?.toFixed(2)} DT</span>
                <span>Suggéré : {item.suggestedPrice?.toFixed(2)} DT</span>
                <span>Ventes : {item.salesCount}</span>
              </div>
              {(item.reasons || []).length > 0 && (
                <p className="mi-reasons">{item.reasons.join(' · ')}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  </div>
);

export default AdminPriceOptimizationPanel;
