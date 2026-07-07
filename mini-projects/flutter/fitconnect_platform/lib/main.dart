import 'package:flutter/material.dart';
import 'package:fitconnect_platform/data/demo_data.dart';

void main() => runApp(const FitConnectApp());

class FitConnectApp extends StatelessWidget {
  const FitConnectApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FitConnect',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6366F1)),
        useMaterial3: true,
      ),
      home: const FitConnectHome(),
    );
  }
}

class FitConnectHome extends StatefulWidget {
  const FitConnectHome({super.key});

  @override
  State<FitConnectHome> createState() => _FitConnectHomeState();
}

class _FitConnectHomeState extends State<FitConnectHome> {
  int _tab = 0;
  String _filter = 'all';
  String? _selectedProgram;
  String? _selectedSlot;
  final _emailCtrl = TextEditingController();
  String? _bookingMsg;

  List<FitnessProgram> get _filteredPrograms {
    if (_filter == 'all') return programs;
    return programs.where((p) => p.category == _filter).toList();
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text.rich(
          TextSpan(
            children: [
              TextSpan(text: 'Fit', style: TextStyle(fontWeight: FontWeight.w900)),
              TextSpan(text: 'Connect', style: TextStyle(color: Color(0xFF6366F1), fontWeight: FontWeight.w900)),
            ],
          ),
        ),
      ),
      body: IndexedStack(
        index: _tab,
        children: [
          _HomeTab(onBook: () => setState(() => _tab = 3)),
          _ProgramsTab(
            filter: _filter,
            programs: _filteredPrograms,
            onFilter: (f) => setState(() => _filter = f),
          ),
          _CoachesTab(),
          _BookingTab(
            emailCtrl: _emailCtrl,
            selectedProgram: _selectedProgram,
            selectedSlot: _selectedSlot,
            message: _bookingMsg,
            onProgram: (v) => setState(() => _selectedProgram = v),
            onSlot: (v) => setState(() => _selectedSlot = v),
            onSubmit: _submitBooking,
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Accueil'),
          NavigationDestination(icon: Icon(Icons.fitness_center_outlined), label: 'Programmes'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Coachs'),
          NavigationDestination(icon: Icon(Icons.event_available_outlined), label: 'Réserver'),
        ],
      ),
    );
  }

  void _submitBooking() {
    if (_selectedProgram == null || _selectedSlot == null || _emailCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Remplissez tous les champs')),
      );
      return;
    }
    setState(() {
      _bookingMsg = '✓ Réservation confirmée — $_selectedProgram le ${_tomorrow()} à ${_selectedSlot!.split(' — ').first}. Email : ${_emailCtrl.text.trim()}';
    });
  }

  String _tomorrow() {
    final d = DateTime.now().add(const Duration(days: 1));
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
  }
}

class _HomeTab extends StatelessWidget {
  const _HomeTab({required this.onBook});

  final VoidCallback onBook;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFF6366F1).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(999),
          ),
          child: const Text(
            'Plateforme fitness 100 % en ligne',
            style: TextStyle(color: Color(0xFF6366F1), fontWeight: FontWeight.w700, fontSize: 12),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Entraînez-vous où vous voulez',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 8),
        Text(
          'Programmes, coachs certifiés et séances live — mini-projet Flutter autonome.',
          style: TextStyle(color: Colors.grey.shade600),
        ),
        const SizedBox(height: 20),
        FilledButton(onPressed: onBook, child: const Text('Réserver une séance')),
        const SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: const [
            _Stat(value: '48', label: 'Programmes'),
            _Stat(value: '12', label: 'Coachs'),
            _Stat(value: '2.4k', label: 'Membres'),
          ],
        ),
        const SizedBox(height: 24),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Prochaine séance live', style: TextStyle(color: Color(0xFF06B6D4), fontWeight: FontWeight.w700, fontSize: 12)),
                const SizedBox(height: 8),
                const Text('Full Body — 45 min', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                Text('Avec Coach Maya · Aujourd\'hui 18:00', style: TextStyle(color: Colors.grey.shade600)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _ProgramsTab extends StatelessWidget {
  const _ProgramsTab({
    required this.filter,
    required this.programs,
    required this.onFilter,
  });

  final String filter;
  final List<FitnessProgram> programs;
  final ValueChanged<String> onFilter;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Programmes', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: filters.entries.map((e) {
            final active = filter == e.key;
            return FilterChip(
              label: Text(e.value),
              selected: active,
              onSelected: (_) => onFilter(e.key),
            );
          }).toList(),
        ),
        const SizedBox(height: 16),
        ...programs.map((p) => Card(
              child: ListTile(
                leading: Text(p.emoji, style: const TextStyle(fontSize: 28)),
                title: Text(p.name),
                subtitle: Text('${p.duration} · ${p.level}'),
                trailing: const Text('★ 4.8', style: TextStyle(color: Color(0xFF6366F1), fontWeight: FontWeight.w700)),
              ),
            )),
      ],
    );
  }
}

class _CoachesTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.85,
      ),
      itemCount: coaches.length,
      itemBuilder: (context, i) {
        final c = coaches[i];
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: const Color(0xFF6366F1),
                  child: Text(c.initial, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
                ),
                const SizedBox(height: 10),
                Text(c.name, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(c.specialty, textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                Text('★ ${c.rating}', style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _BookingTab extends StatelessWidget {
  const _BookingTab({
    required this.emailCtrl,
    required this.selectedProgram,
    required this.selectedSlot,
    required this.message,
    required this.onProgram,
    required this.onSlot,
    required this.onSubmit,
  });

  final TextEditingController emailCtrl;
  final String? selectedProgram;
  final String? selectedSlot;
  final String? message;
  final ValueChanged<String?> onProgram;
  final ValueChanged<String?> onSlot;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Réserver', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 16),
        const Text('Programme', style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        DropdownButton<String>(
          isExpanded: true,
          value: selectedProgram,
          hint: const Text('Choisir…'),
          items: programs
              .map((p) => DropdownMenuItem(value: p.name, child: Text(p.name)))
              .toList(),
          onChanged: onProgram,
        ),
        const SizedBox(height: 12),
        const Text('Créneau', style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        DropdownButton<String>(
          isExpanded: true,
          value: selectedSlot,
          hint: const Text('Choisir…'),
          items: timeSlots
              .map((s) => DropdownMenuItem(value: s, child: Text(s)))
              .toList(),
          onChanged: onSlot,
        ),
        const SizedBox(height: 12),
        TextField(
          controller: emailCtrl,
          decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 20),
        FilledButton(onPressed: onSubmit, child: const Text('Confirmer la réservation')),
        if (message != null) ...[
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.green.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.green.shade200),
            ),
            child: Text(message!, style: TextStyle(color: Colors.green.shade800, fontWeight: FontWeight.w600)),
          ),
        ],
      ],
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
      ],
    );
  }
}
