import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:garagesmart_auto/data/demo_data.dart';

void main() => runApp(const GarageSmartApp());

class GarageSmartApp extends StatefulWidget {
  const GarageSmartApp({super.key});
  @override
  State<GarageSmartApp> createState() => _GarageSmartAppState();
}

class _GarageSmartAppState extends State<GarageSmartApp> {
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
      title: 'GarageSmart — Smart Garage',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: GarageSmartHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class GarageSmartHome extends StatefulWidget {
  const GarageSmartHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<GarageSmartHome> createState() => _GarageSmartHomeState();
}

class _GarageSmartHomeState extends State<GarageSmartHome> {
  int _tab = 0;
  int _vhSeq = 5;
  int _jbSeq = 502;
  int _alSeq = 4;
  final _rng = Random();
  final List<GarageVehicle> _vehicles = List.of(initialVehicles);
  final List<GarageJob> _jobs = List.of(initialJobs);
  final List<GarageBay> _bays = List.of(initialBays);
  final List<GarageAlert> _alerts = List.of(initialAlerts);
  GarageJob? _selectedQr;

  int get _inShop => _vehicles.where((v) => v.status == 'En atelier' || v.status == 'En attente').length;
  int get _openJobs => _jobs.where((j) => j.status != 'Facturé' && j.status != 'Terminé').length;
  int get _freeBays => _bays.where((b) => !b.occupied).length;
  int get _openDoors => _bays.where((b) => b.doorOpen).length;
  double get _revenue => _jobs.where((j) => j.status == 'Terminé' || j.status == 'Facturé').fold(0.0, (s, j) => s + j.cost);
  int get _unread => _alerts.where((a) => !a.read).length;

  void _pushAlert(String title, String body, String type) {
    _alerts.insert(0, GarageAlert(id: 'GA-${_alSeq++}'.padLeft(2, '0'), title: title, body: body, type: type, time: 'À l\'instant'));
  }

  void _scanIot() {
    setState(() {
      for (final bay in _bays) {
        bay.doorOpen = _rng.nextDouble() < 0.25;
        if (!bay.occupied && _rng.nextDouble() < 0.15) {
          bay.doorOpen = true;
        }
        if (bay.doorOpen) {
          _pushAlert('Porte ${bay.name}', 'Capteur IoT : porte ouverte.', 'Porte');
        }
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Scan IoT — $_openDoors porte(s) ouverte(s), $_freeBays box libre(s)')));
  }

  Future<void> _addVehicle() async {
    final plate = TextEditingController();
    final brand = TextEditingController(text: 'Peugeot');
    final model = TextEditingController();
    final owner = TextEditingController();
    var bay = _bays.where((b) => !b.occupied).firstOrNull?.name ?? 'Box 4';
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Réception véhicule'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: plate, decoration: const InputDecoration(labelText: 'Immatriculation', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: brand, decoration: const InputDecoration(labelText: 'Marque', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: model, decoration: const InputDecoration(labelText: 'Modèle', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: owner, decoration: const InputDecoration(labelText: 'Client', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: bay,
                decoration: const InputDecoration(labelText: 'Box', border: OutlineInputBorder()),
                items: _bays.map((b) => DropdownMenuItem(value: b.name, child: Text('${b.name}${b.occupied ? ' (occupé)' : ''}'))).toList(),
                onChanged: (v) => setLocal(() => bay = v ?? bay),
              ),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Réceptionner')),
          ],
        ),
      ),
    );
    if (ok == true && plate.text.isNotEmpty) {
      final id = 'VH-${_vhSeq.toString().padLeft(2, '0')}';
      _vhSeq++;
      setState(() {
        _vehicles.insert(0, GarageVehicle(
          id: id,
          plate: plate.text,
          brand: brand.text.isNotEmpty ? brand.text : '—',
          model: model.text.isNotEmpty ? model.text : '—',
          owner: owner.text.isNotEmpty ? owner.text : 'Client',
          bay: bay,
          status: 'En attente',
        ));
        final box = _bays.where((b) => b.name == bay).firstOrNull;
        if (box != null) {
          box.occupied = true;
          box.vehiclePlate = plate.text;
        }
        _pushAlert('Réception', '${plate.text} assigné à $bay', 'Véhicule');
      });
    }
  }

  Future<void> _addJob() async {
    if (_vehicles.isEmpty) return;
    var vehicle = _vehicles.first;
    var service = serviceTypes.first;
    final tech = TextEditingController(text: 'Sami');
    final cost = TextEditingController(text: '150');
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Nouvel ordre de réparation'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              DropdownButtonFormField<GarageVehicle>(
                initialValue: vehicle,
                decoration: const InputDecoration(labelText: 'Véhicule', border: OutlineInputBorder()),
                items: _vehicles.map((v) => DropdownMenuItem(value: v, child: Text('${v.plate} · ${v.brand}'))).toList(),
                onChanged: (v) => setLocal(() => vehicle = v ?? vehicle),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: service,
                decoration: const InputDecoration(labelText: 'Service', border: OutlineInputBorder()),
                items: serviceTypes.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                onChanged: (v) => setLocal(() => service = v ?? service),
              ),
              const SizedBox(height: 8),
              TextField(controller: tech, decoration: const InputDecoration(labelText: 'Technicien', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: cost, decoration: const InputDecoration(labelText: 'Coût DT', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Créer')),
          ],
        ),
      ),
    );
    if (ok == true) {
      final id = 'JB-$_jbSeq';
      _jbSeq++;
      final job = GarageJob(
        id: id,
        vehicleId: vehicle.id,
        plate: vehicle.plate,
        service: service,
        technician: tech.text.isNotEmpty ? tech.text : 'Tech',
        cost: double.tryParse(cost.text) ?? 150,
        status: 'Ouvert',
        qrPayload: 'GARAGESMART|$id|${vehicle.plate}|$service',
      );
      setState(() {
        _jobs.insert(0, job);
        vehicle.status = 'En atelier';
        _selectedQr = job;
        _pushAlert('Ordre $id', '${vehicle.plate} — $service', 'Réparation');
      });
    }
  }

  void _cycleVehicle(GarageVehicle v) {
    final i = vehicleStatuses.indexOf(v.status);
    setState(() {
      v.status = vehicleStatuses[(i + 1) % vehicleStatuses.length];
      if (v.status == 'Livré') {
        final box = _bays.where((b) => b.name == v.bay).firstOrNull;
        if (box != null) {
          box.occupied = false;
          box.vehiclePlate = '';
        }
        v.bay = '—';
      }
    });
  }

  void _cycleJob(GarageJob j) {
    final i = jobStatuses.indexOf(j.status);
    setState(() {
      j.status = jobStatuses[(i + 1) % jobStatuses.length];
      j.progress = switch (j.status) {
        'Ouvert' => 10,
        'En cours' => 50,
        'Attente pièces' => 35,
        'Terminé' => 100,
        'Facturé' => 100,
        _ => j.progress,
      };
    });
  }

  void _toggleBayDoor(GarageBay b) {
    setState(() {
      b.doorOpen = !b.doorOpen;
      if (b.doorOpen) _pushAlert('Porte ${b.name}', 'Ouverture manuelle / IoT.', 'Porte');
    });
  }

  Widget _kpi(String label, String value, IconData icon) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, size: 18),
            const SizedBox(height: 6),
            Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text(label, style: Theme.of(context).textTheme.bodySmall),
          ]),
        ),
      ),
    );
  }

  Widget _dashboardTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Text('Smart Garage · atelier connecté', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Row(children: [
          _kpi('En atelier', '$_inShop', Icons.directions_car_filled),
          _kpi('Jobs ouverts', '$_openJobs', Icons.build_outlined),
          _kpi('CA', '${_revenue.toStringAsFixed(0)} DT', Icons.payments_outlined),
        ]),
        const SizedBox(height: 4),
        Row(children: [
          _kpi('Box libres', '$_freeBays', Icons.garage_outlined),
          _kpi('Portes ouvertes', '$_openDoors', Icons.sensor_door_outlined),
          _kpi('Alertes', '$_unread', Icons.notifications_outlined),
        ]),
        const SizedBox(height: 12),
        Card(
          child: ListTile(
            leading: const Icon(Icons.sensors),
            title: const Text('Scan IoT boxes & portes'),
            subtitle: Text('$_freeBays libres · $_openDoors porte(s) ouverte(s)'),
            trailing: FilledButton.tonal(onPressed: _scanIot, child: const Text('Scanner')),
          ),
        ),
        const SizedBox(height: 8),
        Text('Boxes', style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 6),
        ..._bays.map((b) => Card(
          margin: const EdgeInsets.only(bottom: 6),
          child: ListTile(
            leading: Icon(b.occupied ? Icons.directions_car : Icons.crop_square),
            title: Text(b.name),
            subtitle: Text(b.occupied ? b.vehiclePlate : 'Libre'),
            trailing: Row(mainAxisSize: MainAxisSize.min, children: [
              Chip(label: Text(b.doorOpen ? 'Porte ouverte' : 'Porte fermée'), visualDensity: VisualDensity.compact),
              IconButton(onPressed: () => _toggleBayDoor(b), icon: Icon(b.doorOpen ? Icons.meeting_room : Icons.door_front_door)),
            ]),
          ),
        )),
        const SizedBox(height: 8),
        Text('Dernières alertes', style: Theme.of(context).textTheme.titleSmall),
        ..._alerts.take(3).map((a) => ListTile(
          dense: true,
          leading: const Icon(Icons.warning_amber_outlined),
          title: Text(a.title),
          subtitle: Text(a.body),
          onTap: () => setState(() { a.read = true; _tab = 3; }),
        )),
      ],
    );
  }

  Widget _vehiclesTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Véhicules', '${_vehicles.length}', Icons.directions_car),
          _kpi('Atelier', '$_inShop', Icons.handyman_outlined),
          _kpi('Prêts', '${_vehicles.where((v) => v.status == 'Prêt').length}', Icons.check_circle_outline),
        ]),
        const SizedBox(height: 8),
        ..._vehicles.map((v) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: Text('${v.plate} · ${v.brand} ${v.model}', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('${v.owner} · ${v.bay} · ${v.mileage} km'),
            trailing: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Chip(label: Text(v.status), visualDensity: VisualDensity.compact),
              TextButton(onPressed: () => _cycleVehicle(v), child: const Text('→')),
            ]),
          ),
        )),
      ],
    );
  }

  Widget _jobsTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Ouverts', '$_openJobs', Icons.assignment_outlined),
          _kpi('Total', '${_jobs.length}', Icons.list_alt),
          _kpi('CA', '${_revenue.toStringAsFixed(0)} DT', Icons.euro),
        ]),
        const SizedBox(height: 8),
        ..._jobs.map((j) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(child: Text('${j.id} · ${j.service}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
                Chip(label: Text(j.status), visualDensity: VisualDensity.compact),
              ]),
              Text('${j.plate} · Tech. ${j.technician} · ${j.cost.toStringAsFixed(0)} DT'),
              const SizedBox(height: 8),
              LinearProgressIndicator(value: j.progress / 100, minHeight: 6),
              const SizedBox(height: 8),
              Row(children: [
                TextButton(onPressed: () => _cycleJob(j), child: const Text('Statut →')),
                const Spacer(),
                OutlinedButton.icon(
                  onPressed: () => setState(() { _selectedQr = j; _tab = 4; }),
                  icon: const Icon(Icons.qr_code_2),
                  label: const Text('QR fiche'),
                ),
              ]),
            ]),
          ),
        )),
      ],
    );
  }

  Widget _alertsTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Non lues', '$_unread', Icons.mark_email_unread_outlined),
          _kpi('Total', '${_alerts.length}', Icons.notifications_outlined),
          _kpi('Portes', '$_openDoors', Icons.sensor_door_outlined),
        ]),
        const SizedBox(height: 8),
        FilledButton.tonal(onPressed: _scanIot, child: const Text('Relancer scan IoT')),
        const SizedBox(height: 8),
        ..._alerts.map((a) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: CircleAvatar(child: Icon(_alertIcon(a.type), size: 18)),
            title: Text(a.title, style: TextStyle(fontWeight: a.read ? FontWeight.normal : FontWeight.bold)),
            subtitle: Text('${a.body}\n${a.type} · ${a.time}'),
            isThreeLine: true,
            onTap: () => setState(() => a.read = true),
            trailing: IconButton(icon: const Icon(Icons.close), onPressed: () => setState(() => _alerts.remove(a))),
          ),
        )),
      ],
    );
  }

  IconData _alertIcon(String type) => switch (type) {
        'Porte' => Icons.sensor_door,
        'Stock' => Icons.inventory_2,
        'Livraison' => Icons.local_shipping,
        'Réparation' => Icons.build,
        'Véhicule' => Icons.directions_car,
        _ => Icons.notifications,
      };

  Widget _qrTab() {
    final j = _selectedQr ?? (_jobs.isNotEmpty ? _jobs.first : null);
    if (j == null) return const Center(child: Text('Aucun ordre pour QR'));
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('QR fiche atelier', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        DropdownButtonFormField<GarageJob>(
          initialValue: j,
          decoration: const InputDecoration(labelText: 'Ordre', border: OutlineInputBorder()),
          items: _jobs.map((x) => DropdownMenuItem(value: x, child: Text('${x.id} · ${x.plate}'))).toList(),
          onChanged: (v) => setState(() => _selectedQr = v),
        ),
        const SizedBox(height: 20),
        Center(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(children: [
                QrImageView(
                  data: j.qrPayload,
                  version: QrVersions.auto,
                  size: 220,
                  backgroundColor: Colors.white,
                  eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: Colors.black),
                  dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: Colors.black),
                ),
                const SizedBox(height: 12),
                Text('${j.id} · ${j.service}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text('${j.plate} · ${j.technician}'),
                const SizedBox(height: 8),
                SelectableText(j.qrPayload, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodySmall),
              ]),
            ),
          ),
        ),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: () {
            Clipboard.setData(ClipboardData(text: j.qrPayload));
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('QR copié')));
          },
          icon: const Icon(Icons.copy),
          label: const Text('Copier payload'),
        ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () {
            setState(() {
              if (j.status == 'Ouvert') j.status = 'En cours';
              j.progress = max(j.progress, 40);
              _pushAlert('Scan QR ${j.id}', 'Fiche ${j.plate} ouverte en atelier.', 'Réparation');
            });
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Scan OK — ${j.id}')));
          },
          icon: const Icon(Icons.qr_code_scanner),
          label: const Text('Simuler scan fiche'),
        ),
      ],
    );
  }

  void _fab() {
    switch (_tab) {
      case 1:
        _addVehicle();
      case 2:
        _addJob();
      case 3:
        _scanIot();
      case 4:
        if (_jobs.isNotEmpty) setState(() => _selectedQr = _jobs[_rng.nextInt(_jobs.length)]);
      default:
        _scanIot();
    }
  }

  @override
  Widget build(BuildContext context) {
    final pages = [_dashboardTab(), _vehiclesTab(), _jobsTab(), _alertsTab(), _qrTab()];
    final labels = ['Scan IoT', 'Véhicule', 'Ordre', 'Scan IoT', 'Autre QR'];
    return Scaffold(
      appBar: AppBar(
        title: const Text('🔧 GarageSmart'),
        actions: [
          if (_unread > 0)
            IconButton(
              onPressed: () => setState(() => _tab = 3),
              icon: Badge(label: Text('$_unread'), child: const Icon(Icons.notifications_outlined)),
            ),
          IconButton(
            tooltip: widget.isDark ? 'Mode clair' : 'Mode sombre',
            onPressed: widget.onToggleTheme,
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
          ),
        ],
      ),
      body: pages[_tab],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _fab,
        icon: Icon(_tab == 1 || _tab == 2 ? Icons.add : Icons.sensors),
        label: Text(labels[_tab]),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: [
          const NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          const NavigationDestination(icon: Icon(Icons.directions_car_outlined), selectedIcon: Icon(Icons.directions_car), label: 'Véhicules'),
          const NavigationDestination(icon: Icon(Icons.build_outlined), selectedIcon: Icon(Icons.build), label: 'Atelier'),
          NavigationDestination(
            icon: Badge(isLabelVisible: _unread > 0, label: Text('$_unread'), child: const Icon(Icons.warning_amber_outlined)),
            selectedIcon: const Icon(Icons.warning_amber),
            label: 'Alertes',
          ),
          const NavigationDestination(icon: Icon(Icons.qr_code_2_outlined), selectedIcon: Icon(Icons.qr_code_2), label: 'QR'),
        ],
      ),
    );
  }
}
