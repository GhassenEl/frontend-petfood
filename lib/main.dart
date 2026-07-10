import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:actpharma_smart/data/demo_data.dart';

void main() => runApp(const ActPharmaApp());

class ActPharmaApp extends StatefulWidget {
  const ActPharmaApp({super.key});
  @override
  State<ActPharmaApp> createState() => _ActPharmaAppState();
}

class _ActPharmaAppState extends State<ActPharmaApp> {
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
      title: 'ActPharma — Pharmacie intelligente',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: ActPharmaHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class ActPharmaHome extends StatefulWidget {
  const ActPharmaHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<ActPharmaHome> createState() => _ActPharmaHomeState();
}

class _ActPharmaHomeState extends State<ActPharmaHome> {
  int _tab = 0;
  int _alertSeq = 502;
  int _medSeq = 107;
  String _stockFilter = 'Tous';
  String _search = '';
  final _rng = Random();
  final List<PharmaMed> _meds = List.of(initialMeds);
  final List<SensorReading> _sensors = List.of(initialSensors);
  final List<PharmaAlert> _alerts = List.of(initialAlerts);
  final TextEditingController _searchCtrl = TextEditingController();
  PharmaMed? _selectedQr;

  int get _lowStock => _meds.where((m) => m.isLowStock && !m.isRupture).length;
  int get _ruptures => _meds.where((m) => m.isRupture).length;
  int get _openAlerts => _alerts.where((a) => !a.resolved).length;
  int get _sensorAlerts => _sensors.where((s) => s.status == 'Alerte').length;
  double get _avgTemp => _sensors.isEmpty ? 0 : _sensors.map((s) => s.temperature).reduce((a, b) => a + b) / _sensors.length;
  double get _avgHum => _sensors.isEmpty ? 0 : _sensors.map((s) => s.humidity).reduce((a, b) => a + b) / _sensors.length;

  List<PharmaMed> get _filteredMeds {
    return _meds.where((m) {
      final q = _search.toLowerCase();
      final searchOk = q.isEmpty || m.name.toLowerCase().contains(q) || m.id.toLowerCase().contains(q) || m.zone.toLowerCase().contains(q);
      final filterOk = switch (_stockFilter) {
        'Bas' => m.isLowStock && !m.isRupture,
        'Rupture' => m.isRupture,
        'Froid' => m.category == 'Froid',
        _ => true,
      };
      return searchOk && filterOk;
    }).toList();
  }

  void _pushAlert(String title, String body, String type) {
    _alerts.insert(0, PharmaAlert(id: 'AL-${_alertSeq++}', title: title, body: body, type: type, time: 'À l\'instant'));
  }

  void _refreshSensors() {
    setState(() {
      for (final s in _sensors) {
        final isFridge = s.zone.startsWith('Frigo');
        final baseTemp = isFridge ? 5.0 : 21.0;
        final jitter = (_rng.nextDouble() - 0.4) * (isFridge ? 6 : 4);
        s.temperature = double.parse((baseTemp + jitter).toStringAsFixed(1));
        s.humidity = double.parse((40 + _rng.nextDouble() * 25).toStringAsFixed(0));
        s.updatedAt = 'À l\'instant';

        final coldMeds = _meds.where((m) => m.zone == s.zone);
        var ok = true;
        for (final m in coldMeds) {
          if (s.temperature < m.tempMin || s.temperature > m.tempMax) {
            ok = false;
            _pushAlert('Température ${s.zone}', '${s.temperature}°C hors plage pour ${m.name} (${m.tempMin}–${m.tempMax}°C)', 'Température');
          }
          if (s.humidity > m.humidityMax) {
            ok = false;
            _pushAlert('Humidité ${s.zone}', '${s.humidity}% > max ${m.humidityMax}% (${m.name})', 'Humidité');
          }
        }
        if (coldMeds.isEmpty) {
          if (isFridge && (s.temperature < 2 || s.temperature > 8)) ok = false;
          if (!isFridge && (s.temperature < 15 || s.temperature > 25)) ok = false;
          if (s.humidity > 65) ok = false;
        }
        s.status = ok ? 'OK' : 'Alerte';
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Capteurs actualisés')));
  }

  void _addMed() async {
    final name = TextEditingController();
    final stock = TextEditingController(text: '30');
    final zone = TextEditingController(text: 'Zone A');
    String category = 'Autre';
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Nouveau médicament'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: category,
                decoration: const InputDecoration(labelText: 'Catégorie', border: OutlineInputBorder()),
                items: medCategories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (v) => setLocal(() => category = v ?? category),
              ),
              const SizedBox(height: 8),
              TextField(controller: stock, decoration: const InputDecoration(labelText: 'Stock', border: OutlineInputBorder()), keyboardType: TextInputType.number),
              const SizedBox(height: 8),
              TextField(controller: zone, decoration: const InputDecoration(labelText: 'Zone', border: OutlineInputBorder())),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Valider')),
          ],
        ),
      ),
    );
    if (ok == true && name.text.isNotEmpty) {
      final id = 'MED-${_medSeq++}';
      final cold = category == 'Froid';
      setState(() {
        _meds.insert(0, PharmaMed(
          id: id,
          name: name.text,
          category: category,
          stock: int.tryParse(stock.text) ?? 30,
          minStock: 15,
          zone: zone.text.isNotEmpty ? zone.text : 'Zone A',
          tempMin: cold ? 2 : 15,
          tempMax: cold ? 8 : 25,
          humidityMax: cold ? 55 : 60,
          expiry: '2027-12',
          qrPayload: 'ACTPHARMA|$id|${name.text}|${zone.text}',
        ));
        _pushAlert('Stock — ${name.text}', 'Médicament ajouté ($id) — synchro Act Pharma', 'Stock');
      });
    }
  }

  void _adjustStock(PharmaMed m, int delta) {
    setState(() {
      m.stock = (m.stock + delta).clamp(0, 9999);
      if (m.isRupture) {
        _pushAlert('Rupture — ${m.name}', '${m.id} en rupture de stock.', 'Stock');
      } else if (m.isLowStock) {
        _pushAlert('Stock bas — ${m.name}', '${m.stock} ≤ seuil ${m.minStock}.', 'Stock');
      }
    });
  }

  void _showQr(PharmaMed m) {
    setState(() {
      _selectedQr = m;
      _tab = 4;
    });
  }

  Widget _kpi(String label, String value, IconData icon, {Color? accent}) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, size: 18, color: accent),
            const SizedBox(height: 6),
            Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: accent)),
            Text(label, style: Theme.of(context).textTheme.bodySmall),
          ]),
        ),
      ),
    );
  }

  Widget _dashboardTab() {
    final critical = _alerts.where((a) => !a.resolved).take(4).toList();
    final coldOk = _sensors.where((s) => s.zone.startsWith('Frigo')).every((s) => s.status == 'OK');
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Text('Act Pharma · Pharmacie intelligente', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Row(children: [
          _kpi('Alertes', '$_openAlerts', Icons.warning_amber_outlined, accent: _openAlerts > 0 ? Colors.orange : null),
          _kpi('Stock bas', '$_lowStock', Icons.inventory_2_outlined),
          _kpi('Ruptures', '$_ruptures', Icons.error_outline, accent: _ruptures > 0 ? Colors.redAccent : null),
        ]),
        const SizedBox(height: 4),
        Row(children: [
          _kpi('Temp. moy.', '${_avgTemp.toStringAsFixed(1)}°C', Icons.thermostat_outlined),
          _kpi('Humid. moy.', '${_avgHum.toStringAsFixed(0)}%', Icons.water_drop_outlined),
          _kpi('Capteurs', '$_sensorAlerts alerte(s)', Icons.sensors, accent: _sensorAlerts > 0 ? Colors.orange : null),
        ]),
        const SizedBox(height: 12),
        Card(
          child: ListTile(
            leading: Icon(coldOk ? Icons.check_circle_outline : Icons.ac_unit, color: coldOk ? null : Colors.orange),
            title: Text(coldOk ? 'Chaîne du froid OK' : 'Chaîne du froid à vérifier'),
            subtitle: Text(_sensors.where((s) => s.zone.startsWith('Frigo')).map((s) => '${s.zone}: ${s.temperature}°C / ${s.humidity}%').join(' · ')),
            trailing: FilledButton.tonal(onPressed: _refreshSensors, child: const Text('Scan')),
          ),
        ),
        const SizedBox(height: 12),
        Text('Dernières alertes', style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 6),
        ...critical.map((a) => Card(
          margin: const EdgeInsets.only(bottom: 6),
          child: ListTile(
            leading: Icon(_alertIcon(a.type)),
            title: Text(a.title),
            subtitle: Text(a.body),
            trailing: Text(a.time, style: Theme.of(context).textTheme.bodySmall),
            onTap: () => setState(() => _tab = 3),
          ),
        )),
        if (critical.isEmpty) const Card(child: ListTile(title: Text('Aucune alerte ouverte'))),
        const SizedBox(height: 8),
        Wrap(spacing: 8, runSpacing: 8, children: [
          ActionChip(avatar: const Icon(Icons.inventory_2, size: 18), label: const Text('Stock'), onPressed: () => setState(() => _tab = 1)),
          ActionChip(avatar: const Icon(Icons.thermostat, size: 18), label: const Text('Capteurs'), onPressed: () => setState(() => _tab = 2)),
          ActionChip(avatar: const Icon(Icons.qr_code_2, size: 18), label: const Text('QR'), onPressed: () => setState(() { _selectedQr ??= _meds.first; _tab = 4; })),
        ]),
      ],
    );
  }

  IconData _alertIcon(String type) => switch (type) {
        'Température' => Icons.thermostat,
        'Humidité' => Icons.water_drop,
        'Stock' => Icons.inventory_2,
        'Péremption' => Icons.event_busy,
        'QR' => Icons.qr_code,
        _ => Icons.notifications,
      };

  Widget _stockTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Références', '${_meds.length}', Icons.medication_outlined),
          _kpi('Bas', '$_lowStock', Icons.trending_down),
          _kpi('Ruptures', '$_ruptures', Icons.block),
        ]),
        const SizedBox(height: 8),
        TextField(
          controller: _searchCtrl,
          decoration: InputDecoration(
            hintText: 'Nom, ID, zone…',
            prefixIcon: const Icon(Icons.search),
            border: const OutlineInputBorder(),
            suffixIcon: _search.isEmpty
                ? null
                : IconButton(icon: const Icon(Icons.clear), onPressed: () => setState(() { _search = ''; _searchCtrl.clear(); })),
          ),
          onChanged: (v) => setState(() => _search = v),
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(children: [
            for (final f in ['Tous', 'Bas', 'Rupture', 'Froid'])
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: FilterChip(label: Text(f), selected: _stockFilter == f, onSelected: (_) => setState(() => _stockFilter = f)),
              ),
          ]),
        ),
        const SizedBox(height: 8),
        ..._filteredMeds.map((m) {
          final badge = m.isRupture ? 'Rupture' : m.isLowStock ? 'Stock bas' : 'OK';
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(m.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Text('${m.id} · ${m.category} · ${m.zone}'),
                    ]),
                  ),
                  Chip(label: Text(badge), visualDensity: VisualDensity.compact),
                ]),
                const SizedBox(height: 6),
                Text('Stock ${m.stock} ${m.unit} · seuil ${m.minStock} · exp. ${m.expiry}'),
                Text('Plage ${m.tempMin}–${m.tempMax}°C · humidité max ${m.humidityMax}%', style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 8),
                Row(children: [
                  IconButton.filledTonal(onPressed: () => _adjustStock(m, -1), icon: const Icon(Icons.remove)),
                  Text('${m.stock}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  IconButton.filledTonal(onPressed: () => _adjustStock(m, 1), icon: const Icon(Icons.add)),
                  const Spacer(),
                  OutlinedButton.icon(onPressed: () => _showQr(m), icon: const Icon(Icons.qr_code_2), label: const Text('QR')),
                ]),
              ]),
            ),
          );
        }),
        if (_filteredMeds.isEmpty) const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('Aucun médicament.'))),
      ],
    );
  }

  Widget _sensorsTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Zones', '${_sensors.length}', Icons.map_outlined),
          _kpi('Alertes', '$_sensorAlerts', Icons.warning_amber_outlined, accent: _sensorAlerts > 0 ? Colors.orange : null),
          _kpi('Scan', 'Live', Icons.sensors),
        ]),
        const SizedBox(height: 8),
        FilledButton.icon(onPressed: _refreshSensors, icon: const Icon(Icons.refresh), label: const Text('Actualiser température & humidité')),
        const SizedBox(height: 12),
        ..._sensors.map((s) {
          final medsInZone = _meds.where((m) => m.zone == s.zone).toList();
          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Icon(s.zone.startsWith('Frigo') ? Icons.kitchen_outlined : Icons.warehouse_outlined),
                  const SizedBox(width: 8),
                  Expanded(child: Text(s.zone, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
                  Chip(label: Text(s.status), visualDensity: VisualDensity.compact),
                ]),
                const SizedBox(height: 12),
                Row(children: [
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Température'),
                      Text('${s.temperature}°C', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                    ]),
                  ),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Humidité'),
                      Text('${s.humidity.toStringAsFixed(0)}%', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                    ]),
                  ),
                ]),
                const SizedBox(height: 8),
                LinearProgressIndicator(value: (s.humidity / 100).clamp(0, 1), minHeight: 6),
                const SizedBox(height: 6),
                Text('Mis à jour ${s.updatedAt}', style: Theme.of(context).textTheme.bodySmall),
                if (medsInZone.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text('Médicaments : ${medsInZone.map((m) => m.name).join(', ')}', style: Theme.of(context).textTheme.bodySmall),
                ],
              ]),
            ),
          );
        }),
      ],
    );
  }

  Widget _alertsTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Ouvertes', '$_openAlerts', Icons.notifications_active_outlined),
          _kpi('Total', '${_alerts.length}', Icons.list_alt),
          _kpi('Lues', '${_alerts.where((a) => a.read).length}', Icons.mark_email_read_outlined),
        ]),
        const SizedBox(height: 8),
        ..._alerts.map((a) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          color: a.resolved ? null : Theme.of(context).colorScheme.surfaceContainerHighest,
          child: ListTile(
            leading: CircleAvatar(child: Icon(_alertIcon(a.type), size: 18)),
            title: Text(a.title, style: TextStyle(fontWeight: a.read ? FontWeight.normal : FontWeight.bold)),
            subtitle: Text('${a.body}\n${a.type} · ${a.time}${a.resolved ? ' · Résolue' : ''}'),
            isThreeLine: true,
            trailing: PopupMenuButton<String>(
              onSelected: (v) => setState(() {
                if (v == 'read') a.read = true;
                if (v == 'resolve') {
                  a.resolved = true;
                  a.read = true;
                }
                if (v == 'delete') _alerts.remove(a);
              }),
              itemBuilder: (_) => const [
                PopupMenuItem(value: 'read', child: Text('Marquer lu')),
                PopupMenuItem(value: 'resolve', child: Text('Résoudre')),
                PopupMenuItem(value: 'delete', child: Text('Supprimer')),
              ],
            ),
            onTap: () => setState(() => a.read = true),
          ),
        )),
      ],
    );
  }

  Widget _qrTab() {
    final med = _selectedQr ?? (_meds.isNotEmpty ? _meds.first : null);
    if (med == null) {
      return const Center(child: Text('Aucun médicament pour QR'));
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('QR Code Act Pharma', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        DropdownButtonFormField<PharmaMed>(
          initialValue: med,
          decoration: const InputDecoration(labelText: 'Médicament', border: OutlineInputBorder()),
          items: _meds.map((m) => DropdownMenuItem(value: m, child: Text('${m.id} — ${m.name}'))).toList(),
          onChanged: (v) => setState(() => _selectedQr = v),
        ),
        const SizedBox(height: 20),
        Center(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(children: [
                QrImageView(
                  data: med.qrPayload,
                  version: QrVersions.auto,
                  size: 220,
                  backgroundColor: Colors.white,
                  eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: Colors.black),
                  dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: Colors.black),
                ),
                const SizedBox(height: 12),
                Text(med.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text('${med.id} · ${med.zone}'),
                const SizedBox(height: 8),
                SelectableText(med.qrPayload, style: Theme.of(context).textTheme.bodySmall, textAlign: TextAlign.center),
              ]),
            ),
          ),
        ),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: () {
            Clipboard.setData(ClipboardData(text: med.qrPayload));
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payload QR copié')));
            setState(() => _pushAlert('QR scanné / export', '${med.name} (${med.id}) — payload copié', 'QR'));
          },
          icon: const Icon(Icons.copy),
          label: const Text('Copier payload QR'),
        ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () {
            setState(() {
              _pushAlert('Scan QR — ${med.name}', 'Identification ${med.id} en ${med.zone}. Stock ${med.stock}.', 'QR');
              _tab = 3;
            });
          },
          icon: const Icon(Icons.qr_code_scanner),
          label: const Text('Simuler scan → alerte'),
        ),
      ],
    );
  }

  void _fabAction() {
    switch (_tab) {
      case 1:
        _addMed();
      case 2:
        _refreshSensors();
      case 3:
        setState(() => _pushAlert('Test système', 'Alerte manuelle Act Pharma', 'Système'));
      case 4:
        if (_meds.isNotEmpty) _showQr(_meds[_rng.nextInt(_meds.length)]);
      default:
        _refreshSensors();
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pages = [_dashboardTab(), _stockTab(), _sensorsTab(), _alertsTab(), _qrTab()];
    final fabLabels = ['Scan IoT', 'Médicament', 'Actualiser', 'Alerte', 'QR aléatoire'];
    return Scaffold(
      appBar: AppBar(
        title: const Text('💊 ActPharma'),
        actions: [
          if (_openAlerts > 0)
            IconButton(
              tooltip: 'Alertes',
              onPressed: () => setState(() => _tab = 3),
              icon: Badge(label: Text('$_openAlerts'), child: const Icon(Icons.notifications_outlined)),
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
        onPressed: _fabAction,
        icon: Icon(_tab == 1 ? Icons.add : _tab == 4 ? Icons.qr_code_2 : Icons.refresh),
        label: Text(fabLabels[_tab]),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: [
          const NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          const NavigationDestination(icon: Icon(Icons.inventory_2_outlined), selectedIcon: Icon(Icons.inventory_2), label: 'Stock'),
          const NavigationDestination(icon: Icon(Icons.thermostat_outlined), selectedIcon: Icon(Icons.thermostat), label: 'Capteurs'),
          NavigationDestination(
            icon: Badge(isLabelVisible: _openAlerts > 0, label: Text('$_openAlerts'), child: const Icon(Icons.warning_amber_outlined)),
            selectedIcon: const Icon(Icons.warning_amber),
            label: 'Alertes',
          ),
          const NavigationDestination(icon: Icon(Icons.qr_code_2_outlined), selectedIcon: Icon(Icons.qr_code_2), label: 'QR'),
        ],
      ),
    );
  }
}
