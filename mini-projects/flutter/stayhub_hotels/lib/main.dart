import 'package:flutter/material.dart';
import 'package:stayhub_hotels/data/demo_data.dart';

void main() => runApp(const StayHubApp());

class StayHubApp extends StatefulWidget {
  const StayHubApp({super.key});
  @override
  State<StayHubApp> createState() => _StayHubAppState();
}

class _StayHubAppState extends State<StayHubApp> {
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
      title: 'StayHub — Réservation hôtels',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: StayHubHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class StayHubHome extends StatefulWidget {
  const StayHubHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<StayHubHome> createState() => _StayHubHomeState();
}

class _StayHubHomeState extends State<StayHubHome> {
  int _tab = 0;
  int _bookingSeq = 702;
  final List<HotelProperty> _hotels = List.of(initialHotels);
  final List<HotelBooking> _bookings = List.of(initialBookings);

  int get _totalRooms => _hotels.fold(0, (s, h) => s + h.rooms);
  int get _activeBookings => _bookings.where((b) => b.status == 'Confirmée' || b.status == 'En attente').length;
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

  void _addHotel() async {
    final name = TextEditingController();
    final city = TextEditingController();
    final price = TextEditingController(text: '150');
    final ok = await _dialog('Nouvel hôtel', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: city, decoration: const InputDecoration(labelText: 'Ville')),
      TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix/nuit DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _hotels.add(HotelProperty(
        name: name.text,
        city: city.text.isNotEmpty ? city.text : 'Tunisie',
        stars: 3,
        pricePerNight: int.tryParse(price.text) ?? 150,
        rooms: 10,
        emoji: '🏨',
      )));
    }
  }

  void _addBooking() async {
    final guest = TextEditingController();
    final hotel = TextEditingController();
    final nights = TextEditingController(text: '2');
    final ok = await _dialog('Nouvelle réservation', [
      TextField(controller: guest, decoration: const InputDecoration(labelText: 'Client')),
      TextField(controller: hotel, decoration: const InputDecoration(labelText: 'Hôtel')),
      TextField(controller: nights, decoration: const InputDecoration(labelText: 'Nuits'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && guest.text.isNotEmpty) {
      final n = int.tryParse(nights.text) ?? 2;
      final h = _hotels.where((x) => x.name == hotel.text).firstOrNull;
      final price = h?.pricePerNight ?? 150;
      setState(() {
        _bookings.insert(0, HotelBooking(
          id: 'BK-${_bookingSeq++}',
          guest: guest.text,
          hotel: hotel.text.isNotEmpty ? hotel.text : 'À choisir',
          checkIn: 'Prochainement',
          checkOut: '+$n j',
          nights: n,
          total: n * price,
          status: 'En attente',
        ));
        if (h != null && h.rooms > 0) h.rooms--;
      });
    }
  }

  void _cycleBooking(HotelBooking b) {
    final i = bookingStatuses.indexOf(b.status);
    setState(() => b.status = bookingStatuses[(i + 1) % bookingStatuses.length]);
  }

  void _bookRoom(HotelProperty h) {
    if (h.rooms > 0) {
      setState(() {
        h.rooms--;
        _bookings.insert(0, HotelBooking(
          id: 'BK-${_bookingSeq++}',
          guest: 'Client direct',
          hotel: h.name,
          checkIn: 'Aujourd\'hui',
          checkOut: '+1 n',
          nights: 1,
          total: h.pricePerNight,
          status: 'En attente',
        ));
      });
    }
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 2:
        return _addBooking;
      case 1:
        return _addHotel;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🏨 StayHub'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: FloatingActionButton(onPressed: _fabAction, child: const Icon(Icons.add)),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.all(16), children: [
            Text('Réservation hôtels', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Hôtels', value: '${_hotels.length}'),
                _Kpi(label: 'Chambres dispo', value: '$_totalRooms'),
                _Kpi(label: 'Réservations', value: '$_activeBookings'),
                _Kpi(label: 'CA', value: '$_revenue DT'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Réservations récentes', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._bookings.take(3).map((b) => Card(child: ListTile(
              title: Text('${b.guest} — ${b.hotel}'),
              subtitle: Text('${b.checkIn} → ${b.checkOut} · ${b.nights} nuits'),
              trailing: Text('${b.total} DT'),
            ))),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _hotels.map((h) => Card(
            child: ListTile(
              leading: Text(h.emoji, style: const TextStyle(fontSize: 32)),
              title: Text(h.name),
              subtitle: Text('${h.city} · ${'★' * h.stars}\n${h.pricePerNight} DT/nuit'),
              isThreeLine: true,
              onTap: () => _bookRoom(h),
              trailing: Text('${h.rooms} ch.', style: const TextStyle(fontWeight: FontWeight.w700)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _bookings.map((b) => Card(
            child: ListTile(
              leading: const Icon(Icons.hotel_outlined),
              title: Text('${b.id} — ${b.guest}'),
              subtitle: Text('${b.hotel} · ${b.checkIn} → ${b.checkOut}'),
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
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Accueil'),
          NavigationDestination(icon: Icon(Icons.hotel_outlined), label: 'Hôtels'),
          NavigationDestination(icon: Icon(Icons.event_available_outlined), label: 'Réservations'),
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
