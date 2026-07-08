import 'package:flutter/material.dart';
import 'package:kidscircle_nursery/data/demo_data.dart';

void main() => runApp(const KidsCircleApp());

class KidsCircleApp extends StatefulWidget {
  const KidsCircleApp({super.key});
  @override
  State<KidsCircleApp> createState() => _KidsCircleAppState();
}

class _KidsCircleAppState extends State<KidsCircleApp> {
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
      title: 'KidsCircle — Jardin d\'enfants',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: KidsCircleHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class KidsCircleHome extends StatefulWidget {
  const KidsCircleHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<KidsCircleHome> createState() => _KidsCircleHomeState();
}

class _KidsCircleHomeState extends State<KidsCircleHome> {
  int _tab = 0;
  int _actSeq = 102;
  int _notifSeq = 502;
  int _histSeq = 302;
  final List<NurseryChild> _children = List.of(initialChildren);
  final List<NurseryActivity> _activities = List.of(initialActivities);
  final List<NurseryNotification> _notifications = List.of(initialNotifications);
  final List<NurseryHistoryEvent> _history = List.of(initialHistory);
  final List<KidsAiMessage> _chat = [
    KidsAiMessage(role: 'ai', text: 'Bonjour ! Je suis KidsBot 🧸\nDemandez : présence, allergies, activités, idées d\'atelier ou notifications.'),
  ];
  final TextEditingController _aiInput = TextEditingController();
  final ScrollController _chatScroll = ScrollController();
  bool _aiThinking = false;

  int get _present => _children.where((c) => c.status == 'Présent').length;
  int get _unread => _notifications.where((n) => !n.read).length;
  int get _openActs => _activities.where((a) => a.status == 'Planifiée' || a.status == 'En cours').length;

  Future<bool?> _dialog(String title, List<Widget> fields) {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: fields)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Valider')),
        ],
      ),
    );
  }

  void _pushNotif(String title, String body, String type) {
    _notifications.insert(0, NurseryNotification(
      id: 'N-${_notifSeq++}',
      title: title,
      body: body,
      time: 'À l\'instant',
      type: type,
    ));
  }

  void _pushHistory(String child, String action, String detail) {
    _history.insert(0, NurseryHistoryEvent(
      id: 'H-${_histSeq++}',
      child: child,
      action: action,
      detail: detail,
      time: 'À l\'instant',
    ));
  }

  void _addChild() async {
    final name = TextEditingController();
    final parent = TextEditingController();
    final group = TextEditingController(text: 'Petits');
    final age = TextEditingController(text: '3');
    final ok = await _dialog('Nouvel enfant', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom', border: OutlineInputBorder())),
      const SizedBox(height: 8),
      TextField(controller: parent, decoration: const InputDecoration(labelText: 'Parent', border: OutlineInputBorder())),
      const SizedBox(height: 8),
      TextField(controller: group, decoration: const InputDecoration(labelText: 'Groupe', border: OutlineInputBorder())),
      const SizedBox(height: 8),
      TextField(controller: age, decoration: const InputDecoration(labelText: 'Âge', border: OutlineInputBorder()), keyboardType: TextInputType.number),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() {
        _children.add(NurseryChild(
          name: name.text,
          age: int.tryParse(age.text) ?? 3,
          group: group.text,
          parent: parent.text.isNotEmpty ? parent.text : 'Parent',
          status: 'Présent',
        ));
        _pushNotif('Nouvel enfant', '${name.text} inscrit dans ${group.text}', 'Présence');
        _pushHistory(name.text, 'Inscription', 'Ajouté au groupe ${group.text}');
      });
    }
  }

  void _addActivity() async {
    final title = TextEditingController();
    final group = TextEditingController(text: 'Petits');
    final time = TextEditingController(text: '10h00');
    final ok = await _dialog('Nouvelle activité', [
      TextField(controller: title, decoration: const InputDecoration(labelText: 'Titre', border: OutlineInputBorder())),
      const SizedBox(height: 8),
      TextField(controller: group, decoration: const InputDecoration(labelText: 'Groupe', border: OutlineInputBorder())),
      const SizedBox(height: 8),
      TextField(controller: time, decoration: const InputDecoration(labelText: 'Heure', border: OutlineInputBorder())),
    ]);
    if (ok == true && title.text.isNotEmpty) {
      setState(() {
        _activities.insert(0, NurseryActivity(
          id: 'ACT-${_actSeq++}',
          title: title.text,
          group: group.text,
          time: time.text,
          type: 'Créatif',
          capacity: 12,
          enrolled: 0,
          status: 'Planifiée',
        ));
        _pushNotif('Activité créée', '${title.text} — ${group.text} à ${time.text}', 'Activité');
        _pushHistory('—', 'Activité', 'Création : ${title.text}');
      });
    }
  }

  void _addManualNotif() async {
    final title = TextEditingController();
    final body = TextEditingController();
    final ok = await _dialog('Nouvelle notification', [
      TextField(controller: title, decoration: const InputDecoration(labelText: 'Titre', border: OutlineInputBorder())),
      const SizedBox(height: 8),
      TextField(controller: body, decoration: const InputDecoration(labelText: 'Message', border: OutlineInputBorder())),
    ]);
    if (ok == true && title.text.isNotEmpty) {
      setState(() => _pushNotif(title.text, body.text, 'Info'));
    }
  }

  void _cycleChild(NurseryChild c) {
    final i = childStatuses.indexOf(c.status);
    setState(() {
      c.status = childStatuses[(i + 1) % childStatuses.length];
      _pushHistory(c.name, 'Statut', 'Passé à ${c.status}');
      _pushNotif('Présence — ${c.name}', 'Statut : ${c.status}', 'Présence');
    });
  }

  void _cycleActivity(NurseryActivity a) {
    final i = activityStatuses.indexOf(a.status);
    setState(() {
      a.status = activityStatuses[(i + 1) % activityStatuses.length];
      _pushNotif('Activité — ${a.title}', 'Statut : ${a.status}', 'Activité');
      _pushHistory('—', 'Activité', '${a.title} → ${a.status}');
    });
  }

  void _joinActivity(NurseryActivity a) {
    if (a.enrolled < a.capacity && a.status != 'Complet' && a.status != 'Annulée') {
      setState(() {
        a.enrolled++;
        if (a.enrolled >= a.capacity) a.status = 'Complet';
        _pushHistory('—', 'Inscription', '${a.title} : ${a.enrolled}/${a.capacity}');
      });
    }
  }

  void _markRead(NurseryNotification n) {
    setState(() => n.read = true);
  }

  void _markAllRead() {
    setState(() {
      for (final n in _notifications) {
        n.read = true;
      }
    });
  }

  void _sendAi([String? preset]) {
    final text = (preset ?? _aiInput.text).trim();
    if (text.isEmpty || _aiThinking) return;
    _aiInput.clear();
    setState(() {
      _chat.add(KidsAiMessage(role: 'user', text: text));
      _aiThinking = true;
    });
    Future.delayed(const Duration(milliseconds: 500), () {
      if (!mounted) return;
      setState(() {
        _chat.add(KidsAiMessage(role: 'ai', text: kidsAiReply(text, _children, _activities, _notifications)));
        _aiThinking = false;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_chatScroll.hasClients) {
          _chatScroll.animateTo(_chatScroll.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
        }
      });
    });
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 1:
        return _addChild;
      case 2:
        return _addActivity;
      case 3:
        return _addManualNotif;
      case 4:
        return () => setState(() {
          _pushHistory('—', 'Note', 'Entrée manuelle historique');
        });
      case 5:
        return () => _sendAi('idées d\'atelier');
      default:
        return null;
    }
  }

  IconData get _fabIcon => _tab == 5 ? Icons.auto_awesome : Icons.add;

  Color _childColor(String s) {
    switch (s) {
      case 'Présent':
        return Colors.green;
      case 'Absent':
        return Colors.redAccent;
      case 'En retard':
        return Colors.orange;
      default:
        return Theme.of(context).colorScheme.secondary;
    }
  }

  @override
  void dispose() {
    _aiInput.dispose();
    _chatScroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final secondary = Theme.of(context).colorScheme.secondary;

    return Scaffold(
      appBar: AppBar(
        title: const Text('🧸 KidsCircle'),
        actions: [
          Stack(alignment: Alignment.topRight, children: [
            IconButton(onPressed: () => setState(() => _tab = 3), icon: const Icon(Icons.notifications_outlined)),
            if (_unread > 0)
              Positioned(
                right: 8,
                top: 8,
                child: CircleAvatar(
                  radius: 8,
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  child: Text('$_unread', style: TextStyle(fontSize: 10, color: Theme.of(context).colorScheme.onPrimary)),
                ),
              ),
          ]),
          IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined)),
        ],
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: FloatingActionButton(onPressed: _fabAction, child: Icon(_fabIcon)),
      ),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: [
            Text('Jardin d\'enfants & crèche', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text('Présences · activités · notifications · IA', style: TextStyle(color: secondary)),
            const SizedBox(height: 14),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.5,
              children: [
                _Kpi(label: 'Présents', value: '$_present'),
                _Kpi(label: 'Enfants', value: '${_children.length}'),
                _Kpi(label: 'Activités', value: '$_openActs'),
                _Kpi(label: 'Notifs', value: '$_unread', alert: _unread > 0),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Activités du jour', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._activities.where((a) => a.status == 'Planifiée' || a.status == 'En cours').take(3).map((a) => Card(
              child: ListTile(
                leading: const Icon(Icons.extension_outlined),
                title: Text(a.title),
                subtitle: Text('${a.group} · ${a.time}'),
                trailing: Text(a.status, style: TextStyle(fontSize: 12, color: secondary)),
              ),
            )),
            const SizedBox(height: 12),
            const Text('Dernières alertes', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._notifications.take(2).map((n) => Card(
              child: ListTile(
                leading: Icon(n.read ? Icons.notifications_none : Icons.notifications_active_outlined),
                title: Text(n.title),
                subtitle: Text(n.body),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: _children.map((c) => Card(
            child: ListTile(
              leading: CircleAvatar(child: Text(c.name[0])),
              title: Text(c.name),
              subtitle: Text('${c.group} · ${c.age} ans · ${c.parent}${c.allergy != 'Aucune' ? '\n⚠ ${c.allergy}' : ''}'),
              isThreeLine: c.allergy != 'Aucune',
              onTap: () => _cycleChild(c),
              trailing: Text(c.status, style: TextStyle(fontWeight: FontWeight.w700, color: _childColor(c.status))),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: _activities.map((a) => Card(
            child: ListTile(
              leading: const Icon(Icons.sports_esports_outlined),
              title: Text('${a.id} — ${a.title}'),
              subtitle: Text('${a.type} · ${a.group} · ${a.time}\n${a.enrolled}/${a.capacity} inscrits'),
              isThreeLine: true,
              onTap: () => _cycleActivity(a),
              onLongPress: () => _joinActivity(a),
              trailing: Text(a.status, style: TextStyle(fontSize: 12, color: secondary)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: [
            Row(children: [
              Expanded(child: Text('Notifications', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800))),
              if (_unread > 0) TextButton(onPressed: _markAllRead, child: const Text('Tout lire')),
            ]),
            const SizedBox(height: 8),
            ..._notifications.map((n) => Card(
              color: n.read ? null : Theme.of(context).colorScheme.primary.withValues(alpha: 0.06),
              child: ListTile(
                leading: Icon(_notifIcon(n.type), color: n.read ? secondary : Theme.of(context).colorScheme.primary),
                title: Text(n.title, style: TextStyle(fontWeight: n.read ? FontWeight.w500 : FontWeight.w800)),
                subtitle: Text('${n.body}\n${n.time}'),
                isThreeLine: true,
                onTap: () => _markRead(n),
                trailing: n.read ? null : const Icon(Icons.circle, size: 10),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: [
            Text('Historique', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text('Arrivées, activités, repas, absences…', style: TextStyle(color: secondary, fontSize: 13)),
            const SizedBox(height: 12),
            ..._history.map((h) => Card(
              child: ListTile(
                leading: Icon(_historyIcon(h.action)),
                title: Text('${h.action} — ${h.child}'),
                subtitle: Text('${h.detail}\n${h.time}'),
                isThreeLine: true,
              ),
            )),
          ]),
          Column(children: [
            Expanded(
              child: ListView.builder(
                controller: _chatScroll,
                padding: const EdgeInsets.all(16),
                itemCount: _chat.length + (_aiThinking ? 1 : 0),
                itemBuilder: (context, i) {
                  if (_aiThinking && i == _chat.length) {
                    return const Padding(padding: EdgeInsets.all(8), child: Text('KidsBot réfléchit…'));
                  }
                  final m = _chat[i];
                  final isAi = m.role == 'ai';
                  return Align(
                    alignment: isAi ? Alignment.centerLeft : Alignment.centerRight,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      constraints: const BoxConstraints(maxWidth: 320),
                      decoration: BoxDecoration(
                        color: isAi ? Theme.of(context).colorScheme.surface : Theme.of(context).colorScheme.primary,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: secondary.withValues(alpha: 0.3)),
                      ),
                      child: Text(m.text, style: TextStyle(color: isAi ? Theme.of(context).colorScheme.onSurface : Theme.of(context).colorScheme.onPrimary)),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
              child: Wrap(spacing: 6, runSpacing: 6, children: [
                ActionChip(label: const Text('Présences'), onPressed: () => _sendAi('présences')),
                ActionChip(label: const Text('Allergies'), onPressed: () => _sendAi('allergies')),
                ActionChip(label: const Text('Activités'), onPressed: () => _sendAi('activités')),
                ActionChip(label: const Text('Idées'), onPressed: () => _sendAi('idées atelier')),
                ActionChip(label: const Text('Notifs'), onPressed: () => _sendAi('notifications')),
              ]),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: Row(children: [
                Expanded(child: TextField(
                  controller: _aiInput,
                  decoration: const InputDecoration(hintText: 'Demandez à KidsBot…', border: OutlineInputBorder()),
                  onSubmitted: (_) => _sendAi(),
                )),
                const SizedBox(width: 8),
                FilledButton(onPressed: () => _sendAi(), child: const Icon(Icons.send)),
              ]),
            ),
          ]),
        ],
      ),
      bottomNavigationBar: Material(
        elevation: 12,
        color: Theme.of(context).colorScheme.surface,
        child: SafeArea(
          top: false,
          child: BottomNavigationBar(
            currentIndex: _tab,
            onTap: (i) => setState(() => _tab = i),
            type: BottomNavigationBarType.fixed,
            selectedItemColor: Theme.of(context).colorScheme.primary,
            unselectedItemColor: secondary,
            showUnselectedLabels: true,
            selectedFontSize: 10,
            unselectedFontSize: 9,
            items: [
              const BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Accueil'),
              const BottomNavigationBarItem(icon: Icon(Icons.child_care_outlined), label: 'Enfants'),
              const BottomNavigationBarItem(icon: Icon(Icons.extension_outlined), label: 'Activités'),
              BottomNavigationBarItem(
                icon: Badge(isLabelVisible: _unread > 0, label: Text('$_unread'), child: const Icon(Icons.notifications_outlined)),
                label: 'Notifs',
              ),
              const BottomNavigationBarItem(icon: Icon(Icons.history), label: 'Historique'),
              const BottomNavigationBarItem(icon: Icon(Icons.smart_toy_outlined), label: 'IA'),
            ],
          ),
        ),
      ),
    );
  }

  IconData _notifIcon(String type) {
    switch (type) {
      case 'Santé':
        return Icons.health_and_safety_outlined;
      case 'Repas':
        return Icons.restaurant_outlined;
      case 'Activité':
        return Icons.extension_outlined;
      case 'Présence':
        return Icons.person_outline;
      default:
        return Icons.info_outline;
    }
  }

  IconData _historyIcon(String action) {
    switch (action) {
      case 'Arrivée':
        return Icons.login;
      case 'Absence':
        return Icons.event_busy;
      case 'Activité':
      case 'Inscription':
        return Icons.extension_outlined;
      case 'Repas':
        return Icons.restaurant_outlined;
      case 'Nap':
        return Icons.bedtime_outlined;
      default:
        return Icons.history;
    }
  }
}

class _Kpi extends StatelessWidget {
  const _Kpi({required this.label, required this.value, this.alert = false});
  final String label;
  final String value;
  final bool alert;
  @override
  Widget build(BuildContext context) {
    return Card(child: Padding(padding: const EdgeInsets.all(14), child: Column(
      crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(label, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
        const SizedBox(height: 6),
        Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: alert ? Colors.orange : null)),
      ],
    )));
  }
}
