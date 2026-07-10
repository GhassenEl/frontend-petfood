import 'package:flutter/material.dart';
import 'package:taxigo_rides/data/demo_data.dart';

void main() => runApp(const TaxiGoApp());

class TaxiGoApp extends StatefulWidget {
  const TaxiGoApp({super.key});
  @override
  State<TaxiGoApp> createState() => _TaxiGoAppState();
}

class _TaxiGoAppState extends State<TaxiGoApp> {
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
      title: 'TaxiGo — Courses & chauffeurs',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: TaxiGoHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class TaxiGoHome extends StatefulWidget {
  const TaxiGoHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<TaxiGoHome> createState() => _TaxiGoHomeState();
}

class _TaxiGoHomeState extends State<TaxiGoHome> {
  int _tab = 0;
  int _rideSeq = 8035;
  final List<TaxiDriver> _drivers = List.of(initialDrivers);
  final List<TaxiRide> _rides = List.of(initialRides);
  final List<TaxiFare> _fares = List.of(initialFares);

  int get _revenue => _rides.where((r) => r.status == 'Terminée').fold(0, (s, r) => s + r.fare);
  int get _activeRides => _rides.where((r) => r.status != 'Terminée' && r.status != 'Annulée').length;
  int get _onlineDrivers => _drivers.where((d) => d.status != 'Hors ligne').length;
  int get _completedToday => _rides.where((r) => r.status == 'Terminée').length;

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

  void _addDriver() async {
    final name = TextEditingController();
    final car = TextEditingController();
    final plate = TextEditingController();
    final ok = await _dialog('Nouveau chauffeur', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: car, decoration: const InputDecoration(labelText: 'Véhicule')),
      TextField(controller: plate, decoration: const InputDecoration(labelText: 'Immatriculation')),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _drivers.add(TaxiDriver(
        name: name.text,
        car: car.text.isNotEmpty ? car.text : 'Berline',
        plate: plate.text.isNotEmpty ? plate.text : '00 TU 0000',
        rating: 5.0,
        status: 'Disponible',
        rides: 0,
      )));
    }
  }

  void _addRide() async {
    final passenger = TextEditingController();
    final pickup = TextEditingController();
    final destination = TextEditingController();
    final fare = TextEditingController(text: '12');
    final ok = await _dialog('Nouvelle course', [
      TextField(controller: passenger, decoration: const InputDecoration(labelText: 'Passager')),
      TextField(controller: pickup, decoration: const InputDecoration(labelText: 'Départ')),
      TextField(controller: destination, decoration: const InputDecoration(labelText: 'Destination')),
      TextField(controller: fare, decoration: const InputDecoration(labelText: 'Tarif DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && passenger.text.isNotEmpty) {
      setState(() => _rides.insert(0, TaxiRide(
        id: 'TG-${_rideSeq++}',
        passenger: passenger.text,
        pickup: pickup.text,
        destination: destination.text,
        driver: '',
        fare: int.tryParse(fare.text) ?? 12,
        status: 'En attente',
      )));
    }
  }

  void _addFare() async {
    final zone = TextEditingController();
    final base = TextEditingController(text: '5');
    final perKm = TextEditingController(text: '2');
    final ok = await _dialog('Nouvelle zone tarifaire', [
      TextField(controller: zone, decoration: const InputDecoration(labelText: 'Zone')),
      TextField(controller: base, decoration: const InputDecoration(labelText: 'Prise en charge DT'), keyboardType: TextInputType.number),
      TextField(controller: perKm, decoration: const InputDecoration(labelText: 'DT / km'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && zone.text.isNotEmpty) {
      setState(() => _fares.add(TaxiFare(
        zone: zone.text,
        baseFare: int.tryParse(base.text) ?? 5,
        perKm: int.tryParse(perKm.text) ?? 2,
        description: 'Tarif personnalisé',
      )));
    }
  }

  void _cycleRide(TaxiRide r) {
    final i = rideStatuses.indexOf(r.status);
    setState(() {
      r.status = rideStatuses[(i + 1) % rideStatuses.length];
      if (r.status == 'Terminée' && r.driver.isNotEmpty) {
        final d = _drivers.where((x) => x.name == r.driver).firstOrNull;
        if (d != null) {
          d.rides++;
          d.status = 'Disponible';
        }
      }
      if (r.status == 'Chauffeur assigné' && r.driver.isEmpty) {
        final available = _drivers.where((d) => d.status == 'Disponible').firstOrNull;
        if (available != null) {
          r.driver = available.name;
          available.status = 'En course';
        }
      }
    });
  }

  void _cycleDriver(TaxiDriver d) {
    final i = driverStatuses.indexOf(d.status);
    setState(() => d.status = driverStatuses[(i + 1) % driverStatuses.length]);
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 2:
        return _addRide;
      case 1:
        return _addDriver;
      case 3:
        return _addFare;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🚕 TaxiGo'),
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
                _Kpi(label: 'Courses actives', value: '$_activeRides'),
                _Kpi(label: 'CA courses', value: '$_revenue DT'),
                _Kpi(label: 'Chauffeurs en ligne', value: '$_onlineDrivers'),
                _Kpi(label: 'Courses terminées', value: '$_completedToday'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Courses en cours', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._rides.where((r) => r.status != 'Terminée' && r.status != 'Annulée').take(4).map((r) => Card(
              child: ListTile(
                leading: const Icon(Icons.local_taxi_outlined),
                title: Text('${r.id} — ${r.passenger}'),
                subtitle: Text('${r.pickup} → ${r.destination}'),
                trailing: Text('${r.fare} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _drivers.map((d) => Card(
            child: ListTile(
              leading: CircleAvatar(child: Text(d.name[0])),
              title: Text(d.name),
              subtitle: Text('${d.car} · ${d.plate}'),
              onTap: () => _cycleDriver(d),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('★ ${d.rating}', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text('${d.status} · ${d.rides} courses', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _rides.map((r) => Card(
            child: ListTile(
              leading: const Icon(Icons.route_outlined),
              title: Text('${r.id} — ${r.passenger}'),
              subtitle: Text('${r.pickup} → ${r.destination}${r.driver.isNotEmpty ? '\nChauffeur : ${r.driver}' : ''}'),
              onTap: () => _cycleRide(r),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${r.fare} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(r.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _fares.map((f) => Card(
            child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(f.zone, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              Text(f.description),
              const SizedBox(height: 8),
              Text('Prise en charge : ${f.baseFare} DT · ${f.perKm} DT/km', style: const TextStyle(fontWeight: FontWeight.w700)),
            ])),
          )).toList()),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Chauffeurs'),
          NavigationDestination(icon: Icon(Icons.local_taxi_outlined), label: 'Courses'),
          NavigationDestination(icon: Icon(Icons.payments_outlined), label: 'Tarifs'),
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
