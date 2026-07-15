import 'package:flutter/material.dart';
import 'package:touristhub_center/data/demo_data.dart';

void main() => runApp(const TouristHubApp());

class TouristHubApp extends StatefulWidget {
  const TouristHubApp({super.key});
  @override
  State<TouristHubApp> createState() => _TouristHubAppState();
}

class _TouristHubAppState extends State<TouristHubApp> {
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
      title: 'TouristHub — Centre de tourisme',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: TouristHubHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class TouristHubHome extends StatefulWidget {
  const TouristHubHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<TouristHubHome> createState() => _TouristHubHomeState();
}

class _TouristHubHomeState extends State<TouristHubHome> {
  int _tab = 0;
  int _bookingSeq = 3043;
  String _search = '';
  final List<TourCircuit> _circuits = List.of(initialCircuits);
  final List<TouristClient> _clients = List.of(initialTouristClients);
  final List<TourBooking> _bookings = List.of(initialTourBookings);
  final List<TourGuide> _guides = List.of(initialGuides);

  int get _activeTours => _bookings.where((b) => b.status == 'Confirmée' || b.status == 'En cours').length;
  int get _participants => _bookings.where((b) => b.status != 'Annulée').fold(0, (s, b) => s + b.participants);
  int get _revenue => _bookings.where((b) => b.status != 'Annulée').fold(0, (s, b) => s + b.total);

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

  void _addCircuit() async {
    final title = TextEditingController();
    final price = TextEditingController();
    final ok = await _dialog('Nouveau circuit', [
      TextField(controller: title, decoration: const InputDecoration(labelText: 'Titre du circuit')),
      TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix / pers. DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && title.text.isNotEmpty) {
      setState(() => _circuits.add(TourCircuit(title: title.text, region: 'Tunisie', duration: '1 jour', price: int.tryParse(price.text) ?? 100, type: 'Découverte')));
    }
  }

  void _addClient() async {
    final name = TextEditingController();
    final phone = TextEditingController();
    final ok = await _dialog('Nouveau touriste', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: phone, decoration: const InputDecoration(labelText: 'Téléphone')),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _clients.add(TouristClient(name: name.text, phone: phone.text)));
    }
  }

  void _addBooking() async {
    final client = TextEditingController();
    final circuit = TextEditingController();
    final participants = TextEditingController(text: '2');
    final ok = await _dialog('Nouvelle réservation', [
      TextField(controller: client, decoration: const InputDecoration(labelText: 'Client')),
      TextField(controller: circuit, decoration: const InputDecoration(labelText: 'Circuit')),
      TextField(controller: participants, decoration: const InputDecoration(labelText: 'Participants'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && client.text.isNotEmpty) {
      final p = int.tryParse(participants.text) ?? 1;
      setState(() => _bookings.insert(0, TourBooking(
        id: 'TH-${_bookingSeq++}',
        client: client.text,
        circuit: circuit.text,
        date: '12/07/2026',
        participants: p,
        total: p * 120,
        status: 'En attente',
      )));
    }
  }

  void _addGuide() async {
    final name = TextEditingController();
    final langs = TextEditingController();
    final ok = await _dialog('Nouveau guide', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: langs, decoration: const InputDecoration(labelText: 'Langues')),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _guides.add(TourGuide(name: name.text, languages: langs.text, toursWeek: 5)));
    }
  }

  void _cycleBooking(TourBooking b) {
    final i = tourStatuses.indexOf(b.status);
    setState(() => b.status = tourStatuses[(i + 1) % tourStatuses.length]);
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 3:
        return _addBooking;
      case 1:
        return _addCircuit;
      case 2:
        return _addClient;
      case 4:
        return _addGuide;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _clients.where((c) => c.name.toLowerCase().contains(_search.toLowerCase())).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('🏛️ TouristHub'),
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
                _Kpi(label: 'Circuits actifs', value: '$_activeTours'),
                _Kpi(label: 'Participants', value: '$_participants'),
                _Kpi(label: 'CA total', value: '$_revenue DT'),
                _Kpi(label: 'Guides', value: '${_guides.length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Départs prochains', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._bookings.where((b) => b.status != 'Terminée' && b.status != 'Annulée').take(3).map((b) => Card(
              child: ListTile(
                title: Text('${b.circuit} — ${b.client}'),
                subtitle: Text('${b.date} · ${b.participants} pers.'),
                trailing: Text('${b.total} DT'),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _circuits.map((c) => Card(
            child: ListTile(
              leading: const Text('🗺️', style: TextStyle(fontSize: 28)),
              title: Text(c.title),
              subtitle: Text('${c.region} · ${c.duration} · ${c.type}'),
              trailing: Text('${c.price} DT/pers.', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: [
            TextField(
              decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Rechercher un client…', border: OutlineInputBorder()),
              onChanged: (v) => setState(() => _search = v),
            ),
            const SizedBox(height: 12),
            ...filtered.map((c) => Card(
              child: ListTile(
                title: Text(c.name),
                subtitle: Text(c.phone),
                trailing: Text(c.nationality, style: const TextStyle(fontSize: 12)),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _bookings.map((b) => Card(
            child: ListTile(
              title: Text('${b.id} — ${b.circuit}'),
              subtitle: Text('${b.client} · ${b.date} · ${b.participants} pers.'),
              onTap: () => _cycleBooking(b),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${b.total} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(b.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _guides.map((g) => Card(
            child: ListTile(
              leading: const Icon(Icons.hiking),
              title: Text(g.name),
              subtitle: Text(g.languages),
              trailing: Text('${g.toursWeek} tours/sem.', style: const TextStyle(fontSize: 12)),
            ),
          )).toList()),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.map_outlined), label: 'Circuits'),
          NavigationDestination(icon: Icon(Icons.people_outline), label: 'Clients'),
          NavigationDestination(icon: Icon(Icons.event_available_outlined), label: 'Réservations'),
          NavigationDestination(icon: Icon(Icons.tour_outlined), label: 'Guides'),
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
