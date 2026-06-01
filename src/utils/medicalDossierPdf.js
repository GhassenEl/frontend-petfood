import { jsPDF } from 'jspdf';

const COMPANY = {
  name: 'PetfoodTN — Dossier médical',
  address: 'Lac 1, Tunis 1053',
  email: 'contact@petfood.tn',
};

export const exportMedicalDossierPdf = (dossier) => {
  if (!dossier) return;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = 20;

  doc.setFontSize(16);
  doc.text(COMPANY.name, 14, y);
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text(`N° ${dossier.dossierNumber || '—'}`, 14, y);
  y += 10;
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.text(`Patient : ${dossier.petName}`, 14, y);
  y += 7;
  doc.setFontSize(10);
  doc.text(
    `Propriétaire : ${dossier.owner?.name || '—'} · ${dossier.owner?.email || ''}`,
    14,
    y
  );
  y += 6;
  if (dossier.allergies) {
    doc.setTextColor(180, 80, 0);
    doc.text(`Allergies : ${dossier.allergies}`, 14, y);
    doc.setTextColor(0);
    y += 6;
  }
  if (dossier.chronicDiseases) {
    doc.text(`Antécédents : ${dossier.chronicDiseases}`, 14, y);
    y += 6;
  }

  const prescriptions = dossier.prescriptions || [];
  if (prescriptions.length) {
    y += 4;
    doc.setFontSize(12);
    doc.text('Ordonnances vétérinaires', 14, y);
    y += 8;
    doc.setFontSize(9);
    prescriptions.forEach((rx) => {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.setFont(undefined, 'bold');
      doc.text(
        `${rx.petName || dossier.petName} — ${new Date(rx.createdAt).toLocaleDateString('fr-FR')}`,
        14,
        y
      );
      y += 5;
      doc.setFont(undefined, 'normal');
      if (rx.vet?.name) {
        doc.text(`Vétérinaire : Dr. ${rx.vet.name}`, 14, y);
        y += 5;
      }
      let meds = [];
      try {
        meds = typeof rx.medications === 'string' ? JSON.parse(rx.medications) : rx.medications;
        if (!Array.isArray(meds)) meds = [meds];
      } catch {
        meds = [{ name: String(rx.medications || '') }];
      }
      meds.forEach((m) => {
        const line = `- ${m.name || 'Médicament'}${m.dosage ? ` ${m.dosage}` : ''}${m.frequency ? ` (${m.frequency})` : ''}`;
        const lines = doc.splitTextToSize(line, 180);
        doc.text(lines, 14, y);
        y += lines.length * 4 + 1;
      });
      if (rx.instructions) {
        const inst = doc.splitTextToSize(`Instructions : ${rx.instructions}`, 180);
        doc.text(inst, 14, y);
        y += inst.length * 4 + 2;
      }
      y += 4;
    });
  }

  y += 6;
  doc.setFontSize(12);
  doc.text('Historique clinique signé', 14, y);
  y += 8;

  const entries = (dossier.entries || []).filter((e) => e.isSigned);
  doc.setFontSize(9);

  if (!entries.length) {
    doc.text('Aucune entrée signée.', 14, y);
  } else {
    entries.forEach((entry) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont(undefined, 'bold');
      doc.text(`${entry.title} — ${new Date(entry.visitDate).toLocaleDateString('fr-FR')}`, 14, y);
      y += 5;
      doc.setFont(undefined, 'normal');
      if (entry.diagnosis) {
        doc.text(`Diagnostic : ${entry.diagnosis}`, 14, y);
        y += 5;
      }
      if (entry.treatment) {
        const lines = doc.splitTextToSize(`Traitement : ${entry.treatment}`, 180);
        doc.text(lines, 14, y);
        y += lines.length * 4 + 2;
      }
      if (entry.isSigned && entry.signer?.name) {
        doc.setTextColor(0, 120, 60);
        doc.text(
          `Signé par ${entry.signer.name} le ${new Date(entry.signedAt).toLocaleString('fr-FR')}`,
          14,
          y
        );
        doc.setTextColor(0);
        y += 5;
      }
      y += 4;
    });
  }

  y = 285;
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(`${COMPANY.address} · ${COMPANY.email}`, 14, y);
  doc.text('Document généré électroniquement — PetfoodTN', 14, y + 4);

  doc.save(`dossier-${dossier.petName}-${dossier.dossierNumber || 'medical'}.pdf`);
};
