import 'package:flutter/material.dart';
import 'package:trailhub_excursions/data/demo_data.dart';

void main() => runApp(const TrailHubApp());

class TrailHubApp extends StatefulWidget {
  const TrailHubApp({super.key});
  @override
  State<TrailHubApp> createState() => _TrailHubAppState();
}

class _TrailHubAppState extends State<TrailHubApp> {
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
      title: 'TrailHub — Randonnées & excursions',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: TrailHubHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class TrailHubHome extends StatefulWidget {
  const TrailHubHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<TrailHubHome> createState() => _TrailHubHomeState();
}

class _TrailHubHomeState extends State<TrailHubHome> {
  int _tab = 0;
  int _excSeq = 502;
  final List<TrailHike> _hikes = List.of(initialHikes);
  final List<TrailExcursion> _excursions = List.of(initialExcursions);

  int get _openHikes => _hikes.where((h) => h.status == 'Ouvert').length;
  int get _openExcursions => _excursions.where((e) => e.status == 'Ouvert').length;
  int get _totalParticipants => _hikes.fold(0, (s, h) => s + h.participants) + _excursions.fold(0, (s, e) => s + e.spots);

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

  void _addHike() async {
    final name = TextEditingController();
    final region = TextEditingController();
    final guide = TextEditingController();
    final ok = await _dialog('Nouvelle randonnée', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Parcours')),
      TextField(controller: region, decoration: const InputDecoration(labelText: 'Région')),
      TextField(controller: guide, decoration: const InputDecoration(labelText: 'Guide')),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _hikes.insert(0, TrailHike(
        name: name.text,
        region: region.text.isNotEmpty ? region.text : 'Tunisie',
        difficulty: 'Moyen',
        duration: '5h',
        guide: guide.text.isNotEmpty ? guide.text : 'Guide',
        maxParticipants: 15,
        participants: 0,
        status: 'Ouvert',
      )));
    }
  }

  void _addExcursion() async {
    final title = TextEditingController();
    final dest = TextEditingController();
    final price = TextEditingController(text: '150');
    final ok = await _dialog('Nouvelle excursion', [
      TextField(controller: title, decoration: const InputDecoration(labelText: 'Titre')),
      TextField(controller: dest, decoration: const InputDecoration(labelText: 'Destination')),
      TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && title.text.isNotEmpty) {
      setState(() => _excursions.insert(0, TrailExcursion(
        id: 'EX-${_excSeq++}',
        title: title.text,
        destination: dest.text,
        date: 'À planifier',
        price: int.tryParse(price.text) ?? 150,
        guide: 'Guide',
        spots: 0,
        maxSpots: 15,
        status: 'Ouvert',
      )));
    }
  }

  void _joinHike(TrailHike h) {
    if (h.participants < h.maxParticipants && h.status == 'Ouvert') {
      setState(() {
        h.participants++;
        if (h.participants >= h.maxParticipants) h.status = 'Complet';
      });
    }
  }

  void _joinExcursion(TrailExcursion e) {
    if (e.spots < e.maxSpots && e.status == 'Ouvert') {
      setState(() {
        e.spots++;
        if (e.spots >= e.maxSpots) e.status = 'Complet';
      });
    }
  }

  void _cycleHike(TrailHike h) {
    final i = hikeStatuses.indexOf(h.status);
    setState(() => h.status = hikeStatuses[(i + 1) % hikeStatuses.length]);
  }

  void _cycleExcursion(TrailExcursion e) {
    final i = excursionStatuses.indexOf(e.status);
    setState(() => e.status = excursionStatuses[(i + 1) % excursionStatuses.length]);
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
        return _addExcursion;
      case 1:
        return _addHike;
      case 2:
        return _addExcursion;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🥾 TrailHub'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: FloatingActionButton(onPressed: _fabAction, child: const Icon(Icons.add)),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.all(16), children: [
            Text('Randonnées & excursions', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Randonnées ouvertes', value: '$_openHikes'),
                _Kpi(label: 'Excursions ouvertes', value: '$_openExcursions'),
                _Kpi(label: 'Participants', value: '$_totalParticipants'),
                _Kpi(label: 'Activités', value: '${_hikes.length + _excursions.length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Prochaines excursions', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._excursions.where((e) => e.status == 'Ouvert').take(3).map((e) => Card(child: ListTile(
              leading: const Text('🚌', style: TextStyle(fontSize: 24)),
              title: Text(e.title),
              subtitle: Text('${e.destination} · ${e.date}'),
              trailing: Text('${e.price} DT'),
            ))),
            const SizedBox(height: 12),
            const Text('Randonnées populaires', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._hikes.where((h) => h.status == 'Ouvert').take(2).map((h) => Card(child: ListTile(
              leading: const Text('🥾', style: TextStyle(fontSize: 24)),
              title: Text(h.name),
              subtitle: Text('${h.region} · ${h.difficulty} · ${h.duration}'),
              trailing: Text('${h.participants}/${h.maxParticipants}'),
            ))),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _hikes.map((h) => Card(
            child: ListTile(
              leading: const Text('🥾', style: TextStyle(fontSize: 28)),
              title: Text(h.name),
              subtitle: Text('${h.region} · ${h.difficulty} · ${h.duration}\nGuide : ${h.guide}'),
              isThreeLine: true,
              onTap: () => _cycleHike(h),
              onLongPress: () => _joinHike(h),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${h.participants}/${h.maxParticipants}', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(h.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _excursions.map((e) => Card(
            child: ListTile(
              leading: const Text('🚌', style: TextStyle(fontSize: 28)),
              title: Text('${e.id} — ${e.title}'),
              subtitle: Text('${e.destination} · ${e.date}\nGuide : ${e.guide}'),
              isThreeLine: true,
              onTap: () => _cycleExcursion(e),
              onLongPress: () => _joinExcursion(e),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${e.price} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text('${e.spots}/${e.maxSpots}', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Accueil'),
          NavigationDestination(icon: Icon(Icons.hiking_outlined), label: 'Randonnées'),
          NavigationDestination(icon: Icon(Icons.tour_outlined), label: 'Excursions'),
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
