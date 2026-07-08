import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dentihub_cabinet/data/dental_database.dart';
import 'package:dentihub_cabinet/data/models.dart';

void main() => runApp(const DentiHubApp());

class DentiHubApp extends StatefulWidget {
  const DentiHubApp({super.key});
  @override
  State<DentiHubApp> createState() => _DentiHubAppState();
}

class _DentiHubAppState extends State<DentiHubApp> {
  ThemeMode _mode = ThemeMode.dark;

  static final _light = ThemeData(
    brightness: Brightness.light,
    useMaterial3: true,
    colorScheme: const ColorScheme.light(primary: Colors.black, onPrimary: Colors.white, secondary: Color(0xFF525252), surface: Colors.white, onSurface: Colors.black),
    scaffoldBackgroundColor: const Color(0xFFFAFAFA),
  );

  static final _dark = ThemeData(
    brightness: Brightness.dark,
    useMaterial3: true,
    colorScheme: const ColorScheme.dark(primary: Colors.white, onPrimary: Colors.black, secondary: Color(0xFFB0B0B0), surface: Color(0xFF141414), onSurface: Colors.white),
    scaffoldBackgroundColor: Colors.black,
  );

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DentiHub — Cabinet dentaire',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: DentiHubHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class DentiHubHome extends StatefulWidget {
  const DentiHubHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<DentiHubHome> createState() => _DentiHubHomeState();
}

class _DentiHubHomeState extends State<DentiHubHome> {
  int _tab = 0;
  final _db = DentalDatabase.instance;
  final _searchCtrl = TextEditingController();
  final _aiInput = TextEditingController();
  final _chatScroll = ScrollController();
  String _query = '';
  bool _loading = true;
  String? _error;
  List<DentalPatient> _patients = [];
  List<DentalConsultation> _consultations = [];
  List<DentalHistory> _history = [];
  List<DentalNotification> _notifications = [];
  List<TreatmentRecommendation> _recommendations = [];
  final List<DentiAiMessage> _chat = [
    DentiAiMessage(role: 'ai', text: 'Bonjour ! Je suis DentiBot 🦷\nPatients, téléconsultation, allergies, recommandations ou historique — demandez-moi.'),
  ];
  bool _aiThinking = false;

  int get _unread => _notifications.where((n) => !n.read).length;
  int get _teleToday => _consultations.where((c) => c.isTele && c.status != 'Annulée').length;
  int get _planned => _consultations.where((c) => c.status == 'Planifiée').length;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final patients = await _db.getPatients(query: _query);
      final consults = await _db.getConsultations();
      final hist = await _db.getHistory();
      final notifs = await _db.getNotifications();
      if (!mounted) return;
      setState(() {
        _patients = patients;
        _consultations = consults;
        _history = hist;
        _notifications = notifs;
        _recommendations = _db.buildRecommendations(patients);
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _addPatient() async {
    final name = TextEditingController();
    final phone = TextEditingController(text: '+216 ');
    final email = TextEditingController();
    final notes = TextEditingController();
    final allergies = TextEditingController(text: 'Aucune');
    final year = TextEditingController(text: '1990');
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouveau patient'),
        content: SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom', border: OutlineInputBorder())),
            const SizedBox(height: 8),
            TextField(controller: phone, decoration: const InputDecoration(labelText: 'Téléphone', border: OutlineInputBorder())),
            const SizedBox(height: 8),
            TextField(controller: email, decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder())),
            const SizedBox(height: 8),
            TextField(controller: year, decoration: const InputDecoration(labelText: 'Année naissance', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            const SizedBox(height: 8),
            TextField(controller: allergies, decoration: const InputDecoration(labelText: 'Allergies', border: OutlineInputBorder())),
            const SizedBox(height: 8),
            TextField(controller: notes, decoration: const InputDecoration(labelText: 'Notes dentaires', border: OutlineInputBorder())),
          ]),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Enregistrer')),
        ],
      ),
    );
    if (ok == true && name.text.isNotEmpty) {
      await _db.insertPatient(DentalPatient(
        name: name.text,
        phone: phone.text,
        email: email.text,
        birthYear: int.tryParse(year.text) ?? 1990,
        notes: notes.text,
        lastVisit: DateFormat('yyyy-MM-dd').format(DateTime.now()),
        allergies: allergies.text,
      ));
      await _db.insertHistory(DentalHistory(
        patientId: 0,
        patientName: name.text,
        action: 'Inscription',
        detail: 'Nouveau dossier patient créé',
        date: DateFormat('yyyy-MM-dd HH:mm').format(DateTime.now()),
      ));
      await _load();
    }
  }

  Future<void> _addConsultation({bool tele = false}) async {
    if (_patients.isEmpty) return;
    var patient = _patients.first;
    final reason = TextEditingController();
    var type = tele ? 'Téléconsultation' : 'Cabinet';
    final date = TextEditingController(text: DateFormat('yyyy-MM-dd HH:mm').format(DateTime.now().add(const Duration(days: 1))));
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Nouvelle consultation'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              DropdownButtonFormField<DentalPatient>(
                initialValue: patient,
                decoration: const InputDecoration(labelText: 'Patient', border: OutlineInputBorder()),
                items: _patients.map((p) => DropdownMenuItem(value: p, child: Text(p.name))).toList(),
                onChanged: (v) => setLocal(() => patient = v ?? patient),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: type,
                decoration: const InputDecoration(labelText: 'Type', border: OutlineInputBorder()),
                items: consultTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                onChanged: (v) => setLocal(() => type = v ?? type),
              ),
              const SizedBox(height: 8),
              TextField(controller: date, decoration: const InputDecoration(labelText: 'Date/heure', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: reason, decoration: const InputDecoration(labelText: 'Motif', border: OutlineInputBorder())),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Planifier')),
          ],
        ),
      ),
    );
    if (ok == true && patient.id != null) {
      await _db.insertConsultation(DentalConsultation(
        patientId: patient.id!,
        patientName: patient.name,
        dateTime: date.text,
        type: type,
        reason: reason.text.isNotEmpty ? reason.text : 'Consultation',
        status: 'Planifiée',
      ));
      await _load();
    }
  }

  Future<void> _startTeleConsult(DentalConsultation c) async {
    setState(() => c.status = 'En cours');
    await _db.updateConsultation(c);
    await _db.insertHistory(DentalHistory(
      patientId: c.patientId,
      patientName: c.patientName,
      action: 'Téléconsultation live',
      detail: 'Session vidéo démarrée — ${c.reason}',
      date: DateFormat('yyyy-MM-dd HH:mm').format(DateTime.now()),
    ));
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Téléconsultation — ${c.patientName}'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.videocam, size: 64),
          const SizedBox(height: 12),
          Text('Session en cours\nMotif : ${c.reason}'),
          const SizedBox(height: 8),
          const Text('(Simulation télémedicine cabinet dentaire)', style: TextStyle(fontSize: 12)),
        ]),
        actions: [
          FilledButton(
            onPressed: () async {
              c.status = 'Terminée';
              await _db.updateConsultation(c);
              if (ctx.mounted) Navigator.pop(ctx);
              await _load();
            },
            child: const Text('Terminer'),
          ),
        ],
      ),
    );
  }

  String _aiReply(String raw) {
    final q = raw.toLowerCase();
    if (q.contains('bonjour') || q.contains('salut')) {
      return '🦷 DentiHub actif\n• ${_patients.length} patients SQLite\n• $_planned RDV planifiés\n• $_teleToday téléconsultations\n• $_unread notifications';
    }
    if (q.contains('patient') || q.contains('dossier')) {
      if (_patients.isEmpty) return 'Aucun patient en base.';
      return '👥 Patients :\n${_patients.take(5).map((p) => '• ${p.name} (${p.age} ans) — ${p.notes.isEmpty ? '—' : p.notes}').join('\n')}';
    }
    if (q.contains('télé') || q.contains('tele') || q.contains('ligne') || q.contains('video')) {
      final tele = _consultations.where((c) => c.isTele && c.status != 'Terminée').toList();
      return tele.isEmpty
          ? 'Aucune téléconsultation ouverte. Planifiez-en une depuis l\'onglet Consultations.'
          : '📹 Téléconsultations :\n${tele.map((c) => '• ${c.patientName} — ${c.dateTime} · ${c.status}').join('\n')}';
    }
    if (q.contains('allerg') || q.contains('latex') || q.contains('pénicilline')) {
      final withA = _patients.where((p) => p.allergies.isNotEmpty && p.allergies.toLowerCase() != 'aucune').toList();
      return withA.isEmpty
          ? 'Aucune allergie signalée.'
          : '⚠️ Allergies :\n${withA.map((p) => '• ${p.name} : ${p.allergies}').join('\n')}';
    }
    if (q.contains('recommand') || q.contains('traitement') || q.contains('conseil')) {
      if (_recommendations.isEmpty) return 'Pas de recommandation pour le moment.';
      return '💡 Recommandations :\n${_recommendations.take(4).map((r) => '• [${r.priority}] ${r.patientName} — ${r.title}\n  ${r.detail}').join('\n\n')}';
    }
    if (q.contains('historique') || q.contains('history')) {
      return _history.isEmpty
          ? 'Historique vide.'
          : '📋 Derniers événements :\n${_history.take(4).map((h) => '• ${h.patientName} — ${h.action} : ${h.detail}').join('\n')}';
    }
    if (q.contains('notif') || q.contains('alerte')) {
      return '🔔 $_unread non lue(s)\n${_notifications.take(3).map((n) => '• ${n.title}').join('\n')}';
    }
    if (q.contains('douleur') || q.contains('mal')) {
      return 'Évaluation douleur :\n1. Localisation (dent/gencive)\n2. Intensité 1–10\n3. Déclencheurs (froid/chaud)\n→ Téléconsultation ou RDV cabinet selon urgence.';
    }
    return 'Essayez : patients, téléconsultation, allergies, recommandations, historique, notifications.';
  }

  Future<void> _sendAi([String? preset]) async {
    final text = (preset ?? _aiInput.text).trim();
    if (text.isEmpty || _aiThinking) return;
    setState(() {
      _chat.add(DentiAiMessage(role: 'user', text: text));
      _aiInput.clear();
      _aiThinking = true;
    });
    await Future<void>.delayed(const Duration(milliseconds: 450));
    if (!mounted) return;
    setState(() {
      _chat.add(DentiAiMessage(role: 'ai', text: _aiReply(text)));
      _aiThinking = false;
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_chatScroll.hasClients) {
        _chatScroll.animateTo(_chatScroll.position.maxScrollExtent, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  Widget _kpi(String label, String value, IconData icon) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, size: 18),
            const SizedBox(height: 6),
            Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text(label, style: Theme.of(context).textTheme.bodySmall),
          ]),
        ),
      ),
    );
  }

  Widget _body() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Padding(padding: const EdgeInsets.all(24), child: Text('Erreur SQLite :\n$_error', textAlign: TextAlign.center)));
    return [
      _dashboardTab(),
      _patientsTab(),
      _consultationsTab(),
      _notificationsTab(),
      _historyTab(),
      _aiTab(),
    ][_tab];
  }

  Widget _dashboardTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Text('Cabinet dentaire · DentiHub', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Row(children: [
          _kpi('Patients', '${_patients.length}', Icons.people_outline),
          _kpi('RDV', '$_planned', Icons.event),
          _kpi('Télé', '$_teleToday', Icons.videocam_outlined),
        ]),
        const SizedBox(height: 4),
        Row(children: [
          _kpi('Alertes', '$_unread', Icons.notifications_outlined),
          _kpi('Historique', '${_history.length}', Icons.history),
          _kpi('Reco.', '${_recommendations.length}', Icons.lightbulb_outline),
        ]),
        const SizedBox(height: 12),
        Card(
          child: ListTile(
            leading: const Icon(Icons.storage),
            title: const Text('Base SQLite patients'),
            subtitle: Text('${_patients.length} dossiers · consultations & historique persistés'),
            trailing: const Icon(Icons.check_circle_outline),
          ),
        ),
        const SizedBox(height: 8),
        Text('Recommandations IA', style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 6),
        ..._recommendations.take(3).map((r) => Card(
          margin: const EdgeInsets.only(bottom: 6),
          child: ListTile(
            leading: Icon(_prioIcon(r.priority)),
            title: Text('${r.patientName} — ${r.title}'),
            subtitle: Text('${r.detail} · ${r.priority}'),
            onTap: () => setState(() => _tab = 5),
          ),
        )),
        const SizedBox(height: 8),
        Wrap(spacing: 8, children: [
          ActionChip(label: const Text('Patients'), avatar: const Icon(Icons.person, size: 18), onPressed: () => setState(() => _tab = 1)),
          ActionChip(label: const Text('Téléconsultation'), avatar: const Icon(Icons.videocam, size: 18), onPressed: () => _addConsultation(tele: true)),
          ActionChip(label: const Text('DentiBot'), avatar: const Icon(Icons.smart_toy, size: 18), onPressed: () => setState(() => _tab = 5)),
        ]),
      ],
    );
  }

  IconData _prioIcon(String p) => switch (p) {
        'Critique' => Icons.error_outline,
        'Haute' => Icons.priority_high,
        'Moyenne' => Icons.info_outline,
        _ => Icons.tips_and_updates_outlined,
      };

  Widget _patientsTab() {
    return Column(children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
        child: TextField(
          controller: _searchCtrl,
          decoration: InputDecoration(
            hintText: 'Rechercher patient…',
            prefixIcon: const Icon(Icons.search),
            border: const OutlineInputBorder(),
            suffixIcon: _query.isEmpty ? null : IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchCtrl.clear(); _query = ''; _load(); }),
          ),
          onChanged: (v) { _query = v; _load(); },
        ),
      ),
      Expanded(
        child: ListView.builder(
          padding: const EdgeInsets.all(12),
          itemCount: _patients.length,
          itemBuilder: (ctx, i) {
            final p = _patients[i];
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('${p.age} ans · ${p.phone}\n${p.notes}\nAllergie : ${p.allergies} · Dernière visite ${p.lastVisit}'),
                isThreeLine: true,
                trailing: IconButton(icon: const Icon(Icons.delete_outline), onPressed: () async {
                  if (p.id != null) { await _db.deletePatient(p.id!); await _load(); }
                }),
                onTap: () => _addConsultation(),
              ),
            );
          },
        ),
      ),
    ]);
  }

  Widget _consultationsTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Total', '${_consultations.length}', Icons.calendar_month),
          _kpi('Télé', '${_consultations.where((c) => c.isTele).length}', Icons.videocam),
          _kpi('Planifiées', '$_planned', Icons.schedule),
        ]),
        const SizedBox(height: 8),
        FilledButton.icon(onPressed: () => _addConsultation(tele: true), icon: const Icon(Icons.videocam), label: const Text('Nouvelle téléconsultation')),
        const SizedBox(height: 8),
        ..._consultations.map((c) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Icon(c.isTele ? Icons.videocam : Icons.medical_services_outlined),
                const SizedBox(width: 8),
                Expanded(child: Text(c.patientName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
                Chip(label: Text(c.status), visualDensity: VisualDensity.compact),
              ]),
              Text('${c.type} · ${c.dateTime}'),
              Text(c.reason),
              const SizedBox(height: 8),
              Wrap(spacing: 8, children: [
                if (c.isTele && c.status == 'Planifiée')
                  FilledButton.tonal(onPressed: () => _startTeleConsult(c), child: const Text('Démarrer vidéo')),
                OutlinedButton(
                  onPressed: () async {
                    final i = consultStatuses.indexOf(c.status);
                    c.status = consultStatuses[(i + 1) % consultStatuses.length];
                    await _db.updateConsultation(c);
                    await _load();
                  },
                  child: const Text('Statut →'),
                ),
              ]),
            ]),
          ),
        )),
      ],
    );
  }

  Widget _notificationsTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Non lues', '$_unread', Icons.mark_email_unread_outlined),
          _kpi('Total', '${_notifications.length}', Icons.notifications),
        ]),
        const SizedBox(height: 8),
        ..._notifications.map((n) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          color: n.read ? null : Theme.of(context).colorScheme.surfaceContainerHighest,
          child: ListTile(
            leading: CircleAvatar(child: Icon(_notifIcon(n.type), size: 18)),
            title: Text(n.title, style: TextStyle(fontWeight: n.read ? FontWeight.normal : FontWeight.bold)),
            subtitle: Text('${n.body}\n${n.type} · ${n.createdAt}'),
            isThreeLine: true,
            onTap: () async {
              if (n.id != null) { await _db.markNotificationRead(n.id!); await _load(); }
            },
            trailing: IconButton(icon: const Icon(Icons.close), onPressed: () async {
              if (n.id != null) { await _db.deleteNotification(n.id!); await _load(); }
            }),
          ),
        )),
      ],
    );
  }

  IconData _notifIcon(String type) => switch (type) {
        'Téléconsultation' => Icons.videocam,
        'Allergie' => Icons.warning_amber,
        'Suivi' => Icons.event_repeat,
        _ => Icons.notifications,
      };

  Widget _historyTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Text('Historique cabinet', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        ..._history.map((h) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: const Icon(Icons.history),
            title: Text('${h.patientName} — ${h.action}', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('${h.detail}\n${h.date}'),
            isThreeLine: true,
          ),
        )),
      ],
    );
  }

  Widget _aiTab() {
    final chips = ['Patients', 'Téléconsultation', 'Allergies', 'Recommandations', 'Historique', 'Notifications'];
    return Column(children: [
      if (_recommendations.isNotEmpty)
        SizedBox(
          height: 110,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            children: _recommendations.map((r) => Card(
              child: Container(
                width: 220,
                padding: const EdgeInsets.all(12),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(r.priority, style: Theme.of(context).textTheme.labelSmall),
                  Text(r.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text(r.patientName, style: Theme.of(context).textTheme.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
                ]),
              ),
            )).toList(),
          ),
        ),
      Expanded(
        child: ListView.builder(
          controller: _chatScroll,
          padding: const EdgeInsets.all(12),
          itemCount: _chat.length + (_aiThinking ? 1 : 0),
          itemBuilder: (ctx, i) {
            if (_aiThinking && i == _chat.length) {
              return const Align(alignment: Alignment.centerLeft, child: Padding(padding: EdgeInsets.all(8), child: Text('DentiBot réfléchit…')));
            }
            final m = _chat[i];
            final isUser = m.role == 'user';
            return Align(
              alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
                decoration: BoxDecoration(
                  color: isUser ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(m.text, style: TextStyle(color: isUser ? Theme.of(context).colorScheme.onPrimary : null)),
              ),
            );
          },
        ),
      ),
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Row(children: chips.map((c) => Padding(
          padding: const EdgeInsets.only(right: 6),
          child: ActionChip(label: Text(c), onPressed: () => _sendAi(c)),
        )).toList()),
      ),
      Padding(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
        child: Row(children: [
          Expanded(child: TextField(controller: _aiInput, decoration: const InputDecoration(hintText: 'Demandez à DentiBot…', border: OutlineInputBorder()), onSubmitted: (_) => _sendAi())),
          const SizedBox(width: 8),
          FilledButton(onPressed: _aiThinking ? null : () => _sendAi(), child: const Icon(Icons.send)),
        ]),
      ),
    ]);
  }

  void _fab() {
    switch (_tab) {
      case 1:
        _addPatient();
      case 2:
        _addConsultation(tele: _tab == 2);
      case 5:
        _sendAi('Recommandations');
      default:
        _addConsultation(tele: true);
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _aiInput.dispose();
    _chatScroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🦷 DentiHub'),
        actions: [
          if (_unread > 0)
            IconButton(
              onPressed: () => setState(() => _tab = 3),
              icon: Badge(label: Text('$_unread'), child: const Icon(Icons.notifications_outlined)),
            ),
          IconButton(tooltip: 'Actualiser', onPressed: _load, icon: const Icon(Icons.refresh)),
          IconButton(
            tooltip: widget.isDark ? 'Mode clair' : 'Mode sombre',
            onPressed: widget.onToggleTheme,
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
          ),
        ],
      ),
      body: _body(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _fab,
        icon: Icon(_tab == 1 ? Icons.person_add : _tab == 2 ? Icons.videocam : Icons.smart_toy),
        label: Text(_tab == 1 ? 'Patient' : _tab == 2 ? 'Consultation' : _tab == 5 ? 'Reco IA' : 'Téléconsult.'),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: [
          const NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          const NavigationDestination(icon: Icon(Icons.people_outline), selectedIcon: Icon(Icons.people), label: 'Patients'),
          const NavigationDestination(icon: Icon(Icons.videocam_outlined), selectedIcon: Icon(Icons.videocam), label: 'Consult.'),
          NavigationDestination(
            icon: Badge(isLabelVisible: _unread > 0, label: Text('$_unread'), child: const Icon(Icons.notifications_outlined)),
            selectedIcon: const Icon(Icons.notifications),
            label: 'Alertes',
          ),
          const NavigationDestination(icon: Icon(Icons.history), label: 'Historique'),
          const NavigationDestination(icon: Icon(Icons.smart_toy_outlined), selectedIcon: Icon(Icons.smart_toy), label: 'IA'),
        ],
      ),
    );
  }
}
