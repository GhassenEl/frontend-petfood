import 'package:flutter/material.dart';
import 'package:linguahub_center/data/demo_data.dart';

void main() => runApp(const LinguaHubApp());

class LinguaHubApp extends StatefulWidget {
  const LinguaHubApp({super.key});
  @override
  State<LinguaHubApp> createState() => _LinguaHubAppState();
}

class _LinguaHubAppState extends State<LinguaHubApp> {
  ThemeMode _mode = ThemeMode.light;

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
      title: 'LinguaHub — Centre de langues',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: LinguaHubHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class LinguaHubHome extends StatefulWidget {
  const LinguaHubHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<LinguaHubHome> createState() => _LinguaHubHomeState();
}

class _LinguaHubHomeState extends State<LinguaHubHome> {
  int _tab = 0;
  String _search = '';
  final List<LanguageCourse> _courses = List.of(initialCourses);
  final List<LanguageStudent> _students = List.of(initialStudents);
  final List<ClassSession> _sessions = List.of(initialSessions);
  final List<LanguageTeacher> _teachers = List.of(initialTeachers);

  int get _activeStudents => _students.where((s) => s.status == 'En cours' || s.status == 'Débutant').length;
  int get _todaySessions => _sessions.length;
  int get _languages => _courses.map((c) => c.language).toSet().length;

  void _addCourse() async {
    final language = TextEditingController();
    final level = TextEditingController(text: 'A1');
    final price = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouveau cours'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: language, decoration: const InputDecoration(labelText: 'Langue')),
          TextField(controller: level, decoration: const InputDecoration(labelText: 'Niveau (A1, B1…)')),
          TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix DT'), keyboardType: TextInputType.number),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Ajouter')),
        ],
      ),
    );
    if (ok == true && language.text.isNotEmpty) {
      setState(() => _courses.add(LanguageCourse(
        language: language.text,
        level: level.text,
        durationWeeks: 8,
        price: int.tryParse(price.text) ?? 600,
        mode: 'Présentiel',
      )));
    }
  }

  void _addStudent() async {
    final name = TextEditingController();
    final language = TextEditingController(text: 'Anglais');
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouvel étudiant'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
          TextField(controller: language, decoration: const InputDecoration(labelText: 'Langue')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Inscrire')),
        ],
      ),
    );
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _students.add(LanguageStudent(
        name: name.text,
        language: language.text,
        level: 'A1',
        progress: 0,
        status: 'Débutant',
      )));
    }
  }

  void _addSession() async {
    final language = TextEditingController();
    final teacher = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouvelle séance'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: language, decoration: const InputDecoration(labelText: 'Langue')),
          TextField(controller: teacher, decoration: const InputDecoration(labelText: 'Formateur')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Planifier')),
        ],
      ),
    );
    if (ok == true && language.text.isNotEmpty) {
      setState(() => _sessions.add(ClassSession(
        time: '18:00',
        language: language.text,
        level: 'A1',
        teacher: teacher.text,
        room: 'Salle D',
      )));
    }
  }

  void _addTeacher() async {
    final name = TextEditingController();
    final languages = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouveau formateur'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
          TextField(controller: languages, decoration: const InputDecoration(labelText: 'Langues enseignées')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Ajouter')),
        ],
      ),
    );
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _teachers.add(LanguageTeacher(name: name.text, languages: languages.text, sessionsWeek: 6)));
    }
  }

  void _advanceProgress(LanguageStudent s) {
    if (s.progress < 100) {
      setState(() {
        s.progress = (s.progress + 10).clamp(0, 100);
        if (s.progress >= 100) {
          s.status = 'Certifié';
        } else if (s.status == 'Débutant') {
          s.status = 'En cours';
        }
      });
    }
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
        return _addStudent;
      case 1:
        return _addCourse;
      case 2:
        return _addStudent;
      case 3:
        return _addSession;
      case 4:
        return _addTeacher;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _students.where((s) => s.name.toLowerCase().contains(_search.toLowerCase())).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('🌍 LinguaHub'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: FloatingActionButton(onPressed: _fabAction, child: const Icon(Icons.add)),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.all(16), children: [
            Text('Tableau de bord', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Étudiants actifs', value: '$_activeStudents'),
                _Kpi(label: 'Séances aujourd\'hui', value: '$_todaySessions'),
                _Kpi(label: 'Langues proposées', value: '$_languages'),
                _Kpi(label: 'Formateurs', value: '${_teachers.length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Séances du jour', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._sessions.map((s) => Card(
              child: ListTile(
                title: Text('${s.time} — ${s.language} ${s.level}'),
                subtitle: Text('${s.teacher} · ${s.room}'),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _courses.map((c) => Card(
            child: ListTile(
              leading: Text(_flag(c.language), style: const TextStyle(fontSize: 28)),
              title: Text('${c.language} — ${c.level}'),
              subtitle: Text('${c.durationWeeks} sem. · ${c.mode}'),
              trailing: Text('${c.price} DT', style: const TextStyle(fontWeight: FontWeight.w800)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: [
            TextField(
              decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Rechercher un étudiant…', border: OutlineInputBorder()),
              onChanged: (v) => setState(() => _search = v),
            ),
            const SizedBox(height: 12),
            ...filtered.map((s) => Card(
              child: ListTile(
                title: Text(s.name),
                subtitle: Text('${s.language} ${s.level} · ${s.progress}%'),
                trailing: Text(s.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
                onTap: () => _advanceProgress(s),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _sessions.map((s) => Card(
            child: ListTile(
              leading: Text(_flag(s.language), style: const TextStyle(fontSize: 24)),
              title: Text('${s.time} — ${s.language}'),
              subtitle: Text('Niveau ${s.level} · ${s.teacher}'),
              trailing: Text(s.room, style: const TextStyle(fontSize: 12)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _teachers.map((t) => Card(
            child: ListTile(
              leading: const Icon(Icons.person_outline),
              title: Text(t.name),
              subtitle: Text(t.languages),
              trailing: Text('${t.sessionsWeek} séances/sem.', style: const TextStyle(fontSize: 12)),
            ),
          )).toList()),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.menu_book_outlined), label: 'Cours'),
          NavigationDestination(icon: Icon(Icons.school_outlined), label: 'Étudiants'),
          NavigationDestination(icon: Icon(Icons.calendar_month_outlined), label: 'Planning'),
          NavigationDestination(icon: Icon(Icons.record_voice_over_outlined), label: 'Formateurs'),
        ],
      ),
    );
  }

  String _flag(String language) {
    switch (language.toLowerCase()) {
      case 'anglais':
        return '🇬🇧';
      case 'français':
      case 'francais':
        return '🇫🇷';
      case 'espagnol':
        return '🇪🇸';
      case 'allemand':
        return '🇩🇪';
      case 'italien':
        return '🇮🇹';
      default:
        return '🌍';
    }
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
