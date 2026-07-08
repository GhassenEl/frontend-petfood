class LexLawyer {
  LexLawyer({
    required this.name,
    required this.specialty,
    required this.barId,
    required this.cases,
    required this.status,
  });
  final String name;
  final String specialty;
  final String barId;
  int cases;
  String status;
}

class LexAppointment {
  LexAppointment({
    required this.id,
    required this.client,
    required this.lawyer,
    required this.type,
    required this.date,
    required this.status,
  });
  final String id;
  final String client;
  final String lawyer;
  final String type;
  final String date;
  String status;
}

class LexHearing {
  LexHearing({
    required this.id,
    required this.caseTitle,
    required this.court,
    required this.lawyer,
    required this.date,
    required this.status,
  });
  final String id;
  final String caseTitle;
  final String court;
  final String lawyer;
  final String date;
  String status;
}

class LexSecretaryTask {
  LexSecretaryTask({
    required this.id,
    required this.task,
    required this.assignedTo,
    required this.priority,
    required this.status,
  });
  final String id;
  final String task;
  final String assignedTo;
  final String priority;
  String status;
}

class LexAiMessage {
  LexAiMessage({required this.role, required this.text});
  final String role;
  final String text;
}

final initialLawyers = <LexLawyer>[
  LexLawyer(name: 'Me. Amira Ben Salah', specialty: 'Droit des affaires', barId: 'TN-2841', cases: 18, status: 'Disponible'),
  LexLawyer(name: 'Me. Karim Trabelsi', specialty: 'Droit pénal', barId: 'TN-1902', cases: 12, status: 'En audience'),
  LexLawyer(name: 'Me. Salma Gharbi', specialty: 'Droit de la famille', barId: 'TN-3105', cases: 22, status: 'Disponible'),
  LexLawyer(name: 'Me. Youssef Jebali', specialty: 'Droit du travail', barId: 'TN-2250', cases: 9, status: 'En consultation'),
];

final initialAppointments = <LexAppointment>[
  LexAppointment(id: 'RDV-601', client: 'Société Alpha SARL', lawyer: 'Me. Amira Ben Salah', type: 'Consultation', date: '18/06 10h', status: 'Confirmé'),
  LexAppointment(id: 'RDV-600', client: 'M. Hichem M.', lawyer: 'Me. Karim Trabelsi', type: 'Première audience', date: '18/06 14h30', status: 'Confirmé'),
  LexAppointment(id: 'RDV-599', client: 'Mme Fatma K.', lawyer: 'Me. Salma Gharbi', type: 'Divorce', date: '19/06 09h', status: 'En attente'),
  LexAppointment(id: 'RDV-598', client: 'Entreprise Beta', lawyer: 'Me. Youssef Jebali', type: 'Licenciement', date: '20/06 11h', status: 'Confirmé'),
];

final initialHearings = <LexHearing>[
  LexHearing(id: 'AUD-401', caseTitle: 'Alpha vs Beta — litige commercial', court: 'Tribunal Tunis 1', lawyer: 'Me. Amira Ben Salah', date: '22/06 08h30', status: 'Programmée'),
  LexHearing(id: 'AUD-400', caseTitle: 'État vs M. Hichem M.', court: 'Tribunal pénal Tunis', lawyer: 'Me. Karim Trabelsi', date: '21/06 09h', status: 'Programmée'),
  LexHearing(id: 'AUD-399', caseTitle: 'Garde enfants — K. vs R.', court: 'Tribunal famille Ariana', lawyer: 'Me. Salma Gharbi', date: '25/06 14h', status: 'Reportée'),
  LexHearing(id: 'AUD-398', caseTitle: 'Licenciement abusif', court: 'Tribunal travail Ben Arous', lawyer: 'Me. Youssef Jebali', date: '19/06 10h', status: 'Tenue'),
];

final initialSecretaryTasks = <LexSecretaryTask>[
  LexSecretaryTask(id: 'SEC-301', task: 'Préparer dossier Alpha — pièces jointes', assignedTo: 'Secrétaire Ines', priority: 'Haute', status: 'En cours'),
  LexSecretaryTask(id: 'SEC-300', task: 'Confirmer RDV clients du 19/06', assignedTo: 'Secrétaire Omar', priority: 'Normale', status: 'À faire'),
  LexSecretaryTask(id: 'SEC-299', task: 'Envoyer convocations tribunal AUD-401', assignedTo: 'Secrétaire Ines', priority: 'Haute', status: 'Terminée'),
  LexSecretaryTask(id: 'SEC-298', task: 'Archiver jugements juin', assignedTo: 'Secrétaire Omar', priority: 'Basse', status: 'À faire'),
];

const lawyerStatuses = ['Disponible', 'En consultation', 'En audience', 'Absent'];
const rdvStatuses = ['En attente', 'Confirmé', 'Annulé', 'Terminé'];
const hearingStatuses = ['Programmée', 'Tenue', 'Reportée', 'Annulée'];
const taskStatuses = ['À faire', 'En cours', 'Terminée', 'Urgent'];

String lexAiReply(String input, List<LexLawyer> lawyers, List<LexAppointment> rdvs, List<LexHearing> hearings) {
  final q = input.toLowerCase().trim();
  if (q.isEmpty) return 'Posez une question sur un dossier, un RDV ou une audience.';
  if (q.contains('bonjour') || q.contains('salut')) {
    return 'Bonjour, je suis LexBot ⚖️\nJe peux résumer l\'agenda, suggérer des actions secrétariat ou lister les audiences du jour.';
  }
  if (q.contains('rdv') || q.contains('rendez') || q.contains('agenda')) {
    final list = rdvs.where((r) => r.status == 'Confirmé' || r.status == 'En attente').take(4);
    return 'Prochains RDV :\n${list.map((r) => '• ${r.id} — ${r.client} (${r.date})').join('\n')}';
  }
  if (q.contains('tribunal') || q.contains('audience')) {
    final list = hearings.where((h) => h.status == 'Programmée').take(4);
    return 'Audiences programmées :\n${list.map((h) => '• ${h.caseTitle}\n  ${h.court} — ${h.date}').join('\n')}';
  }
  if (q.contains('avocat') || q.contains('disponible')) {
    final avail = lawyers.where((l) => l.status == 'Disponible');
    return 'Avocats disponibles :\n${avail.map((l) => '• ${l.name} — ${l.specialty}').join('\n')}';
  }
  if (q.contains('secrét') || q.contains('secret') || q.contains('tâche')) {
    return 'Tâches secrétariat suggérées :\n• Vérifier pièces dossiers du jour\n• Confirmer convocations tribunal\n• Mettre à jour statuts RDV en attente';
  }
  if (q.contains('divorce') || q.contains('pénal') || q.contains('travail') || q.contains('affaires')) {
    final spec = q.contains('divorce') ? 'famille' : q.contains('pénal') ? 'pénal' : q.contains('travail') ? 'travail' : 'affaires';
    final match = lawyers.where((l) => l.specialty.toLowerCase().contains(spec)).firstOrNull;
    if (match != null) return 'Pour ce domaine, je recommande ${match.name} (${match.specialty}). Souhaitez-vous planifier un RDV ?';
  }
  return 'Je peux vous aider sur : agenda RDV, audiences tribunal, avocats disponibles, tâches secrétariat. Précisez votre demande.';
}
