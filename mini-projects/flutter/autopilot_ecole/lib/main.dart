import 'package:flutter/material.dart';
import 'package:autopilot_ecole/data/demo_data.dart';

void main() => runApp(const AutoPilotApp());

class AutoPilotApp extends StatefulWidget {
  const AutoPilotApp({super.key});
  @override
  State<AutoPilotApp> createState() => _AutoPilotAppState();
}

class _AutoPilotAppState extends State<AutoPilotApp> {
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
      title: 'AutoPilot — Auto-école',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: AutoPilotHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class AutoPilotHome extends StatefulWidget {
  const AutoPilotHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<AutoPilotHome> createState() => _AutoPilotHomeState();
}

class _AutoPilotHomeState extends State<AutoPilotHome> {
  int _tab = 0;
  String _search = '';
  final List<DrivingStudent> _students = List.of(initialStudents);
  final List<DrivingLesson> _lessons = List.of(initialLessonsToday);

  int get _activeStudents => _students.where((s) => s.status == 'En cours' || s.status == 'Débutant').length;

  void _addStudent() async {
    final name = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouvel élève'),
        content: TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom complet')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Ajouter')),
        ],
      ),
    );
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _students.add(DrivingStudent(name: name.text, packageName: 'Permis B — 20h', hoursDone: 0, hoursTotal: 20, status: 'Débutant')));
    }
  }

  void _addHour(DrivingStudent s) {
    if (s.hoursDone < s.hoursTotal) {
      setState(() {
        s.hoursDone++;
        if (s.hoursDone >= s.hoursTotal && s.status == 'En cours') s.status = 'Exam. code';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _students.where((s) => s.name.toLowerCase().contains(_search.toLowerCase())).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('🚗 AutoPilot'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: _tab == 1 ? FloatingActionButton(onPressed: _addStudent, child: const Icon(Icons.person_add)) : null,
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
                _Kpi(label: 'Élèves actifs', value: '$_activeStudents'),
                _Kpi(label: 'Leçons aujourd\'hui', value: '${_lessons.length}'),
                _Kpi(label: 'Total élèves', value: '${_students.length}'),
                _Kpi(label: 'Moniteurs', value: '6'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Leçons aujourd\'hui', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._lessons.map((l) => Card(child: ListTile(title: Text('${l.time} — ${l.student}'), subtitle: Text(l.type), trailing: Text(l.instructor)))),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: [
            TextField(
              decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Rechercher un élève…', border: OutlineInputBorder()),
              onChanged: (v) => setState(() => _search = v),
            ),
            const SizedBox(height: 12),
            ...filtered.map((s) => Card(child: ListTile(
              title: Text(s.name), subtitle: Text('${s.packageName} · ${s.hours}'),
              trailing: Text(s.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              onTap: () => _addHour(s),
            ))),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: weekLessons.entries.map((e) => Card(
            child: Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(e.key, style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.primary)),
              const SizedBox(height: 8),
              ...e.value.map((slot) => Padding(padding: const EdgeInsets.only(bottom: 4), child: Text('• $slot'))),
            ])),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: packages.map((p) => Card(
            shape: p.featured ? RoundedRectangleBorder(side: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2), borderRadius: BorderRadius.circular(12)) : null,
            child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(p.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              Text(p.price, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.primary)),
              const SizedBox(height: 8),
              ...p.features.map((f) => Text('✓ $f')),
            ])),
          )).toList()),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.school_outlined), label: 'Élèves'),
          NavigationDestination(icon: Icon(Icons.calendar_month_outlined), label: 'Planning'),
          NavigationDestination(icon: Icon(Icons.card_membership_outlined), label: 'Formules'),
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
