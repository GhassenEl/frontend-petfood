import 'package:flutter/material.dart';
import 'package:unicampus_edu/data/demo_data.dart';

void main() => runApp(const UniCampusApp());

class UniCampusApp extends StatefulWidget {
  const UniCampusApp({super.key});
  @override
  State<UniCampusApp> createState() => _UniCampusAppState();
}

class _UniCampusAppState extends State<UniCampusApp> {
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
      title: 'UniCampus — Éducation en ligne',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: UniCampusHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class UniCampusHome extends StatefulWidget {
  const UniCampusHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<UniCampusHome> createState() => _UniCampusHomeState();
}

class _UniCampusHomeState extends State<UniCampusHome> {
  int _tab = 0;
  int _sessionSeq = 702;
  final List<UniProfessor> _profs = List.of(initialProfessors);
  final List<UniStudent> _students = List.of(initialStudents);
  final List<UniSession> _sessions = List.of(initialSessions);

  int get _onlineProfs => _profs.where((p) => p.status == 'En ligne').length;
  int get _activeStudents => _students.where((s) => s.status == 'Actif').length;
  int get _liveSessions => _sessions.where((s) => s.status == 'En cours').length;
  int get _totalEnrolled => _sessions.fold(0, (sum, s) => sum + s.enrolled);

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

  void _addProfessor() async {
    final name = TextEditingController();
    final subject = TextEditingController();
    final dept = TextEditingController();
    final ok = await _dialog('Nouveau professeur', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: subject, decoration: const InputDecoration(labelText: 'Matière')),
      TextField(controller: dept, decoration: const InputDecoration(labelText: 'Département')),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _profs.add(UniProfessor(
        name: name.text,
        department: dept.text.isNotEmpty ? dept.text : 'Général',
        subject: subject.text.isNotEmpty ? subject.text : 'Cours',
        email: '${name.text.split(' ').last.toLowerCase()}@univ.tn',
        courses: 1,
        status: 'En ligne',
      )));
    }
  }

  void _addStudent() async {
    final name = TextEditingController();
    final filiere = TextEditingController();
    final level = TextEditingController(text: 'L1');
    final ok = await _dialog('Nouvel étudiant', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: filiere, decoration: const InputDecoration(labelText: 'Filière')),
      TextField(controller: level, decoration: const InputDecoration(labelText: 'Niveau')),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _students.add(UniStudent(
        name: name.text,
        filiere: filiere.text.isNotEmpty ? filiere.text : 'Général',
        level: level.text,
        email: '${name.text.split(' ').first.toLowerCase()}@etud.univ.tn',
        gpa: 12.0,
        status: 'Actif',
      )));
    }
  }

  void _addSession() async {
    final title = TextEditingController();
    final prof = TextEditingController();
    final date = TextEditingController();
    final ok = await _dialog('Nouvelle session en ligne', [
      TextField(controller: title, decoration: const InputDecoration(labelText: 'Titre du cours')),
      TextField(controller: prof, decoration: const InputDecoration(labelText: 'Professeur')),
      TextField(controller: date, decoration: const InputDecoration(labelText: 'Date & heure')),
    ]);
    if (ok == true && title.text.isNotEmpty) {
      setState(() => _sessions.insert(0, UniSession(
        id: 'SES-${_sessionSeq++}',
        title: title.text,
        professor: prof.text.isNotEmpty ? prof.text : 'À assigner',
        date: date.text,
        mode: 'Visio',
        enrolled: 0,
        status: 'Planifiée',
      )));
    }
  }

  void _cycleProf(UniProfessor p) {
    final i = profStatuses.indexOf(p.status);
    setState(() => p.status = profStatuses[(i + 1) % profStatuses.length]);
  }

  void _cycleStudent(UniStudent s) {
    final i = studentStatuses.indexOf(s.status);
    setState(() => s.status = studentStatuses[(i + 1) % studentStatuses.length]);
  }

  void _cycleSession(UniSession s) {
    final i = sessionStatuses.indexOf(s.status);
    setState(() {
      s.status = sessionStatuses[(i + 1) % sessionStatuses.length];
      if (s.status == 'En cours') s.enrolled += 5;
    });
  }

  void _enrollSession(UniSession s) {
    if (s.enrolled < 100) setState(() => s.enrolled++);
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 3:
        return _addSession;
      case 1:
        return _addProfessor;
      case 2:
        return _addStudent;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🎓 UniCampus'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: FloatingActionButton(onPressed: _fabAction, child: const Icon(Icons.add)),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.all(16), children: [
            Text('Éducation universitaire en ligne', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Profs en ligne', value: '$_onlineProfs'),
                _Kpi(label: 'Étudiants actifs', value: '$_activeStudents'),
                _Kpi(label: 'Sessions live', value: '$_liveSessions'),
                _Kpi(label: 'Inscriptions', value: '$_totalEnrolled'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Sessions en cours', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._sessions.where((s) => s.status == 'En cours' || s.status == 'Planifiée').take(3).map((s) => Card(
              child: ListTile(
                leading: const Icon(Icons.videocam_outlined),
                title: Text(s.title),
                subtitle: Text('${s.professor} · ${s.date} · ${s.mode}'),
                trailing: Text('${s.enrolled} inscrits'),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _profs.map((p) => Card(
            child: ListTile(
              leading: CircleAvatar(child: Text(p.name.replaceAll(RegExp(r'[^A-Z]'), '').isNotEmpty ? p.name.replaceAll(RegExp(r'[^A-Z]'), '')[0] : 'P')),
              title: Text(p.name),
              subtitle: Text('${p.subject} · ${p.department}\n${p.email}'),
              isThreeLine: true,
              onTap: () => _cycleProf(p),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${p.courses} cours', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(p.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _students.map((s) => Card(
            child: ListTile(
              leading: CircleAvatar(child: Text(s.name[0])),
              title: Text(s.name),
              subtitle: Text('${s.filiere} · ${s.level}\n${s.email}'),
              isThreeLine: true,
              onTap: () => _cycleStudent(s),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('Moy: ${s.gpa}', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(s.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _sessions.map((s) => Card(
            child: ListTile(
              leading: Icon(s.mode == 'Visio' ? Icons.video_call_outlined : Icons.laptop_outlined),
              title: Text('${s.id} — ${s.title}'),
              subtitle: Text('${s.professor} · ${s.date} · ${s.mode}'),
              onTap: () => _cycleSession(s),
              onLongPress: () => _enrollSession(s),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${s.enrolled} inscrits', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(s.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.school_outlined), label: 'Profs'),
          NavigationDestination(icon: Icon(Icons.people_outline), label: 'Étudiants'),
          NavigationDestination(icon: Icon(Icons.laptop_mac_outlined), label: 'Sessions'),
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
