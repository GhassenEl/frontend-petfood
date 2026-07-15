import 'package:flutter/material.dart';
import 'package:lexhub_avocat/data/demo_data.dart';

void main() => runApp(const LexHubApp());

class LexHubApp extends StatefulWidget {
  const LexHubApp({super.key});
  @override
  State<LexHubApp> createState() => _LexHubAppState();
}

class _LexHubAppState extends State<LexHubApp> {
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
      title: 'LexHub — Cabinet avocat',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: LexHubHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class LexHubHome extends StatefulWidget {
  const LexHubHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<LexHubHome> createState() => _LexHubHomeState();
}

class _LexHubHomeState extends State<LexHubHome> {
  int _tab = 0;
  int _rdvSeq = 602;
  int _audSeq = 402;
  int _taskSeq = 302;
  final List<LexLawyer> _lawyers = List.of(initialLawyers);
  final List<LexAppointment> _appointments = List.of(initialAppointments);
  final List<LexHearing> _hearings = List.of(initialHearings);
  final List<LexSecretaryTask> _tasks = List.of(initialSecretaryTasks);
  final List<LexAiMessage> _chat = [
    LexAiMessage(role: 'ai', text: 'Bonjour, je suis LexBot ⚖️\nDemandez : « agenda RDV », « audiences tribunal », « avocats disponibles » ou « tâches secrétariat ».'),
  ];
  final TextEditingController _aiInput = TextEditingController();
  final ScrollController _chatScroll = ScrollController();
  bool _aiThinking = false;

  int get _availableLawyers => _lawyers.where((l) => l.status == 'Disponible').length;
  int get _todayRdv => _appointments.where((a) => a.status == 'Confirmé' || a.status == 'En attente').length;
  int get _upcomingHearings => _hearings.where((h) => h.status == 'Programmée').length;
  int get _pendingTasks => _tasks.where((t) => t.status != 'Terminée').length;

  Future<bool?> _dialog(String title, List<Widget> fields) {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Column(mainAxisSize: MainAxisSize.min, children: fields),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Valider')),
        ],
      ),
    );
  }

  void _addLawyer() async {
    final name = TextEditingController();
    final specialty = TextEditingController();
    final ok = await _dialog('Nouvel avocat', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom (Me. ...)')),
      TextField(controller: specialty, decoration: const InputDecoration(labelText: 'Spécialité')),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _lawyers.add(LexLawyer(
        name: name.text,
        specialty: specialty.text.isNotEmpty ? specialty.text : 'Droit général',
        barId: 'TN-${2000 + _lawyers.length}',
        cases: 0,
        status: 'Disponible',
      )));
    }
  }

  void _addRdv() async {
    final client = TextEditingController();
    final lawyer = TextEditingController();
    final type = TextEditingController(text: 'Consultation');
    final date = TextEditingController();
    final ok = await _dialog('Nouveau RDV', [
      TextField(controller: client, decoration: const InputDecoration(labelText: 'Client')),
      TextField(controller: lawyer, decoration: const InputDecoration(labelText: 'Avocat')),
      TextField(controller: type, decoration: const InputDecoration(labelText: 'Type')),
      TextField(controller: date, decoration: const InputDecoration(labelText: 'Date & heure')),
    ]);
    if (ok == true && client.text.isNotEmpty) {
      setState(() => _appointments.insert(0, LexAppointment(
        id: 'RDV-${_rdvSeq++}',
        client: client.text,
        lawyer: lawyer.text.isNotEmpty ? lawyer.text : 'À assigner',
        type: type.text,
        date: date.text,
        status: 'En attente',
      )));
    }
  }

  void _addHearing() async {
    final title = TextEditingController();
    final court = TextEditingController();
    final lawyer = TextEditingController();
    final date = TextEditingController();
    final ok = await _dialog('Nouvelle audience', [
      TextField(controller: title, decoration: const InputDecoration(labelText: 'Affaire')),
      TextField(controller: court, decoration: const InputDecoration(labelText: 'Tribunal')),
      TextField(controller: lawyer, decoration: const InputDecoration(labelText: 'Avocat')),
      TextField(controller: date, decoration: const InputDecoration(labelText: 'Date & heure')),
    ]);
    if (ok == true && title.text.isNotEmpty) {
      setState(() => _hearings.insert(0, LexHearing(
        id: 'AUD-${_audSeq++}',
        caseTitle: title.text,
        court: court.text.isNotEmpty ? court.text : 'Tribunal Tunis',
        lawyer: lawyer.text.isNotEmpty ? lawyer.text : 'À assigner',
        date: date.text,
        status: 'Programmée',
      )));
    }
  }

  void _addTask() async {
    final task = TextEditingController();
    final assigned = TextEditingController(text: 'Secrétaire');
    final ok = await _dialog('Tâche secrétariat', [
      TextField(controller: task, decoration: const InputDecoration(labelText: 'Tâche')),
      TextField(controller: assigned, decoration: const InputDecoration(labelText: 'Assigné à')),
    ]);
    if (ok == true && task.text.isNotEmpty) {
      setState(() => _tasks.insert(0, LexSecretaryTask(
        id: 'SEC-${_taskSeq++}',
        task: task.text,
        assignedTo: assigned.text,
        priority: 'Normale',
        status: 'À faire',
      )));
    }
  }

  void _cycleLawyer(LexLawyer l) {
    final i = lawyerStatuses.indexOf(l.status);
    setState(() => l.status = lawyerStatuses[(i + 1) % lawyerStatuses.length]);
  }

  void _cycleRdv(LexAppointment a) {
    final i = rdvStatuses.indexOf(a.status);
    setState(() => a.status = rdvStatuses[(i + 1) % rdvStatuses.length]);
  }

  void _cycleHearing(LexHearing h) {
    final i = hearingStatuses.indexOf(h.status);
    setState(() => h.status = hearingStatuses[(i + 1) % hearingStatuses.length]);
  }

  void _cycleTask(LexSecretaryTask t) {
    final i = taskStatuses.indexOf(t.status);
    setState(() => t.status = taskStatuses[(i + 1) % taskStatuses.length]);
  }

  void _sendAi([String? preset]) {
    final text = (preset ?? _aiInput.text).trim();
    if (text.isEmpty || _aiThinking) return;
    _aiInput.clear();
    setState(() {
      _chat.add(LexAiMessage(role: 'user', text: text));
      _aiThinking = true;
    });
    Future.delayed(const Duration(milliseconds: 550), () {
      if (!mounted) return;
      setState(() {
        _chat.add(LexAiMessage(role: 'ai', text: lexAiReply(text, _lawyers, _appointments, _hearings)));
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
        return _addRdv;
      case 1:
        return _addLawyer;
      case 2:
        return _addRdv;
      case 3:
        return _addHearing;
      case 4:
        return _addTask;
      case 5:
        return () => _sendAi('agenda RDV');
      default:
        return null;
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('⚖️ LexHub'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: FloatingActionButton(onPressed: _fabAction, child: Icon(_tab == 5 ? Icons.auto_awesome : Icons.add)),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.all(16), children: [
            Text('Cabinet d\'avocats', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
          children: [
                _Kpi(label: 'Avocats dispo', value: '$_availableLawyers'),
                _Kpi(label: 'RDV actifs', value: '$_todayRdv'),
                _Kpi(label: 'Audiences', value: '$_upcomingHearings'),
                _Kpi(label: 'Tâches secrétariat', value: '$_pendingTasks'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('RDV du jour', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._appointments.take(2).map((a) => Card(child: ListTile(
              leading: const Icon(Icons.event_outlined),
              title: Text('${a.client} — ${a.type}'),
              subtitle: Text('${a.lawyer} · ${a.date}'),
              trailing: Text(a.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
            ))),
            const SizedBox(height: 12),
            const Text('Secrétariat — urgent', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._tasks.where((t) => t.priority == 'Haute' && t.status != 'Terminée').map((t) => Card(child: ListTile(
              leading: const Icon(Icons.assignment_outlined),
              title: Text(t.task),
              subtitle: Text(t.assignedTo),
              trailing: Text(t.status),
            ))),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _lawyers.map((l) => Card(
            child: ListTile(
              leading: const CircleAvatar(child: Icon(Icons.gavel_outlined)),
              title: Text(l.name),
              subtitle: Text('${l.specialty}\nBarreau ${l.barId}'),
              isThreeLine: true,
              onTap: () => _cycleLawyer(l),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${l.cases} dossiers', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(l.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _appointments.map((a) => Card(
            child: ListTile(
              leading: const Icon(Icons.calendar_today_outlined),
              title: Text('${a.id} — ${a.client}'),
              subtitle: Text('${a.type} · ${a.lawyer}\n${a.date}'),
              isThreeLine: true,
              onTap: () => _cycleRdv(a),
              trailing: Text(a.status, style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.secondary)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _hearings.map((h) => Card(
            child: ListTile(
              leading: const Icon(Icons.account_balance_outlined),
              title: Text(h.caseTitle),
              subtitle: Text('${h.court}\n${h.lawyer} · ${h.date}'),
              isThreeLine: true,
              onTap: () => _cycleHearing(h),
              trailing: Text(h.status, style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.secondary)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _tasks.map((t) => Card(
            child: ListTile(
              leading: Icon(t.priority == 'Haute' ? Icons.priority_high : Icons.check_circle_outline),
              title: Text(t.task),
              subtitle: Text('${t.assignedTo} · Priorité ${t.priority}'),
              onTap: () => _cycleTask(t),
              trailing: Text(t.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
            ),
          )).toList()),
          Column(children: [
            Expanded(
              child: ListView.builder(
                controller: _chatScroll,
                padding: const EdgeInsets.all(16),
                itemCount: _chat.length + (_aiThinking ? 1 : 0),
                itemBuilder: (_, i) {
                  if (_aiThinking && i == _chat.length) {
                    return const Padding(padding: EdgeInsets.all(8), child: Text('LexBot analyse…'));
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
                        border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.3)),
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
                ActionChip(label: const Text('RDV'), onPressed: () => _sendAi('agenda RDV')),
                ActionChip(label: const Text('Tribunal'), onPressed: () => _sendAi('audiences tribunal')),
                ActionChip(label: const Text('Avocats'), onPressed: () => _sendAi('avocats disponibles')),
                ActionChip(label: const Text('Secrétariat'), onPressed: () => _sendAi('tâches secrétariat')),
              ]),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: Row(children: [
                Expanded(child: TextField(
                  controller: _aiInput,
                  decoration: const InputDecoration(hintText: 'Demandez à LexBot…', border: OutlineInputBorder()),
                  onSubmitted: (_) => _sendAi(),
                )),
                const SizedBox(width: 8),
                FilledButton(onPressed: () => _sendAi(), child: const Icon(Icons.send)),
              ]),
            ),
          ]),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Accueil'),
          NavigationDestination(icon: Icon(Icons.gavel_outlined), label: 'Avocats'),
          NavigationDestination(icon: Icon(Icons.event_outlined), label: 'RDV'),
          NavigationDestination(icon: Icon(Icons.account_balance_outlined), label: 'Tribunal'),
          NavigationDestination(icon: Icon(Icons.support_agent_outlined), label: 'Secrétariat'),
          NavigationDestination(icon: Icon(Icons.smart_toy_outlined), label: 'IA'),
        ],
      ),
    );
  }
}

class _Kpi extends StatelessWidget {
  const _Kpi({required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) {
    return Card(child: Padding(padding: const EdgeInsets.all(14), child: Column(
      crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(label, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
        const SizedBox(height: 6),
        Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
      ],
    )));
  }
}
