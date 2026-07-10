import 'package:flutter/material.dart';
import 'package:funpark_attractions/data/demo_data.dart';

void main() => runApp(const FunParkApp());

class FunParkApp extends StatefulWidget {
  const FunParkApp({super.key});
  @override
  State<FunParkApp> createState() => _FunParkAppState();
}

class _FunParkAppState extends State<FunParkApp> {
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
      title: 'FunPark — Parc d\'attractions',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: FunParkHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class FunParkHome extends StatefulWidget {
  const FunParkHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<FunParkHome> createState() => _FunParkHomeState();
}

class _FunParkHomeState extends State<FunParkHome> {
  int _tab = 0;
  final List<ParkAttraction> _attractions = List.of(initialAttractions);
  final List<ParkTicket> _tickets = List.of(initialTickets);
  final List<ParkVisitor> _zones = List.of(initialZones);

  int get _openAttractions => _attractions.where((a) => a.status == 'Ouvert').length;
  int get _totalVisitors => _zones.fold(0, (s, z) => s + z.count);
  int get _ticketsSold => _tickets.fold(0, (s, t) => s + t.sold);

  Future<bool?> _confirmDialog(String title, List<Widget> fields) {
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

  void _addAttraction() async {
    final name = TextEditingController();
    final wait = TextEditingController(text: '10');
    final ok = await _confirmDialog('Nouvelle attraction', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: wait, decoration: const InputDecoration(labelText: 'Attente (min)'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _attractions.add(ParkAttraction(name: name.text, category: 'Nouveau', waitMin: int.tryParse(wait.text) ?? 10, status: 'Ouvert')));
    }
  }

  void _addTicket() async {
    final name = TextEditingController();
    final price = TextEditingController();
    final ok = await _confirmDialog('Nouveau billet', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Type de billet')),
      TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _tickets.add(ParkTicket(name: name.text, price: int.tryParse(price.text) ?? 50, sold: 0)));
    }
  }

  void _cycleAttraction(ParkAttraction a) {
    final i = attractionStatuses.indexOf(a.status);
    setState(() => a.status = attractionStatuses[(i + 1) % attractionStatuses.length]);
  }

  void _sellTicket(ParkTicket t) {
    setState(() {
      t.sold++;
      for (final z in _zones) {
        if (z.count < z.capacity) {
          z.count++;
          break;
        }
      }
    });
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
        return _addTicket;
      case 1:
        return _addAttraction;
      case 2:
        return _addTicket;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🎢 FunPark'),
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
                _Kpi(label: 'Visiteurs parc', value: '$_totalVisitors'),
                _Kpi(label: 'Attractions ouvertes', value: '$_openAttractions'),
                _Kpi(label: 'Billets vendus', value: '$_ticketsSold'),
                _Kpi(label: 'Attractions total', value: '${_attractions.length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Files d\'attente', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._attractions.where((a) => a.status == 'Ouvert').map((a) => Card(
              child: ListTile(title: Text(a.name), subtitle: Text(a.category), trailing: Text('${a.waitMin} min')),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _attractions.map((a) => Card(
            child: ListTile(
              leading: const Text('🎡', style: TextStyle(fontSize: 28)),
              title: Text(a.name),
              subtitle: Text('${a.category} · Attente ${a.waitMin} min'),
              onTap: () => _cycleAttraction(a),
              trailing: Text(a.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _tickets.map((t) => Card(
            child: ListTile(
              title: Text(t.name),
              subtitle: Text('${t.sold} vendus'),
              onTap: () => _sellTicket(t),
              trailing: Text('${t.price} DT', style: const TextStyle(fontWeight: FontWeight.w800)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _zones.map((z) => Card(
            child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(z.zone, style: const TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              LinearProgressIndicator(value: z.count / z.capacity),
              const SizedBox(height: 6),
              Text('${z.count} / ${z.capacity} visiteurs', style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.secondary)),
            ])),
          )).toList()),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.attractions_outlined), label: 'Attractions'),
          NavigationDestination(icon: Icon(Icons.confirmation_number_outlined), label: 'Billets'),
          NavigationDestination(icon: Icon(Icons.groups_outlined), label: 'Affluence'),
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
