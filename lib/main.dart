import 'package:flutter/material.dart';
import 'package:medilink_clinique/data/demo_data.dart';

void main() => runApp(const MediLinkApp());

class MediLinkApp extends StatefulWidget {
  const MediLinkApp({super.key});
  @override
  State<MediLinkApp> createState() => _MediLinkAppState();
}

class _MediLinkAppState extends State<MediLinkApp> {
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
      title: 'MediLink — Clinique',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: MediLinkHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class MediLinkHome extends StatefulWidget {
  const MediLinkHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<MediLinkHome> createState() => _MediLinkHomeState();
}

class _MediLinkHomeState extends State<MediLinkHome> {
  int _tab = 0;
  final List<Doctor> _doctors = List.of(initialDoctors);
  final List<Patient> _patients = List.of(initialPatients);
  final List<Appointment> _appointments = List.of(initialAppointments);
  final List<Prescription> _prescriptions = List.of(initialPrescriptions);

  void _cycleRdv(Appointment a) {
    final i = rdvStatuses.indexOf(a.status);
    setState(() => a.status = rdvStatuses[(i + 1) % rdvStatuses.length]);
  }

  void _addRdv() async {
    final patient = TextEditingController();
    final doctor = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouveau RDV'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: patient, decoration: const InputDecoration(labelText: 'Patient')),
          TextField(controller: doctor, decoration: const InputDecoration(labelText: 'Médecin')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Planifier')),
        ],
      ),
    );
    if (ok == true && patient.text.isNotEmpty) {
      setState(() => _appointments.add(Appointment(
        date: '2026-07-07', time: '15:00', patient: patient.text, doctor: doctor.text, status: 'Planifié',
      )));
    }
  }

  void _addPrescription() async {
    final patient = TextEditingController();
    final drug = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouvelle ordonnance'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: patient, decoration: const InputDecoration(labelText: 'Patient')),
          TextField(controller: drug, decoration: const InputDecoration(labelText: 'Médicament')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Prescrire')),
        ],
      ),
    );
    if (ok == true && drug.text.isNotEmpty) {
      setState(() => _prescriptions.insert(0, Prescription(
        patient: patient.text, doctor: 'Dr. Mansouri', drug: drug.text, dosage: '1 cp/j', durationDays: 14,
      )));
    }
  }

  @override
  Widget build(BuildContext context) {
    final todayRdv = _appointments.where((a) => a.date == '2026-07-07').length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('🏥 MediLink'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: _tab == 3
          ? FloatingActionButton(onPressed: _addRdv, child: const Icon(Icons.event))
          : _tab == 4
              ? FloatingActionButton(onPressed: _addPrescription, child: const Icon(Icons.medication))
              : null,
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
                _Kpi(label: 'RDV aujourd\'hui', value: '$todayRdv'),
                _Kpi(label: 'Patients', value: '${_patients.length}'),
                _Kpi(label: 'Médecins', value: '${_doctors.length}'),
                _Kpi(label: 'Ordonnances', value: '${_prescriptions.length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('RDV du jour', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._appointments.where((a) => a.date == '2026-07-07').map((a) => Card(
              child: ListTile(
                title: Text('${a.time} — ${a.patient}'),
                subtitle: Text(a.doctor),
                trailing: Text(a.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _doctors.map((d) => Card(
            child: ListTile(title: Text(d.name), subtitle: Text(d.specialty), trailing: Text(d.phone)),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _patients.map((p) => Card(
            child: ListTile(title: Text(p.name), subtitle: Text('${p.age} ans · ${p.condition}'), trailing: Text(p.phone)),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _appointments.map((a) => Card(
            child: ListTile(
              title: Text('${a.date} ${a.time}'),
              subtitle: Text('${a.patient} · ${a.doctor}'),
              trailing: Text(a.status),
              onTap: () => _cycleRdv(a),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _prescriptions.map((m) => Card(
            child: ListTile(
              title: Text(m.drug),
              subtitle: Text('${m.patient} · ${m.doctor}'),
              trailing: Text('${m.dosage}\n${m.durationDays}j', textAlign: TextAlign.end, style: const TextStyle(fontSize: 12)),
            ),
          )).toList()),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.medical_services_outlined), label: 'Médecins'),
          NavigationDestination(icon: Icon(Icons.people_outline), label: 'Patients'),
          NavigationDestination(icon: Icon(Icons.event_outlined), label: 'RDV'),
          NavigationDestination(icon: Icon(Icons.medication_outlined), label: 'Médicaments'),
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
