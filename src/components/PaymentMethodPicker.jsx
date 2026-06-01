import React, { useEffect, useState } from 'react';
import { PAYMENT_METHODS } from '../constants/paymentMethods';
import { getWallet } from '../services/walletService';

const PaymentMethodPicker = ({ value, onChange, layout = 'grid' }) => {
  const isGrid = layout === 'grid';
  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    getWallet()
      .then((w) => setWalletBalance(w?.balance ?? 0))
      .catch(() => setWalletBalance(null));
  }, [value]);

  return (
    <div
      style={{
        display: isGrid ? 'grid' : 'flex',
        gridTemplateColumns: isGrid ? 'repeat(auto-fill, minmax(140px, 1fr))' : undefined,
        flexWrap: isGrid ? undefined : 'wrap',
        gap: '10px',
      }}
    >
      {PAYMENT_METHODS.map((method) => {
        const selected = value === method.id;
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            style={{
              padding: '12px 14px',
              borderRadius: '14px',
              border: selected ? '2px solid #e67e22' : '2px solid #e5e7eb',
              background: selected ? 'rgba(230,126,34,0.08)' : 'white',
              cursor: 'pointer',
              fontWeight: selected ? 700 : 500,
              color: selected ? '#c2410c' : '#374151',
              textAlign: 'left',
              fontSize: '13px',
              lineHeight: 1.35,
            }}
          >
            <span style={{ marginRight: '6px' }}>{method.emoji}</span>
            {method.label}
            {method.id === 'wallet' && walletBalance != null && (
              <span
                style={{
                  display: 'block',
                  fontSize: '11px',
                  color: walletBalance > 0 ? '#059669' : '#dc2626',
                  marginTop: '4px',
                  fontWeight: 700,
                }}
              >
                Solde : {walletBalance.toFixed(2)} DT
              </span>
            )}
            {method.online && method.id !== 'wallet' && (
              <span
                style={{
                  display: 'block',
                  fontSize: '10px',
                  color: '#6b7280',
                  marginTop: '4px',
                  fontWeight: 500,
                }}
              >
                Paiement en ligne
              </span>
            )}
            {method.id === 'wallet' && (
              <span
                style={{
                  display: 'block',
                  fontSize: '10px',
                  color: '#6b7280',
                  marginTop: '4px',
                  fontWeight: 500,
                }}
              >
                Débit instantané
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PaymentMethodPicker;
