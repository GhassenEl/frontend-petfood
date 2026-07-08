import 'package:flutter/material.dart';
import 'package:carthage_land/data/demo_data.dart';

void main() => runApp(const CarthageLandApp());

class CarthageLandApp extends StatefulWidget {
  const CarthageLandApp({super.key});
  @override
  State<CarthageLandApp> createState() => _CarthageLandAppState();
}

class _CarthageLandAppState extends State<CarthageLandApp> {
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
      title: 'Carthage Land — Parc d\'attractions',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: CarthageLandHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class CarthageLandHome extends StatefulWidget {
  const CarthageLandHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<CarthageLandHome> createState() => _CarthageLandHomeState();
}

class _CarthageLandHomeState extends State<CarthageLandHome> {
  int _tab = 0;
  int _ticketSeq = 8802;
  final List<ParkAttraction> _attractions = List.of(initialAttractions);
  final List<ParkTicket> _tickets = List.of(initialTickets);
  final List<ParkShow> _shows = List.of(initialShows);

  int get _openAttractions => _attractions.where((a) => a.status == 'Ouverte').length;
  int get _activeTickets => _tickets.where((t) => t.status != 'Annulé').length;
  int get _revenue => _tickets.where((t) => t.status != 'Annulé').fold(0, (s, t) => s + t.price);
  int get _upcomingShows => _shows.where((s) => s.status == 'À venir').length;

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

  void _addAttraction() async {
    final name = TextEditingController();
    final zone = TextEditingController();
    final ok = await _dialog('Nouvelle attraction', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: zone, decoration: const InputDecoration(labelText: 'Zone')),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _attractions.add(ParkAttraction(
        name: name.text,
        zone: zone.text.isNotEmpty ? zone.text : 'Général',
        duration: '5 min',
        minAge: 0,
        waitMin: 0,
        status: 'Ouverte',
        emoji: '🎡',
      )));
    }
  }

  void _addTicket() async {
    final visitor = TextEditingController();
    final type = TextEditingController(text: 'Adulte');
    final price = TextEditingController(text: '45');
    final ok = await _dialog('Nouveau billet', [
      TextField(controller: visitor, decoration: const InputDecoration(labelText: 'Visiteur')),
      TextField(controller: type, decoration: const InputDecoration(labelText: 'Type')),
      TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && visitor.text.isNotEmpty) {
      setState(() => _tickets.insert(0, ParkTicket(
        id: 'TK-${_ticketSeq++}',
        visitor: visitor.text,
        type: type.text,
        date: 'Aujourd\'hui',
        price: int.tryParse(price.text) ?? 45,
        status: 'En attente',
      )));
    }
  }

  void _addShow() async {
    final title = TextEditingController();
    final stage = TextEditingController();
    final time = TextEditingController();
    final ok = await _dialog('Nouveau spectacle', [
      TextField(controller: title, decoration: const InputDecoration(labelText: 'Titre')),
      TextField(controller: stage, decoration: const InputDecoration(labelText: 'Scène')),
      TextField(controller: time, decoration: const InputDecoration(labelText: 'Heure')),
    ]);
    if (ok == true && title.text.isNotEmpty) {
      setState(() => _shows.insert(0, ParkShow(
        title: title.text,
        stage: stage.text.isNotEmpty ? stage.text : 'Esplanade',
        time: time.text,
        capacity: 100,
        booked: 0,
        status: 'À venir',
      )));
    }
  }

  void _cycleAttraction(ParkAttraction a) {
    final i = attractionStatuses.indexOf(a.status);
    setState(() => a.status = attractionStatuses[(i + 1) % attractionStatuses.length]);
  }

  void _cycleTicket(ParkTicket t) {
    final i = ticketStatuses.indexOf(t.status);
    setState(() => t.status = ticketStatuses[(i + 1) % ticketStatuses.length]);
  }

  void _joinShow(ParkShow s) {
    if (s.booked < s.capacity && s.status != 'Complet') {
      setState(() {
        s.booked++;
        if (s.booked >= s.capacity) s.status = 'Complet';
      });
    }
  }

  void _cycleShow(ParkShow s) {
    final i = showStatuses.indexOf(s.status);
    setState(() => s.status = showStatuses[(i + 1) % showStatuses.length]);
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 2:
        return _addTicket;
      case 1:
        return _addAttraction;
      case 3:
        return _addShow;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🎡 Carthage Land'),
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
            Text('Parc d\'attractions Carthage Land', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Attractions ouvertes', value: '$_openAttractions'),
                _Kpi(label: 'Billets', value: '$_activeTickets'),
                _Kpi(label: 'CA billets', value: '$_revenue DT'),
                _Kpi(label: 'Spectacles', value: '$_upcomingShows'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Temps d\'attente', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._attractions.where((a) => a.status == 'Ouverte').take(3).map((a) => Card(
              child: ListTile(
                leading: Text(a.emoji, style: const TextStyle(fontSize: 28)),
                title: Text(a.name),
                subtitle: Text(a.zone),
                trailing: Text('${a.waitMin} min', style: const TextStyle(fontWeight: FontWeight.w700)),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: _attractions.map((a) => Card(
            child: ListTile(
              leading: Text(a.emoji, style: const TextStyle(fontSize: 32)),
              title: Text(a.name),
              subtitle: Text('${a.zone} · ${a.duration} · dès ${a.minAge} ans'),
              onTap: () => _cycleAttraction(a),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${a.waitMin} min', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(a.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: _tickets.map((t) => Card(
            child: ListTile(
              leading: const Icon(Icons.confirmation_number_outlined),
              title: Text('${t.id} — ${t.visitor}'),
              subtitle: Text('${t.type} · ${t.date}'),
              onTap: () => _cycleTicket(t),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${t.price} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(t.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: _shows.map((s) => Card(
            child: ListTile(
              leading: const Icon(Icons.theater_comedy_outlined),
              title: Text(s.title),
              subtitle: Text('${s.stage} · ${s.time}\n${s.booked}/${s.capacity} places'),
              isThreeLine: true,
              onTap: () => _cycleShow(s),
              onLongPress: () => _joinShow(s),
              trailing: Text(s.status, style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.secondary)),
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
              BottomNavigationBarItem(icon: Icon(Icons.attractions_outlined), label: 'Attractions'),
              BottomNavigationBarItem(icon: Icon(Icons.confirmation_number_outlined), label: 'Billets'),
              BottomNavigationBarItem(icon: Icon(Icons.theater_comedy_outlined), label: 'Spectacles'),
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
