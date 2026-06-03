import React from 'react';
import { OWNER_EMOTIONS } from '../constants/ownerEmotions';

const ClientEmotionPicker = ({ value, onChange, id = 'emotion-picker' }) => (
  <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="cc-select-emotion">
    {OWNER_EMOTIONS.map((e) => (
      <option key={e.id} value={e.id}>
        {e.emoji} {e.label}
      </option>
    ))}
  </select>
);

export default ClientEmotionPicker;
