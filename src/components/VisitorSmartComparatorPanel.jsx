import React, { useState, useMemo } from 'react';
import { GitCompare } from 'lucide-react';
import { compareProductsSmart } from '../utils/productComparator';
import { formatDT } from '../utils/formatCurrency';

const VisitorSmartComparatorPanel = ({ products = [], reviewsByProductId = {} }) => {
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    const sid = String(id);
    setSelected((prev) => {
      if (prev.includes(sid)) return prev.filter((x) => x !== sid);
      if (prev.length >= 3) return prev;
      return [...prev, sid];
    });
  };

  const compareList = useMemo(
    () => selected.map((id) => products.find((p) => String(p.id || p._id) === id)).filter(Boolean),
    [selected, products],
  );

  const comparison = useMemo(() => {
    if (compareList.length < 2) return null;
    return compareProductsSmart(compareList, reviewsByProductId);
  }, [compareList, reviewsByProductId]);

  return (
    <div className="vis-intel-compare">
      <p className="vis-intel-muted">Sélectionnez 2 à 3 produits — comparaison nutrition, prix, avis et popularité.</p>
      <div className="vis-intel-compare-pick">
        {products.slice(0, 20).map((p) => {
          const id = String(p.id || p._id);
          const active = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              className={`vis-intel-chip${active ? ' vis-intel-chip--active' : ''}`}
              onClick={() => toggle(id)}
            >
              {p.name?.slice(0, 40)}
            </button>
          );
        })}
      </div>

      {comparison && (
        <>
          <p className="vis-intel-summary"><GitCompare size={16} aria-hidden /> {comparison.summary}</p>
          <div className="vis-intel-compare-table-wrap">
            <table className="vis-intel-compare-table">
              <thead>
                <tr>
                  <th>Critère</th>
                  {comparison.products.map((p) => (
                    <th key={p.id}>{p.name?.slice(0, 28)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.matrix.map((row) => (
                  <tr key={row.key}>
                    <td>{row.label}</td>
                    {comparison.products.map((p) => {
                      const keys = row.key.split('.');
                      let val = p;
                      keys.forEach((k) => { val = val?.[k]; });
                      return (
                        <td key={p.id}>{row.format ? row.format(val) : val ?? '—'}</td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td>Prix promo</td>
                  {comparison.products.map((p) => (
                    <td key={p.id}>{formatDT(p.promoPrice)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default VisitorSmartComparatorPanel;
