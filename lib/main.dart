import 'package:flutter/material.dart';
import 'package:matchup_sports/data/demo_data.dart';

void main() => runApp(const MatchUpApp());

class MatchUpApp extends StatefulWidget {
  const MatchUpApp({super.key});
  @override
  State<MatchUpApp> createState() => _MatchUpAppState();
}

class _MatchUpAppState extends State<MatchUpApp> {
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
      title: 'MatchUp — Matchs amicaux',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: MatchUpHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class MatchUpHome extends StatefulWidget {
  const MatchUpHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<MatchUpHome> createState() => _MatchUpHomeState();
}

class _MatchUpHomeState extends State<MatchUpHome> {
  int _tab = 0;
  int _matchSeq = 902;
  final List<SportMatch> _matches = List.of(initialMatches);
  final List<SportTeam> _teams = List.of(initialTeams);

  List<SportMatch> get _football => _matches.where((m) => m.sport == 'Football').toList();
  List<SportMatch> get _basket => _matches.where((m) => m.sport == 'Basket').toList();
  int get _openMatches => _matches.where((m) => m.status == 'Ouvert').length;
  int get _totalPlayers => _matches.fold(0, (s, m) => s + m.players);

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

  void _addMatch(String sport) async {
    final teamA = TextEditingController();
    final teamB = TextEditingController();
    final venue = TextEditingController();
    final date = TextEditingController();
    final max = TextEditingController(text: sport == 'Football' ? '22' : '10');
    final ok = await _dialog('Nouveau match $sport', [
      TextField(controller: teamA, decoration: const InputDecoration(labelText: 'Équipe A')),
      TextField(controller: teamB, decoration: const InputDecoration(labelText: 'Équipe B')),
      TextField(controller: venue, decoration: const InputDecoration(labelText: 'Lieu')),
      TextField(controller: date, decoration: const InputDecoration(labelText: 'Date & heure')),
      TextField(controller: max, decoration: const InputDecoration(labelText: 'Joueurs max'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && teamA.text.isNotEmpty) {
      setState(() => _matches.insert(0, SportMatch(
        id: 'MT-${_matchSeq++}',
        sport: sport,
        teamA: teamA.text,
        teamB: teamB.text.isNotEmpty ? teamB.text : 'À définir',
        venue: venue.text.isNotEmpty ? venue.text : 'Terrain municipal',
        date: date.text,
        players: 0,
        maxPlayers: int.tryParse(max.text) ?? (sport == 'Football' ? 22 : 10),
        status: 'Ouvert',
      )));
    }
  }

  void _addTeam() async {
    final name = TextEditingController();
    final sport = TextEditingController(text: 'Football');
    final captain = TextEditingController();
    final ok = await _dialog('Nouvelle équipe', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom équipe')),
      TextField(controller: sport, decoration: const InputDecoration(labelText: 'Sport (Football/Basket)')),
      TextField(controller: captain, decoration: const InputDecoration(labelText: 'Capitaine')),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _teams.add(SportTeam(
        name: name.text,
        sport: sport.text.contains('Basket') ? 'Basket' : 'Football',
        captain: captain.text.isNotEmpty ? captain.text : 'Capitaine',
        members: 1,
        wins: 0,
      )));
    }
  }

  void _joinMatch(SportMatch m) {
    if (m.players < m.maxPlayers && m.status == 'Ouvert') {
      setState(() {
        m.players++;
        if (m.players >= m.maxPlayers) m.status = 'Complet';
      });
    }
  }

  void _cycleMatch(SportMatch m) {
    final i = matchStatuses.indexOf(m.status);
    setState(() => m.status = matchStatuses[(i + 1) % matchStatuses.length]);
  }

  void _addWin(SportTeam t) {
    setState(() => t.wins++);
  }

  Widget _matchList(List<SportMatch> list) {
    if (list.isEmpty) {
      return const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('Aucun match — utilisez le bouton +')));
    }
    return ListView(padding: const EdgeInsets.all(16), children: list.map((m) => Card(
      child: ListTile(
        leading: Text(m.sport == 'Football' ? '⚽' : '🏀', style: const TextStyle(fontSize: 28)),
        title: Text('${m.teamA} vs ${m.teamB}'),
        subtitle: Text('${m.venue} · ${m.date}'),
        onTap: () => _cycleMatch(m),
        onLongPress: () => _joinMatch(m),
        trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text('${m.players}/${m.maxPlayers}', style: const TextStyle(fontWeight: FontWeight.w700)),
          Text(m.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
        ]),
      ),
    )).toList());
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
        return () => _addMatch('Football');
      case 1:
        return () => _addMatch('Football');
      case 2:
        return () => _addMatch('Basket');
      case 3:
        return _addTeam;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('⚽ MatchUp'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: FloatingActionButton(onPressed: _fabAction, child: const Icon(Icons.add)),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.all(16), children: [
            Text('Matchs amicaux', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Matchs ouverts', value: '$_openMatches'),
                _Kpi(label: 'Joueurs inscrits', value: '$_totalPlayers'),
                _Kpi(label: 'Football', value: '${_football.length}'),
                _Kpi(label: 'Basket', value: '${_basket.length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Prochains matchs', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._matches.where((m) => m.status == 'Ouvert' || m.status == 'Complet').take(4).map((m) => Card(
              child: ListTile(
                leading: Text(m.sport == 'Football' ? '⚽' : '🏀', style: const TextStyle(fontSize: 24)),
                title: Text('${m.teamA} vs ${m.teamB}'),
                subtitle: Text('${m.date} · ${m.venue}'),
                trailing: Text('${m.players}/${m.maxPlayers}'),
              ),
            )),
          ]),
          _matchList(_football),
          _matchList(_basket),
          ListView(padding: const EdgeInsets.all(16), children: _teams.map((t) => Card(
            child: ListTile(
              leading: Text(t.sport == 'Football' ? '⚽' : '🏀', style: const TextStyle(fontSize: 28)),
              title: Text(t.name),
              subtitle: Text('Capitaine : ${t.captain} · ${t.members} membres'),
              onTap: () => _addWin(t),
              trailing: Text('${t.wins} victoires', style: const TextStyle(fontWeight: FontWeight.w700)),
            ),
          )).toList()),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.sports_soccer_outlined), label: 'Football'),
          NavigationDestination(icon: Icon(Icons.sports_basketball_outlined), label: 'Basket'),
          NavigationDestination(icon: Icon(Icons.groups_outlined), label: 'Équipes'),
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
