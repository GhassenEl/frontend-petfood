import 'package:flutter/material.dart';
import 'package:wildzoo_animals/data/demo_data.dart';

void main() => runApp(const WildZooApp());

class WildZooApp extends StatefulWidget {
  const WildZooApp({super.key});
  @override
  State<WildZooApp> createState() => _WildZooAppState();
}

class _WildZooAppState extends State<WildZooApp> {
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
      title: 'WildZoo — Zoo animaux',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: WildZooHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class WildZooHome extends StatefulWidget {
  const WildZooHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<WildZooHome> createState() => _WildZooHomeState();
}

class _WildZooHomeState extends State<WildZooHome> {
  int _tab = 0;
  int _visitSeq = 302;
  final List<ZooAnimal> _animals = List.of(initialAnimals);
  final List<ZooHabitat> _habitats = List.of(initialHabitats);
  final List<ZooVisit> _visits = List.of(initialVisits);

  int get _visibleAnimals => _animals.where((a) => a.status == 'Visible').length;
  int get _openHabitats => _habitats.where((h) => h.status == 'Ouvert').length;
  int get _activeVisits => _visits.where((v) => v.status != 'Annulé').length;
  int get _revenue => _visits.where((v) => v.status != 'Annulé').fold(0, (s, v) => s + v.price);

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

  void _addAnimal() async {
    final name = TextEditingController();
    final species = TextEditingController();
    final habitat = TextEditingController();
    final ok = await _dialog('Nouvel animal', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: species, decoration: const InputDecoration(labelText: 'Espèce')),
      TextField(controller: habitat, decoration: const InputDecoration(labelText: 'Habitat')),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _animals.add(ZooAnimal(
        name: name.text,
        species: species.text.isNotEmpty ? species.text : 'Espèce',
        habitat: habitat.text.isNotEmpty ? habitat.text : 'Général',
        age: 1,
        status: 'Visible',
        emoji: '🐾',
      )));
    }
  }

  void _addHabitat() async {
    final name = TextEditingController();
    final zone = TextEditingController();
    final ok = await _dialog('Nouvel habitat', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: zone, decoration: const InputDecoration(labelText: 'Zone')),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _habitats.add(ZooHabitat(
        name: name.text,
        zone: zone.text.isNotEmpty ? zone.text : 'Zone X',
        capacity: 10,
        animals: 0,
        status: 'Ouvert',
      )));
    }
  }

  void _addVisit() async {
    final visitor = TextEditingController();
    final type = TextEditingController(text: 'Adulte');
    final price = TextEditingController(text: '18');
    final ok = await _dialog('Nouvelle visite', [
      TextField(controller: visitor, decoration: const InputDecoration(labelText: 'Visiteur')),
      TextField(controller: type, decoration: const InputDecoration(labelText: 'Type billet')),
      TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && visitor.text.isNotEmpty) {
      setState(() => _visits.insert(0, ZooVisit(
        id: 'ZV-${_visitSeq++}',
        visitor: visitor.text,
        ticketType: type.text,
        date: 'Aujourd\'hui',
        price: int.tryParse(price.text) ?? 18,
        status: 'En attente',
      )));
    }
  }

  void _cycleAnimal(ZooAnimal a) {
    final i = animalStatuses.indexOf(a.status);
    setState(() => a.status = animalStatuses[(i + 1) % animalStatuses.length]);
  }

  void _cycleHabitat(ZooHabitat h) {
    final i = habitatStatuses.indexOf(h.status);
    setState(() => h.status = habitatStatuses[(i + 1) % habitatStatuses.length]);
  }

  void _cycleVisit(ZooVisit v) {
    final i = visitStatuses.indexOf(v.status);
    setState(() => v.status = visitStatuses[(i + 1) % visitStatuses.length]);
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 3:
        return _addVisit;
      case 1:
        return _addAnimal;
      case 2:
        return _addHabitat;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🦁 WildZoo'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: FloatingActionButton(onPressed: _fabAction, child: const Icon(Icons.add)),
      ),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: [
            Text('Zoo & animaux', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Animaux visibles', value: '$_visibleAnimals'),
                _Kpi(label: 'Habitats ouverts', value: '$_openHabitats'),
                _Kpi(label: 'Visites', value: '$_activeVisits'),
                _Kpi(label: 'CA billets', value: '$_revenue DT'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Animaux star', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._animals.where((a) => a.status == 'Visible').take(3).map((a) => Card(
              child: ListTile(
                leading: Text(a.emoji, style: const TextStyle(fontSize: 28)),
                title: Text('${a.name} — ${a.species}'),
                subtitle: Text(a.habitat),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: _animals.map((a) => Card(
            child: ListTile(
              leading: Text(a.emoji, style: const TextStyle(fontSize: 32)),
              title: Text(a.name),
              subtitle: Text('${a.species} · ${a.habitat} · ${a.age} ans'),
              onTap: () => _cycleAnimal(a),
              trailing: Text(a.status, style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.secondary)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: _habitats.map((h) => Card(
            child: ListTile(
              leading: const Icon(Icons.landscape_outlined),
              title: Text(h.name),
              subtitle: Text('${h.zone} · ${h.animals}/${h.capacity} animaux'),
              onTap: () => _cycleHabitat(h),
              trailing: Text(h.status, style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.secondary)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: _visits.map((v) => Card(
            child: ListTile(
              leading: const Icon(Icons.confirmation_number_outlined),
              title: Text('${v.id} — ${v.visitor}'),
              subtitle: Text('${v.ticketType} · ${v.date}'),
              onTap: () => _cycleVisit(v),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${v.price} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(v.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
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
            unselectedItemColor: Theme.of(context).colorScheme.secondary,
            showUnselectedLabels: true,
            items: const [
              BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Accueil'),
              BottomNavigationBarItem(icon: Icon(Icons.pets), label: 'Animaux'),
              BottomNavigationBarItem(icon: Icon(Icons.park_outlined), label: 'Habitats'),
              BottomNavigationBarItem(icon: Icon(Icons.confirmation_number_outlined), label: 'Visites'),
            ],
          ),
        ),
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
