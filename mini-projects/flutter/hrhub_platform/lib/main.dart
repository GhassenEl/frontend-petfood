import 'package:flutter/material.dart';
import 'package:hrhub_platform/data/demo_data.dart';

void main() => runApp(const HRHubApp());

class HRHubApp extends StatefulWidget {
  const HRHubApp({super.key});
  @override
  State<HRHubApp> createState() => _HRHubAppState();
}

class _HRHubAppState extends State<HRHubApp> {
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
      title: 'HRHub — Plateforme RH',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: HRHubHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class HRHubHome extends StatefulWidget {
  const HRHubHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<HRHubHome> createState() => _HRHubHomeState();
}

class _HRHubHomeState extends State<HRHubHome> {
  int _tab = 0;
  int _leaveSeq = 305;
  final List<HrEmployee> _employees = List.of(initialEmployees);
  final List<HrLeave> _leaves = List.of(initialLeaves);
  final List<HrJob> _jobs = List.of(initialJobs);

  int get _activeEmployees => _employees.where((e) => e.status == 'Actif').length;
  int get _pendingLeaves => _leaves.where((l) => l.status == 'En attente').length;
  int get _openJobs => _jobs.where((j) => j.status == 'Ouvert' || j.status == 'Entretiens').length;
  int get _payrollTotal => _employees.where((e) => e.status == 'Actif').fold(0, (s, e) => s + e.salary);

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

  void _addEmployee() async {
    final name = TextEditingController();
    final role = TextEditingController();
    final dept = TextEditingController();
    final salary = TextEditingController(text: '3000');
    final ok = await _dialog('Nouvel employé', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: role, decoration: const InputDecoration(labelText: 'Poste')),
      TextField(controller: dept, decoration: const InputDecoration(labelText: 'Département')),
      TextField(controller: salary, decoration: const InputDecoration(labelText: 'Salaire DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _employees.add(HrEmployee(
        name: name.text,
        role: role.text.isNotEmpty ? role.text : 'Collaborateur',
        department: dept.text.isNotEmpty ? dept.text : 'Général',
        email: '${name.text.split(' ').first.toLowerCase()}@hrhub.tn',
        status: 'Actif',
        salary: int.tryParse(salary.text) ?? 3000,
      )));
    }
  }

  void _addLeave() async {
    final employee = TextEditingController();
    final type = TextEditingController(text: 'Annuel');
    final from = TextEditingController();
    final to = TextEditingController();
    final ok = await _dialog('Demande de congé', [
      TextField(controller: employee, decoration: const InputDecoration(labelText: 'Employé')),
      TextField(controller: type, decoration: const InputDecoration(labelText: 'Type')),
      TextField(controller: from, decoration: const InputDecoration(labelText: 'Du (JJ/MM)')),
      TextField(controller: to, decoration: const InputDecoration(labelText: 'Au (JJ/MM)')),
    ]);
    if (ok == true && employee.text.isNotEmpty) {
      setState(() => _leaves.insert(0, HrLeave(
        id: 'LV-${_leaveSeq++}',
        employee: employee.text,
        type: type.text,
        from: from.text,
        to: to.text,
        status: 'En attente',
      )));
    }
  }

  void _addJob() async {
    final title = TextEditingController();
    final dept = TextEditingController();
    final salary = TextEditingController(text: '3000');
    final ok = await _dialog('Nouveau recrutement', [
      TextField(controller: title, decoration: const InputDecoration(labelText: 'Intitulé du poste')),
      TextField(controller: dept, decoration: const InputDecoration(labelText: 'Département')),
      TextField(controller: salary, decoration: const InputDecoration(labelText: 'Salaire DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && title.text.isNotEmpty) {
      setState(() => _jobs.insert(0, HrJob(
        title: title.text,
        department: dept.text.isNotEmpty ? dept.text : 'Général',
        candidates: 0,
        status: 'Ouvert',
        salary: int.tryParse(salary.text) ?? 3000,
      )));
    }
  }

  void _cycleEmployee(HrEmployee e) {
    final i = employeeStatuses.indexOf(e.status);
    setState(() => e.status = employeeStatuses[(i + 1) % employeeStatuses.length]);
  }

  void _cycleLeave(HrLeave l) {
    final i = leaveStatuses.indexOf(l.status);
    setState(() => l.status = leaveStatuses[(i + 1) % leaveStatuses.length]);
  }

  void _cycleJob(HrJob j) {
    final i = jobStatuses.indexOf(j.status);
    setState(() {
      j.status = jobStatuses[(i + 1) % jobStatuses.length];
      if (j.status == 'Entretiens') j.candidates += 1;
    });
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 1:
        return _addEmployee;
      case 2:
        return _addLeave;
      case 3:
        return _addJob;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('👥 HRHub'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: FloatingActionButton(onPressed: _fabAction, child: const Icon(Icons.add)),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.all(16), children: [
            Text('Tableau de bord RH', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Employés actifs', value: '$_activeEmployees'),
                _Kpi(label: 'Masse salariale', value: '$_payrollTotal DT'),
                _Kpi(label: 'Congés en attente', value: '$_pendingLeaves'),
                _Kpi(label: 'Postes ouverts', value: '$_openJobs'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Congés à valider', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._leaves.where((l) => l.status == 'En attente').take(3).map((l) => Card(
              child: ListTile(
                title: Text('${l.id} — ${l.employee}'),
                subtitle: Text('${l.type} · ${l.from} → ${l.to}'),
                trailing: Text(l.status, style: TextStyle(color: Theme.of(context).colorScheme.secondary)),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _employees.map((e) => Card(
            child: ListTile(
              leading: CircleAvatar(child: Text(e.name[0])),
              title: Text(e.name),
              subtitle: Text('${e.role} · ${e.department}\n${e.email}'),
              isThreeLine: true,
              onTap: () => _cycleEmployee(e),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${e.salary} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(e.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _leaves.map((l) => Card(
            child: ListTile(
              leading: const Icon(Icons.beach_access_outlined),
              title: Text('${l.id} — ${l.employee}'),
              subtitle: Text('${l.type} · ${l.from} → ${l.to}'),
              onTap: () => _cycleLeave(l),
              trailing: Text(l.status, style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.secondary)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _jobs.map((j) => Card(
            child: ListTile(
              leading: const Icon(Icons.work_outline),
              title: Text(j.title),
              subtitle: Text('${j.department} · ${j.candidates} candidats'),
              onTap: () => _cycleJob(j),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${j.salary} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(j.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
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
          NavigationDestination(icon: Icon(Icons.people_outline), label: 'Employés'),
          NavigationDestination(icon: Icon(Icons.event_busy_outlined), label: 'Congés'),
          NavigationDestination(icon: Icon(Icons.work_outline), label: 'Recrutement'),
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
