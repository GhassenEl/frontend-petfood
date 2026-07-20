import { jsPDF } from 'jspdf';

const COMPANY = {
  name: 'PetfoodTN — Ordonnance vétérinaire',
  address: 'Lac 1, Tunis 1053',
  email: 'contact@petfood.tn',
};

const writeLines = (doc, text, x, y, maxWidth = 180) => {
  const lines = doc.splitTextToSize(String(text || '—'), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 5 + 2;
};

/**
 * Export PDF d'une ordonnance générée (brouillon IA ou ordonnance officielle).
 * @param {{
 *   petName?: string,
 *   animalType?: string,
 *   ownerName?: string,
 *   diagnosis?: string,
 *   symptoms?: string,
 *   medications?: Array<{name?: string, medication?: string, dosage?: string, frequency?: string, duration?: string, rationale?: string}>,
 *   supplements?: Array<{name?: string, dosage?: string, rationale?: string}>,
 *   instructions?: string,
 *   aiSummary?: string,
 *   vetName?: string,
 *   draftId?: string,
 *   disclaimer?: string,
 * }} data
 */
export const exportPrescriptionPdf = (data = {}) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = 18;

  doc.setFontSize(15);
  doc.setFont(undefined, 'bold');
  doc.text(COMPANY.name, 14, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(80);
  doc.text(`${COMPANY.address} · ${COMPANY.email}`, 14, y);
  y += 5;
  doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 14, y);
  if (data.draftId) {
    y += 5;
    doc.text(`Réf. brouillon : ${data.draftId}`, 14, y);
  }
  y += 10;
  doc.setTextColor(0);

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Patient : ${data.petName || '—'}`, 14, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  y = writeLines(
    doc,
    `Espèce : ${data.animalType || '—'} · Propriétaire : ${data.ownerName || '—'} · Vétérinaire : ${data.vetName || 'Dr. —'}`,
    14,
    y,
  );

  if (data.diagnosis) {
    y += 2;
    doc.setFont(undefined, 'bold');
    doc.text('Diagnostic', 14, y);
    y += 5;
    doc.setFont(undefined, 'normal');
    y = writeLines(doc, data.diagnosis, 14, y);
  }

  if (data.symptoms) {
    doc.setFont(undefined, 'bold');
    doc.text('Symptômes', 14, y);
    y += 5;
    doc.setFont(undefined, 'normal');
    y = writeLines(doc, data.symptoms, 14, y);
  }

  if (data.aiSummary) {
    doc.setFont(undefined, 'bold');
    doc.text('Synthèse IA', 14, y);
    y += 5;
    doc.setFont(undefined, 'normal');
    y = writeLines(doc, data.aiSummary, 14, y);
  }

  y += 2;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Médicaments prescrits', 14, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');

  const meds = data.medications || [];
  if (!meds.length) {
    y = writeLines(doc, 'Aucun médicament listé.', 14, y);
  } else {
    meds.forEach((m, i) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      const name = m.name || m.medication || `Médicament ${i + 1}`;
      doc.setFont(undefined, 'bold');
      y = writeLines(doc, `${i + 1}. ${name}`, 14, y);
      doc.setFont(undefined, 'normal');
      y = writeLines(
        doc,
        `Posologie : ${m.dosage || '—'} · ${m.frequency || '—'} · ${m.duration || '—'}`,
        18,
        y,
      );
      if (m.rationale) y = writeLines(doc, `Note : ${m.rationale}`, 18, y);
      y += 2;
    });
  }

  const supplements = data.supplements || [];
  if (supplements.length) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont(undefined, 'bold');
    doc.text('Compléments', 14, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    supplements.forEach((s) => {
      y = writeLines(doc, `• ${s.name} — ${s.dosage || ''}${s.rationale ? ` (${s.rationale})` : ''}`, 14, y);
    });
  }

  if (data.instructions) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    y += 2;
    doc.setFont(undefined, 'bold');
    doc.text('Consignes au propriétaire', 14, y);
    y += 5;
    doc.setFont(undefined, 'normal');
    y = writeLines(doc, data.instructions, 14, y);
  }

  y = Math.max(y + 8, 250);
  doc.setFontSize(8);
  doc.setTextColor(100);
  writeLines(
    doc,
    data.disclaimer ||
      'Document généré avec assistance IA PetfoodTN — validation et signature sous responsabilité du vétérinaire.',
    14,
    y,
  );

  const safeName = String(data.petName || 'ordonnance').replace(/[^\w\-]+/g, '_');
  doc.save(`ordonnance_${safeName}_${Date.now()}.pdf`);
};

export default exportPrescriptionPdf;
