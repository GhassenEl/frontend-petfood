import React, { useState } from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { Lock, Building2, FileText, Banknote, Wallet, Plus } from 'lucide-react';
import { DEFAULT_BANK_TRANSFER } from '../constants/paymentMethods';
import { topUpWallet } from '../services/walletService';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      lineHeight: '24px',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: { color: '#9e2146' },
  },
};

const boxStyle = {
  padding: '16px',
  background: '#fafafa',
  borderRadius: '14px',
  border: '2px solid #e5e7eb',
  fontSize: '14px',
  color: '#374151',
  lineHeight: 1.55,
};

const PaymentMethodDetails = ({
  method,
  bankTransfer = DEFAULT_BANK_TRANSFER,
  paymentNote,
  onPaymentNoteChange,
  stripeReady,
  stripeDemo,
  walletBalance,
  onWalletBalanceChange,
  amountDue = 0,
}) => {
  const [topUpLoading, setTopUpLoading] = useState(false);

  const handleTopUp = async (amt) => {
    setTopUpLoading(true);
    try {
      const result = await topUpWallet(amt, 'demo');
      onWalletBalanceChange?.(result.balance);
    } catch (err) {
      window.alert(err?.response?.data?.error || 'Recharge impossible');
    } finally {
      setTopUpLoading(false);
    }
  };

  if (!method) return null;

  if (method === 'wallet') {
    const balance = walletBalance ?? 0;
    const insufficient = amountDue > 0 && balance < amountDue;
    return (
      <div style={boxStyle}>
        <p style={{ margin: '0 0 10px', fontWeight: 700 }}>
          <Wallet size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Portefeuille électronique
        </p>
        <p style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 800, color: '#854d0e' }}>
          {balance.toFixed(2)} DT
        </p>
        {amountDue > 0 && (
          <p style={{ margin: '0 0 12px', color: insufficient ? '#dc2626' : '#059669', fontWeight: 600 }}>
            {insufficient
              ? `Solde insuffisant (manque ${(amountDue - balance).toFixed(2)} DT)`
              : `Montant à payer : ${amountDue.toFixed(2)} DT`}
          </p>
        )}
        <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#64748b' }}>
          Rechargez votre portefeuille pour payer vos commandes et réservations.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[20, 50, 100].map((amt) => (
            <button
              key={amt}
              type="button"
              disabled={topUpLoading}
              onClick={() => handleTopUp(amt)}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #fde047',
                background: '#fefce8',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              <Plus size={12} style={{ verticalAlign: 'middle' }} /> +{amt} DT
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (method === 'stripe' || method === 'card') {
    return (
      <div style={boxStyle}>
        <div style={{ marginBottom: '12px', fontWeight: 600 }}>
          <Lock size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          {method === 'stripe' ? 'Paiement sécurisé Stripe' : 'Carte bancaire (Stripe)'}
        </div>
        {stripeDemo && (
          <p style={{ margin: '0 0 12px', color: '#059669', fontWeight: 600 }}>
            Mode démo : la carte sera simulée comme payée.
          </p>
        )}
        {!stripeDemo && !stripeReady && (
          <p style={{ margin: '0 0 12px', color: '#b45309' }}>Chargement du formulaire carte…</p>
        )}
        {!stripeDemo && stripeReady && (
          <div style={{ padding: '12px 0' }}>
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        )}
      </div>
    );
  }

  if (method === 'paypal') {
    return (
      <div style={boxStyle}>
        <p style={{ margin: 0 }}>
          <strong>PayPal</strong> — au clic sur « Confirmer », le paiement sera validé
          (mode démo si PayPal n’est pas configuré côté serveur).
        </p>
      </div>
    );
  }

  if (method === 'transfer') {
    return (
      <div style={boxStyle}>
        <p style={{ margin: '0 0 10px', fontWeight: 700 }}>
          <Banknote size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Coordonnées pour virement
        </p>
        <p style={{ margin: '4px 0' }}><strong>Bénéficiaire :</strong> {bankTransfer.beneficiary}</p>
        <p style={{ margin: '4px 0' }}><strong>Banque :</strong> {bankTransfer.bank}</p>
        <p style={{ margin: '4px 0' }}><strong>RIB :</strong> {bankTransfer.rib}</p>
        <p style={{ margin: '4px 0' }}><strong>IBAN :</strong> {bankTransfer.iban}</p>
        <p style={{ margin: '4px 0' }}><strong>SWIFT :</strong> {bankTransfer.swift}</p>
        <p style={{ margin: '12px 0 0', color: '#6b7280' }}>{bankTransfer.referenceHint}</p>
        {onPaymentNoteChange && (
          <input
            type="text"
            placeholder="Référence de votre virement (optionnel)"
            value={paymentNote || ''}
            onChange={(e) => onPaymentNoteChange(e.target.value)}
            style={inputStyle}
          />
        )}
      </div>
    );
  }

  if (method === 'check') {
    return (
      <div style={boxStyle}>
        <FileText size={16} style={{ marginBottom: '8px' }} />
        <p style={{ margin: 0 }}>
          Paiement par <strong>chèque</strong> à l’ordre de PetfoodTN. La commande reste en attente
          jusqu’à encaissement du chèque.
        </p>
        {onPaymentNoteChange && (
          <input
            type="text"
            placeholder="N° de chèque ou banque émettrice"
            value={paymentNote || ''}
            onChange={(e) => onPaymentNoteChange(e.target.value)}
            style={inputStyle}
          />
        )}
      </div>
    );
  }

  if (method === 'cash') {
    return (
      <div style={boxStyle}>
        <p style={{ margin: 0 }}>
          <strong>Espèces</strong> — paiement à la livraison (contre remboursement) ou en boutique.
          Préparez le montant exact si possible.
        </p>
      </div>
    );
  }

  if (method === 'pro_card') {
    return (
      <div style={boxStyle}>
        <Building2 size={16} style={{ marginBottom: '8px' }} />
        <p style={{ margin: '0 0 12px' }}>
          <strong>Carte professionnelle</strong> — réservée aux comptes B2B. Indiquez la société et
          les 4 derniers chiffres de la carte pro.
        </p>
        {onPaymentNoteChange && (
          <>
            <input
              type="text"
              placeholder="Raison sociale / société"
              value={paymentNote?.split('|')[0] || ''}
              onChange={(e) => {
                const last4 = paymentNote?.split('|')[1] || '';
                onPaymentNoteChange(`${e.target.value}|${last4}`);
              }}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="4 derniers chiffres carte pro"
              maxLength={4}
              value={paymentNote?.split('|')[1] || ''}
              onChange={(e) => {
                const company = paymentNote?.split('|')[0] || '';
                onPaymentNoteChange(`${company}|${e.target.value.replace(/\D/g, '').slice(0, 4)}`);
              }}
              style={{ ...inputStyle, marginTop: '10px' }}
            />
          </>
        )}
      </div>
    );
  }

  return null;
};

const inputStyle = {
  width: '100%',
  marginTop: '12px',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '2px solid #e5e7eb',
  fontSize: '14px',
  boxSizing: 'border-box',
};

export default PaymentMethodDetails;
