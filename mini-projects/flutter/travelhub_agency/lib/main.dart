import 'package:flutter/material.dart';
import 'package:travelhub_agency/data/demo_data.dart';

void main() => runApp(const TravelHubApp());

class TravelHubApp extends StatefulWidget {
  const TravelHubApp({super.key});
  @override
  State<TravelHubApp> createState() => _TravelHubAppState();
}

class _TravelHubAppState extends State<TravelHubApp> {
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
      title: 'TravelHub — Centre de voyage',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: TravelHubHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class TravelHubHome extends StatefulWidget {
  const TravelHubHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<TravelHubHome> createState() => _TravelHubHomeState();
}

class _TravelHubHomeState extends State<TravelHubHome> {
  int _tab = 0;
  int _bookingSeq = 2043;
  String _search = '';
  final List<TravelPackage> _packages = List.of(initialPackages);
  final List<TravelClient> _clients = List.of(initialTravelClients);
  final List<TravelBooking> _bookings = List.of(initialBookings);

  int get _confirmed => _bookings.where((b) => b.status == 'Confirmée' || b.status == 'En cours').length;
  int get _revenue => _bookings.where((b) => b.status != 'Annulée').fold(0, (s, b) => s + b.total);

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

  void _addPackage() async {
    final dest = TextEditingController();
    final price = TextEditingController();
    final ok = await _confirmDialog('Nouvelle destination', [
      TextField(controller: dest, decoration: const InputDecoration(labelText: 'Destination')),
      TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && dest.text.isNotEmpty) {
      setState(() => _packages.add(TravelPackage(destination: dest.text, duration: '5 jours', price: int.tryParse(price.text) ?? 1500, type: 'Standard')));
    }
  }

  void _addClient() async {
    final name = TextEditingController();
    final phone = TextEditingController();
    final ok = await _confirmDialog('Nouveau client', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: phone, decoration: const InputDecoration(labelText: 'Téléphone')),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _clients.add(TravelClient(name: name.text, phone: phone.text)));
    }
  }

  void _addBooking() async {
    final client = TextEditingController();
    final dest = TextEditingController();
    final total = TextEditingController();
    final ok = await _confirmDialog('Nouvelle réservation', [
      TextField(controller: client, decoration: const InputDecoration(labelText: 'Client')),
      TextField(controller: dest, decoration: const InputDecoration(labelText: 'Destination')),
      TextField(controller: total, decoration: const InputDecoration(labelText: 'Total DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && client.text.isNotEmpty) {
      setState(() => _bookings.insert(0, TravelBooking(
        id: 'TH-${_bookingSeq++}',
        client: client.text,
        destination: dest.text,
        departure: '01/08/2026',
        total: int.tryParse(total.text) ?? 0,
        status: 'En attente',
      )));
    }
  }

  void _cycleBooking(TravelBooking b) {
    final i = bookingStatuses.indexOf(b.status);
    setState(() => b.status = bookingStatuses[(i + 1) % bookingStatuses.length]);
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 3:
        return _addBooking;
      case 1:
        return _addPackage;
      case 2:
        return _addClient;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _clients.where((c) => c.name.toLowerCase().contains(_search.toLowerCase())).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('✈️ TravelHub'),
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
                _Kpi(label: 'Réservations actives', value: '$_confirmed'),
                _Kpi(label: 'CA total', value: '$_revenue DT'),
                _Kpi(label: 'Destinations', value: '${_packages.length}'),
                _Kpi(label: 'Clients', value: '${_clients.length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Prochains départs', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._bookings.where((b) => b.status != 'Terminée' && b.status != 'Annulée').take(3).map((b) => Card(
              child: ListTile(title: Text('${b.destination} — ${b.client}'), subtitle: Text(b.departure), trailing: Text('${b.total} DT')),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _packages.map((p) => Card(
            child: ListTile(
              leading: const Text('🌍', style: TextStyle(fontSize: 28)),
              title: Text(p.destination),
              subtitle: Text('${p.duration} · ${p.type}'),
              trailing: Text('${p.price} DT', style: const TextStyle(fontWeight: FontWeight.w800)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: [
            TextField(
              decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Rechercher un client…', border: OutlineInputBorder()),
              onChanged: (v) => setState(() => _search = v),
            ),
            const SizedBox(height: 12),
            ...filtered.map((c) => Card(
              child: ListTile(title: Text(c.name), subtitle: Text(c.phone), trailing: Text(c.passport, style: const TextStyle(fontSize: 12))),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _bookings.map((b) => Card(
            child: ListTile(
              title: Text('${b.id} — ${b.destination}'),
              subtitle: Text('${b.client} · ${b.departure}'),
              onTap: () => _cycleBooking(b),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${b.total} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(b.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
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
          NavigationDestination(icon: Icon(Icons.flight_takeoff), label: 'Destinations'),
          NavigationDestination(icon: Icon(Icons.people_outline), label: 'Clients'),
          NavigationDestination(icon: Icon(Icons.confirmation_number_outlined), label: 'Réservations'),
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
