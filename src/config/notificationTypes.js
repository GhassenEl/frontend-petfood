/** Types de notifications — libellés et icônes partagés. */

export const NOTIFICATION_TYPE_LABELS = {
  order: 'Commande',
  new_order: 'Nouvelle commande',
  livreur_new_order: 'Nouvelle course',
  livreur_shipped: 'Livraison',
  message: 'Message',
  admin_message: 'Message',
  complaint: 'Réclamation',
  new_complaint: 'Réclamation',
  review: 'Avis',
  new_review: 'Avis client',
  vet_appointment: 'Rendez-vous',
  vet_contact: 'Demande contact',
  vet_consultation: 'Consultation',
  vet_pharmacy_rupture: 'Rupture pharmacie',
  vet_pharmacy_low_stock: 'Stock pharmacie',
  vet_prescription_stock: 'Ordonnance / stock',
  leave_status: 'Congés',
  leave_request: 'Demande congé',
  iot_food_quality: 'Qualité alimentaire IoT',
};

export const NOTIFICATION_ROLE_LABELS = {
  admin: 'Administration',
  client: 'Espace client',
  livreur: 'Espace livreur',
  vet: 'Espace vétérinaire',
};

export const getNotificationIcon = (type) => {
  switch (type) {
    case 'order':
    case 'new_order':
    case 'livreur_new_order':
      return '📦';
    case 'livreur_shipped':
      return '🚚';
    case 'message':
    case 'admin_message':
      return '💬';
    case 'complaint':
    case 'new_complaint':
      return '⚠️';
    case 'review':
    case 'new_review':
      return '⭐';
    case 'vet_appointment':
      return '📅';
    case 'vet_contact':
      return '📩';
    case 'vet_consultation':
      return '🩺';
    case 'vet_pharmacy_rupture':
      return '💊';
    case 'vet_pharmacy_low_stock':
      return '⚠️';
    case 'vet_prescription_stock':
      return '📋';
    case 'leave_status':
    case 'leave_request':
      return '🏖️';
    case 'iot_food_quality':
      return '📷';
    default:
      return '🔔';
  }
};

export const getNotificationTitle = (notification) => {
  const t = notification?.title?.trim();
  if (t) return t;
  return NOTIFICATION_TYPE_LABELS[notification?.type] || 'Notification';
};
