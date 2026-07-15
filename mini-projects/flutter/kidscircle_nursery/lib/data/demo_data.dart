class NurseryChild {
  NurseryChild({
    required this.name,
    required this.age,
    required this.group,
    required this.parent,
    required this.status,
    this.allergy = '',
  });
  final String name;
  final int age;
  final String group;
  final String parent;
  String status;
  final String allergy;
}

class NurseryActivity {
  NurseryActivity({
    required this.id,
    required this.title,
    required this.group,
    required this.time,
    required this.type,
    required this.capacity,
    required this.enrolled,
    required this.status,
  });
  final String id;
  final String title;
  final String group;
  final String time;
  final String type;
  final int capacity;
  int enrolled;
  String status;
}

class NurseryNotification {
  NurseryNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.time,
    required this.type,
    this.read = false,
  });
  final String id;
  final String title;
  final String body;
  final String time;
  final String type;
  bool read;
}

class NurseryHistoryEvent {
  NurseryHistoryEvent({
    required this.id,
    required this.child,
    required this.action,
    required this.detail,
    required this.time,
  });
  final String id;
  final String child;
  final String action;
  final String detail;
  final String time;
}

class KidsAiMessage {
  KidsAiMessage({required this.role, required this.text});
  final String role;
  final String text;
}

final initialChildren = <NurseryChild>[
  NurseryChild(name: 'Yasmine B.', age: 3, group: 'Petits', parent: 'Amira B.', status: 'Présent', allergy: 'Aucune'),
  NurseryChild(name: 'Adam K.', age: 4, group: 'Moyens', parent: 'Karim K.', status: 'Présent', allergy: 'Arachides'),
  NurseryChild(name: 'Lina M.', age: 2, group: 'Bébé', parent: 'Salma M.', status: 'Absent', allergy: 'Lactose'),
  NurseryChild(name: 'Rayan T.', age: 5, group: 'Grands', parent: 'Ines T.', status: 'Présent', allergy: 'Aucune'),
  NurseryChild(name: 'Sara H.', age: 3, group: 'Petits', parent: 'Omar H.', status: 'En retard', allergy: 'Aucune'),
];

final initialActivities = <NurseryActivity>[
  NurseryActivity(id: 'ACT-101', title: 'Peinture digitale', group: 'Petits', time: '09h30', type: 'Créatif', capacity: 12, enrolled: 8, status: 'En cours'),
  NurseryActivity(id: 'ACT-100', title: 'Jeux moteurs', group: 'Moyens', time: '10h15', type: 'Sport', capacity: 15, enrolled: 12, status: 'Planifiée'),
  NurseryActivity(id: 'ACT-099', title: 'Conte musical', group: 'Bébé', time: '11h00', type: 'Éveil', capacity: 10, enrolled: 6, status: 'Planifiée'),
  NurseryActivity(id: 'ACT-098', title: 'Atelier nature', group: 'Grands', time: '14h00', type: 'Découverte', capacity: 14, enrolled: 14, status: 'Complet'),
];

final initialNotifications = <NurseryNotification>[
  NurseryNotification(id: 'N-501', title: 'Repas prêt', body: 'Goûter fruits pour le groupe Petits à 15h.', time: 'Il y a 5 min', type: 'Repas'),
  NurseryNotification(id: 'N-500', title: 'Adam — allergie', body: 'Rappel : pas d\'arachides pour Adam K.', time: 'Il y a 20 min', type: 'Santé', read: true),
  NurseryNotification(id: 'N-499', title: 'Activité peinture', body: 'Début peinture digitale — 8 enfants inscrits.', time: 'Il y a 45 min', type: 'Activité'),
  NurseryNotification(id: 'N-498', title: 'Retard Sara', body: 'Sara H. n\'est pas encore arrivée.', time: 'Il y a 1 h', type: 'Présence'),
];

final initialHistory = <NurseryHistoryEvent>[
  NurseryHistoryEvent(id: 'H-301', child: 'Yasmine B.', action: 'Arrivée', detail: 'Check-in 08h05 · accompagnée par Amira', time: 'Aujourd\'hui 08h05'),
  NurseryHistoryEvent(id: 'H-300', child: 'Adam K.', action: 'Activité', detail: 'Inscription jeux moteurs', time: 'Aujourd\'hui 09h50'),
  NurseryHistoryEvent(id: 'H-299', child: 'Lina M.', action: 'Absence', detail: 'Signalée malade par parent', time: 'Aujourd\'hui 07h40'),
  NurseryHistoryEvent(id: 'H-298', child: 'Rayan T.', action: 'Repas', detail: 'Déjeuner terminé — bien mangé', time: 'Hier 12h30'),
  NurseryHistoryEvent(id: 'H-297', child: 'Sara H.', action: 'Nap', detail: 'Sieste 13h–14h20', time: 'Hier 14h20'),
];

const childStatuses = ['Présent', 'Absent', 'En retard', 'Parti'];
const activityStatuses = ['Planifiée', 'En cours', 'Complet', 'Terminée', 'Annulée'];

String kidsAiReply(
  String input,
  List<NurseryChild> children,
  List<NurseryActivity> activities,
  List<NurseryNotification> notifs,
) {
  final q = input.toLowerCase().trim();
  if (q.isEmpty) return 'Demandez : présence, activités, allergies, idées d\'atelier ou notifications.';
  if (q.contains('bonjour') || q.contains('salut')) {
    return 'Bonjour ! Je suis KidsBot 🧸\nJe vous aide pour la crèche : présences, activités, alertes santé et idées d\'animation.';
  }
  if (q.contains('présen') || q.contains('presence') || q.contains('présent')) {
    final present = children.where((c) => c.status == 'Présent').toList();
    final late = children.where((c) => c.status == 'En retard').toList();
    return 'Présences :\n• Présents : ${present.length}\n• En retard : ${late.map((c) => c.name).join(', ').ifEmpty('aucun')}\n• Absents : ${children.where((c) => c.status == 'Absent').map((c) => c.name).join(', ').ifEmpty('aucun')}';
  }
  if (q.contains('allerg')) {
    final allergic = children.where((c) => c.allergy.isNotEmpty && c.allergy != 'Aucune').toList();
    if (allergic.isEmpty) return 'Aucune allergie signalée.';
    return 'Allergies à surveiller :\n${allergic.map((c) => '• ${c.name} — ${c.allergy}').join('\n')}';
  }
  if (q.contains('activ') || q.contains('atelier') || q.contains('idée')) {
    if (q.contains('idée') || q.contains('sugg')) {
      return 'Idées KidsBot :\n• Atelier pâte à modeler (Petits)\n• Chasse aux couleurs (Moyens)\n• Comptines gestuelles (Bébé)\n• Petit potager (Grands)\n• Yoga pour enfants (tous)';
    }
    final open = activities.where((a) => a.status == 'Planifiée' || a.status == 'En cours').take(4);
    return 'Activités du jour :\n${open.map((a) => '• ${a.title} (${a.group}) — ${a.time} · ${a.status}').join('\n')}';
  }
  if (q.contains('notif') || q.contains('alerte')) {
    final unread = notifs.where((n) => !n.read).toList();
    if (unread.isEmpty) return 'Aucune notification non lue.';
    return 'Notifications non lues :\n${unread.map((n) => '• ${n.title} — ${n.body}').join('\n')}';
  }
  if (q.contains('groupe') || q.contains('bébé') || q.contains('petit') || q.contains('moyen') || q.contains('grand')) {
    String g = 'Petits';
    if (q.contains('bébé') || q.contains('bebe')) g = 'Bébé';
    if (q.contains('moyen')) g = 'Moyens';
    if (q.contains('grand')) g = 'Grands';
    final list = children.where((c) => c.group == g).toList();
    return 'Groupe $g (${list.length}) :\n${list.map((c) => '• ${c.name} · ${c.age} ans · ${c.status}').join('\n')}';
  }
  return 'Je peux aider sur :\n• Présences\n• Allergies\n• Activités / idées d\'atelier\n• Notifications\n• Groupes (Bébé, Petits, Moyens, Grands)';
}

extension _EmptyJoin on String {
  String ifEmpty(String fallback) => isEmpty ? fallback : this;
}
