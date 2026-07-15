import 'package:flutter/material.dart';
import 'package:driverent_location/data/demo_data.dart';

void main() => runApp(const DriveRentApp());

class DriveRentApp extends StatefulWidget {
  const DriveRentApp({super.key});
  @override
  State<DriveRentApp> createState() => _DriveRentAppState();
}

class _DriveRentAppState extends State<DriveRentApp> {
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
      title: 'DriveRent — Location voitures',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: DriveRentHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class DriveRentHome extends StatefulWidget {
  const DriveRentHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<DriveRentHome> createState() => _DriveRentHomeState();
}

class _DriveRentHomeState extends State<DriveRentHome> {
  int _tab = 0;
  int _rentalSeq = 1043;
  String _search = '';
  final List<Car> _cars = List.of(initialCars);
  final List<RentalClient> _clients = List.of(initialClients);
  final List<Rental> _rentals = List.of(initialRentals);

  int get _availableCars => _cars.where((c) => c.status == 'Disponible').length;
  int get _activeRentals => _rentals.where((r) => r.status == 'En cours').length;
  int get _revenue => _rentals.where((r) => r.status != 'Annulée').fold(0, (s, r) => s + r.total);

  void _addCar() async {
    final model = TextEditingController();
    final price = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouveau véhicule'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: model, decoration: const InputDecoration(labelText: 'Modèle')),
          TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix / jour DT'), keyboardType: TextInputType.number),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Ajouter')),
        ],
      ),
    );
    if (ok == true && model.text.isNotEmpty) {
      setState(() => _cars.add(Car(model: model.text, category: 'Standard', pricePerDay: int.tryParse(price.text) ?? 80, status: 'Disponible')));
    }
  }

  void _addClient() async {
    final name = TextEditingController();
    final phone = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouveau client'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
          TextField(controller: phone, decoration: const InputDecoration(labelText: 'Téléphone')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Ajouter')),
        ],
      ),
    );
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _clients.add(RentalClient(name: name.text, phone: phone.text)));
    }
  }

  void _addRental() async {
    final client = TextEditingController();
    final car = TextEditingController();
    final total = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouvelle location'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: client, decoration: const InputDecoration(labelText: 'Client')),
          TextField(controller: car, decoration: const InputDecoration(labelText: 'Véhicule')),
          TextField(controller: total, decoration: const InputDecoration(labelText: 'Total DT'), keyboardType: TextInputType.number),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Créer')),
        ],
      ),
    );
    if (ok == true && client.text.isNotEmpty) {
      setState(() => _rentals.insert(0, Rental(
        id: 'DR-${_rentalSeq++}',
        client: client.text,
        car: car.text,
        start: '08/07',
        end: '12/07',
        total: int.tryParse(total.text) ?? 0,
        status: 'En attente',
      )));
    }
  }

  void _cycleStatus(Rental r) {
    final i = rentalStatuses.indexOf(r.status);
    setState(() => r.status = rentalStatuses[(i + 1) % rentalStatuses.length]);
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 3:
        return _addRental;
      case 1:
        return _addCar;
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
        title: const Text('🚙 DriveRent'),
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
                _Kpi(label: 'Voitures dispo', value: '$_availableCars'),
                _Kpi(label: 'Locations actives', value: '$_activeRentals'),
                _Kpi(label: 'CA total', value: '$_revenue DT'),
                _Kpi(label: 'Clients', value: '${_clients.length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Locations en cours', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._rentals.where((r) => r.status == 'En cours').map((r) => Card(
              child: ListTile(title: Text('${r.id} — ${r.client}'), subtitle: Text(r.car), trailing: Text('${r.total} DT')),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _cars.map((c) => Card(
            child: ListTile(
              leading: const Text('🚗', style: TextStyle(fontSize: 28)),
              title: Text(c.model),
              subtitle: Text('${c.category} · ${c.pricePerDay} DT/j'),
              trailing: Text(c.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: [
            TextField(
              decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Rechercher un client…', border: OutlineInputBorder()),
              onChanged: (v) => setState(() => _search = v),
            ),
            const SizedBox(height: 12),
            ...filtered.map((c) => Card(
              child: ListTile(title: Text(c.name), subtitle: Text(c.phone), trailing: Text(c.license, style: const TextStyle(fontSize: 12))),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _rentals.map((r) => Card(
            child: ListTile(
              title: Text('${r.id} — ${r.client}'),
              subtitle: Text('${r.car} · ${r.start} → ${r.end}'),
              onTap: () => _cycleStatus(r),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${r.total} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(r.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
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
          NavigationDestination(icon: Icon(Icons.directions_car_outlined), label: 'Flotte'),
          NavigationDestination(icon: Icon(Icons.people_outline), label: 'Clients'),
          NavigationDestination(icon: Icon(Icons.key_outlined), label: 'Locations'),
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
