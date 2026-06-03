import { jsPDF } from 'jspdf';
import { exportMedicalDossierPdf } from './medicalDossierPdf';

const COMPANY = {
  name: 'PetfoodTN — Rapport clinique vétérinaire',
  address: 'Lac 1, Tunis 1053',
  email: 'contact@petfood.tn',
};

const ensureSpace = (doc, y, need = 20) => {
  if (y > 280 - need) {
    doc.addPage();
    return 20;
  }
  return y;
};

const writeParagraph = (doc, text, x, y, maxWidth = 180) => {
  const lines = doc.splitTextToSize(String(text || '—'), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 4.5 + 2;
};

/**
 * Exporte le rapport clinique complet (consultations + nutrition + dossier résumé).
 */
export const exportVetClinicalReportPdf = (report) => {
  if (!report) return;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = 18;
  const patient = report.patient || {};
  const owner = patient.owner || {};

  doc.setFontSize(15);
  doc.setFont(undefined, 'bold');
  doc.text(COMPANY.name, 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(80);
  doc.text(`Généré le ${new Date(report.generatedAt || Date.now()).toLocaleString('fr-FR')}`, 14, y);
  y += 10;
  doc.setTextColor(0);

  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text(`Patient : ${patient.petName || '—'}`, 14, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  y = writeParagraph(
    doc,
    `Propriétaire : ${owner.name || '—'} · ${owner.email || ''} · ${owner.phone || ''}`,
    14,
    y
  );
  if (report.clinic?.veterinarian) {
    y = writeParagraph(doc, `Vétérinaire : Dr. ${report.clinic.veterinarian}`, 14, y);
  }

  // Consultations
  y = ensureSpace(doc, y, 30);
  y += 4;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Historique des consultations (${(report.consultations || []).length})`, 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');

  const consultations = report.consultations || [];
  if (!consultations.length) {
    y = writeParagraph(doc, 'Aucune consultation enregistrée pour cet animal.', 14, y);
  } else {
    consultations.forEach((c) => {
      y = ensureSpace(doc, y, 25);
      doc.setFont(undefined, 'bold');
      y = writeParagraph(
        doc,
        `${new Date(c.updatedAt || c.createdAt).toLocaleDateString('fr-FR')} — ${c.status || 'consultation'}`,
        14,
        y
      );
      doc.setFont(undefined, 'normal');
      if (c.vet?.name) y = writeParagraph(doc, `Par : Dr. ${c.vet.name}`, 14, y);
      if (c.symptoms) y = writeParagraph(doc, `Symptômes : ${c.symptoms}`, 14, y);
      if (c.clinicalExam) y = writeParagraph(doc, `Examen : ${c.clinicalExam}`, 14, y);
      if (c.diagnosis) y = writeParagraph(doc, `Diagnostic : ${c.diagnosis}`, 14, y);
      if (c.recommendations) y = writeParagraph(doc, `Recommandations : ${c.recommendations}`, 14, y);
      y += 4;
    });
  }

  // Nutrition
  const nutrition = report.nutrition || {};
  y = ensureSpace(doc, y, 35);
  y += 4;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Recommandations nutritionnelles', 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  if (nutrition.summary) y = writeParagraph(doc, nutrition.summary, 14, y);
  const cal = nutrition.calories;
  if (cal?.supported) {
    y = writeParagraph(
      doc,
      `Besoins : ${cal.dailyKcal} kcal/j · ~${cal.dryFoodGramsPerDay} g croquettes/j (${cal.gramsPerMeal} g × ${cal.mealCount} repas)`,
      14,
      y
    );
  }
  (nutrition.nutritionPlans || []).slice(0, 2).forEach((plan) => {
    y = ensureSpace(doc, y, 20);
    y = writeParagraph(
      doc,
      `Plan NutriPro (${new Date(plan.createdAt).toLocaleDateString('fr-FR')}) : ${(plan.planText || '').slice(0, 400)}…`,
      14,
      y
    );
  });
  const food = nutrition.productRecommendations?.food || [];
  if (food.length) {
    y = writeParagraph(
      doc,
      `Produits suggérés : ${food.map((f) => f.name || f.product?.name).filter(Boolean).join(', ')}`,
      14,
      y
    );
  }

  // Dossier résumé
  if (report.dossier) {
    y = ensureSpace(doc, y, 25);
    y += 4;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Dossier médical n° ${report.dossier.dossierNumber || '—'}`, 14, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const signed = (report.dossier.entries || []).filter((e) => e.isSigned);
    if (!signed.length) {
      y = writeParagraph(doc, 'Aucune entrée signée dans le dossier.', 14, y);
    } else {
      signed.slice(0, 15).forEach((entry) => {
        y = ensureSpace(doc, y, 18);
        y = writeParagraph(
          doc,
          `${entry.title} (${new Date(entry.visitDate).toLocaleDateString('fr-FR')}) — ${entry.diagnosis || ''}`,
          14,
          y
        );
      });
    }
  }

  y = ensureSpace(doc, y, 15);
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(`${COMPANY.address} · ${COMPANY.email}`, 14, 285);
  doc.text('Document confidentiel — usage vétérinaire PetfoodTN', 14, 289);

  const safeName = (patient.petName || 'patient').replace(/\s+/g, '-');
  doc.save(`rapport-clinique-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
};

/** Exporte uniquement le dossier médical (wrapper existant). */
export const exportDossierFromReport = (report) => {
  if (report?.dossier) {
    exportMedicalDossierPdf(report.dossier);
    return true;
  }
  return false;
};
