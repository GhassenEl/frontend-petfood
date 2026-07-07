import 'package:flutter/material.dart';
import 'package:fitclub_gym/data/demo_data.dart';

void main() => runApp(const FitClubApp());

class FitClubApp extends StatelessWidget {
  const FitClubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FitClub — Salle de sport',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFF97316),
          brightness: Brightness.dark,
          surface: const Color(0xFF1A2332),
        ),
        useMaterial3: true,
      ),
      home: const FitClubHome(),
    );
  }
}

class FitClubHome extends StatefulWidget {
  const FitClubHome({super.key});

  @override
  State<FitClubHome> createState() => _FitClubHomeState();
}

class _FitClubHomeState extends State<FitClubHome> {
  int _tab = 0;
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final filtered = members
        .where((m) => m.name.toLowerCase().contains(_search.toLowerCase()))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Text('🏋️ '),
            Text('FitClub'),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Chip(
              label: const Text('Démo locale'),
              backgroundColor: Colors.green.withValues(alpha: 0.15),
              labelStyle: const TextStyle(color: Colors.greenAccent, fontSize: 12),
            ),
          ),
        ],
      ),
      body: IndexedStack(
        index: _tab,
        children: [
          _DashboardTab(),
          _MembersTab(
            members: filtered,
            onSearch: (v) => setState(() => _search = v),
          ),
          _ScheduleTab(),
          _PlansTab(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.people_outline), label: 'Adhérents'),
          NavigationDestination(icon: Icon(Icons.calendar_month_outlined), label: 'Planning'),
          NavigationDestination(icon: Icon(Icons.card_membership_outlined), label: 'Abonnements'),
        ],
      ),
    );
  }
}

class _DashboardTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final active = members.where((m) => m.status == 'Actif').length;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Tableau de bord',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 4),
        Text(
          _todayLabel(),
          style: TextStyle(color: Colors.grey.shade400),
        ),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 1.6,
          children: [
            _KpiCard(label: 'Adhérents actifs', value: '$active'),
            _KpiCard(label: 'Cours aujourd\'hui', value: '${todayClasses.length}'),
            _KpiCard(label: 'Remplissage', value: '87%'),
            _KpiCard(label: 'CA mensuel', value: '12.4k DT'),
          ],
        ),
        const SizedBox(height: 20),
        _SectionCard(
          title: 'Cours du jour',
          child: Column(
            children: todayClasses
                .map((c) => ListTile(
                      dense: true,
                      title: Text('${c.time} — ${c.name}'),
                      subtitle: Text(c.coach),
                      trailing: Text(c.spots),
                    ))
                .toList(),
          ),
        ),
        const SizedBox(height: 12),
        _SectionCard(
          title: 'Dernières inscriptions',
          child: Column(
            children: members
                .take(4)
                .map((m) => ListTile(
                      dense: true,
                      title: Text(m.name),
                      trailing: Text(m.plan, style: const TextStyle(color: Colors.orange)),
                    ))
                .toList(),
          ),
        ),
      ],
    );
  }

  String _todayLabel() {
    final now = DateTime.now();
    const days = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
    ];
    return '${days[now.weekday - 1]} ${now.day} ${months[now.month - 1]} ${now.year}';
  }
}

class _MembersTab extends StatelessWidget {
  const _MembersTab({required this.members, required this.onSearch});

  final List<GymMember> members;
  final ValueChanged<String> onSearch;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Adhérents', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 12),
        TextField(
          decoration: const InputDecoration(
            hintText: 'Rechercher…',
            prefixIcon: Icon(Icons.search),
            border: OutlineInputBorder(),
          ),
          onChanged: onSearch,
        ),
        const SizedBox(height: 12),
        ...members.map((m) => Card(
              child: ListTile(
                title: Text(m.name),
                subtitle: Text('${m.plan} · fin ${m.endDate}'),
                trailing: _StatusChip(status: m.status),
              ),
            )),
      ],
    );
  }
}

class _ScheduleTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Planning hebdomadaire', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 12),
        ...weekSchedule.entries.map((e) => Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(e.key, style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    ...e.value.map((slot) => Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Text('• $slot'),
                        )),
                  ],
                ),
              ),
            )),
      ],
    );
  }
}

class _PlansTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Formules', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 12),
        ...plans.map((p) => Card(
              color: p.featured ? Colors.orange.withValues(alpha: 0.12) : null,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                    Text(p.price, style: const TextStyle(fontSize: 22, color: Colors.orange, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    ...p.features.map((f) => Text('✓ $f')),
                  ],
                ),
              ),
            )),
      ],
    );
  }
}

class _KpiCard extends StatelessWidget {
  const _KpiCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(label, style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
            const SizedBox(height: 6),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
            const SizedBox(height: 8),
            child,
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    if (status == 'Actif') {
      bg = Colors.green.withValues(alpha: 0.15);
      fg = Colors.greenAccent;
    } else if (status.contains('Expire')) {
      bg = Colors.orange.withValues(alpha: 0.15);
      fg = Colors.orange;
    } else {
      bg = Colors.red.withValues(alpha: 0.15);
      fg = Colors.redAccent;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Text(status, style: TextStyle(color: fg, fontSize: 11, fontWeight: FontWeight.w700)),
    );
  }
}
