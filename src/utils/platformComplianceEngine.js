import {
  ALL_PLATFORM_CERTIFICATIONS,
  ISO_CERTIFICATIONS,
  GLOBAL_CERTIFICATIONS,
  ECO_CERTIFICATIONS,
  ENVIRONMENTAL_COMMITMENTS,
} from '../config/platformComplianceCatalog';

const daysUntil = (dateStr) => {
  if (!dateStr || dateStr === 'Permanent') return 999;
  const d = new Date(dateStr);
  return Math.ceil((d - Date.now()) / 86400000);
};

/** Tableau de bord conformité plateforme. */
export const getPlatformComplianceDashboard = () => {
  const all = ALL_PLATFORM_CERTIFICATIONS;
  const verified = all.filter((c) => c.verified);
  const expiringSoon = all.filter((c) => {
    const days = daysUntil(c.validUntil);
    return days > 0 && days <= 90;
  });

  const isoScore = Math.round((ISO_CERTIFICATIONS.filter((c) => c.verified).length / ISO_CERTIFICATIONS.length) * 100);
  const ecoScore = Math.round((ECO_CERTIFICATIONS.filter((c) => c.verified).length / ECO_CERTIFICATIONS.length) * 100);
  const globalScore = Math.round((GLOBAL_CERTIFICATIONS.filter((c) => c.verified).length / GLOBAL_CERTIFICATIONS.length) * 100);
  const overallScore = Math.round((isoScore + ecoScore + globalScore) / 3);

  return {
    overallScore,
    isoScore,
    ecoScore,
    globalScore,
    totalCertifications: all.length,
    verifiedCount: verified.length,
    expiringSoon,
    iso: ISO_CERTIFICATIONS,
    global: GLOBAL_CERTIFICATIONS,
    eco: ECO_CERTIFICATIONS,
    commitments: ENVIRONMENTAL_COMMITMENTS,
    summary: `PetfoodTN : ${verified.length} certifications actives — ISO ${isoScore} % · Environnement ${ecoScore} % · Normes mondiales ${globalScore} %.`,
    lastAudit: '2026-03-01',
    nextAudit: '2026-09-01',
  };
};

export default getPlatformComplianceDashboard;
