import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:usine_connectee/data/demo_data.dart';

void main() => runApp(const FactoryLinkApp());

class FactoryLinkApp extends StatefulWidget {
  const FactoryLinkApp({super.key});
  @override
  State<FactoryLinkApp> createState() => _FactoryLinkAppState();
}

class _FactoryLinkAppState extends State<FactoryLinkApp> {
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
      title: 'FactoryLink — Usine connectée',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: FactoryLinkHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class FactoryAiMessage {
  FactoryAiMessage({required this.role, required this.text});
  final String role;
  final String text;
}

class FactoryLinkHome extends StatefulWidget {
  const FactoryLinkHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<FactoryLinkHome> createState() => _FactoryLinkHomeState();
}

class _FactoryLinkHomeState extends State<FactoryLinkHome> {
  int _tab = 0;
  int _lineSeq = 5;
  int _alSeq = 4;
  int _mtSeq = 5;
  final _rng = Random();
  final List<ProductionLine> _lines = List.of(initialLines);
  final List<FactoryMachine> _machines = List.of(initialMachines);
  final List<FactoryAlert> _alerts = List.of(initialAlerts);
  final List<MaintenanceOrder> _maintenance = List.of(initialMaintenance);
  final TextEditingController _searchCtrl = TextEditingController();
  final TextEditingController _aiInput = TextEditingController();
  final ScrollController _chatScroll = ScrollController();
  String _search = '';
  String _lineFilter = 'Toutes';
  final List<FactoryAiMessage> _chat = [
    FactoryAiMessage(role: 'ai', text: 'Bonjour ! Je suis FactoryBot 🏭\nOEE, lignes, capteurs IoT, maintenance ou alertes — posez votre question.'),
  ];
  bool _aiThinking = false;

  int get _runningLines => _lines.where((l) => l.status == 'En marche').length;
  int get _stoppedLines => _lines.where((l) => l.status == 'Arrêt').length;
  int get _openAlerts => _alerts.where((a) => !a.resolved).length;
  int get _machineAlerts => _machines.where((m) => m.vibration > 6 || m.temperature > 180 || m.status == 'Arrêt').length;
  double get _avgOee => _lines.isEmpty ? 0 : _lines.map((l) => l.oee).reduce((a, b) => a + b) / _lines.length;
  int get _totalOutput => _lines.fold(0, (s, l) => s + l.actualPerHour);
  double get _totalPower => _machines.fold(0.0, (s, m) => s + m.powerKw);
  int get _pendingMaint => _maintenance.where((m) => m.status != 'Terminé').length;

  List<ProductionLine> get _filteredLines {
    return _lines.where((l) {
      final q = _search.toLowerCase();
      final searchOk = q.isEmpty || l.name.toLowerCase().contains(q) || l.product.toLowerCase().contains(q) || l.id.toLowerCase().contains(q);
      final filterOk = switch (_lineFilter) {
        'En marche' => l.status == 'En marche',
        'Arrêt' => l.status == 'Arrêt',
        'OEE < 85%' => l.oee < 85 && l.status == 'En marche',
        _ => true,
      };
      return searchOk && filterOk;
    }).toList();
  }

  void _pushAlert(String title, String body, String type) {
    _alerts.insert(0, FactoryAlert(id: 'AL-${_alSeq++}'.padLeft(2, '0'), title: title, body: body, type: type, time: 'À l\'instant'));
  }

  void _scanIot() {
    setState(() {
      for (final m in _machines) {
        if (m.status == 'Arrêt') continue;
        m.temperature = double.parse((m.temperature + (_rng.nextDouble() - 0.5) * 8).clamp(20, 200).toStringAsFixed(1));
        m.vibration = double.parse((m.vibration + (_rng.nextDouble() - 0.4) * 2).clamp(0.2, 12).toStringAsFixed(1));
        m.powerKw = double.parse((m.powerKw + (_rng.nextDouble() - 0.5) * 3).clamp(1, 40).toStringAsFixed(1));
        m.uptimePct = double.parse((m.uptimePct + (_rng.nextDouble() - 0.3)).clamp(10, 100).toStringAsFixed(1));

        if (m.vibration > 6) {
          m.status = 'Alerte';
          _pushAlert('Vibration ${m.name}', '${m.vibration} mm/s > seuil 6.0 — ${m.id}', 'Vibration');
        } else if (m.temperature > 180 && m.type == 'Injection') {
          m.status = 'Alerte';
          _pushAlert('Température ${m.name}', '${m.temperature}°C proche limite — ${m.id}', 'Température');
        } else if (m.status == 'Alerte' && m.vibration <= 5 && m.temperature <= 175) {
          m.status = 'En marche';
        }
      }

      for (final l in _lines) {
        if (l.status == 'Arrêt') continue;
        l.actualPerHour = (l.actualPerHour + _rng.nextInt(11) - 5).clamp(0, l.targetPerHour + 20);
        l.oee = double.parse(((l.actualPerHour / l.targetPerHour) * 100 * (1 - l.defectRate / 100)).clamp(0, 100).toStringAsFixed(1));
        l.defectRate = double.parse((l.defectRate + (_rng.nextDouble() - 0.5) * 0.3).clamp(0, 5).toStringAsFixed(1));
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Scan IoT — $_machineAlerts machine(s) en alerte, $_totalOutput u/h')));
  }

  Future<void> _addLine() async {
    final name = TextEditingController();
    final product = TextEditingController();
    final target = TextEditingController(text: '100');
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouvelle ligne'),
        content: SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom ligne', border: OutlineInputBorder())),
            const SizedBox(height: 8),
            TextField(controller: product, decoration: const InputDecoration(labelText: 'Produit', border: OutlineInputBorder())),
            const SizedBox(height: 8),
            TextField(controller: target, decoration: const InputDecoration(labelText: 'Objectif /h', border: OutlineInputBorder()), keyboardType: TextInputType.number),
          ]),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Valider')),
        ],
      ),
    );
    if (ok == true && name.text.isNotEmpty) {
      final id = 'L-0$_lineSeq';
      _lineSeq++;
      setState(() {
        _lines.insert(0, ProductionLine(
          id: id,
          name: name.text,
          product: product.text.isNotEmpty ? product.text : 'Produit standard',
          targetPerHour: int.tryParse(target.text) ?? 100,
          actualPerHour: 0,
          status: 'Arrêt',
          oee: 0,
          shift: 'Matin',
        ));
        _pushAlert('Ligne créée', '$id — ${name.text} ajoutée au planning.', 'Système');
      });
    }
  }

  void _toggleLine(ProductionLine l) {
    setState(() {
      if (l.status == 'En marche') {
        l.status = 'Arrêt';
        l.actualPerHour = 0;
        l.oee = 0;
        _pushAlert('Arrêt ligne', '${l.name} mise à l\'arrêt.', 'Arrêt');
      } else {
        l.status = 'En marche';
        l.actualPerHour = (l.targetPerHour * 0.85).round();
        l.oee = 85;
        _pushAlert('Démarrage ligne', '${l.name} en production.', 'Système');
      }
    });
  }

  Future<void> _addMaintenance() async {
    final task = TextEditingController();
    String machineId = _machines.first.id;
    String priority = 'Normal';
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Ordre de maintenance'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              DropdownButtonFormField<String>(
                initialValue: machineId,
                decoration: const InputDecoration(labelText: 'Machine', border: OutlineInputBorder()),
                items: _machines.map((m) => DropdownMenuItem(value: m.id, child: Text('${m.id} — ${m.name}'))).toList(),
                onChanged: (v) => setLocal(() => machineId = v ?? machineId),
              ),
              const SizedBox(height: 8),
              TextField(controller: task, decoration: const InputDecoration(labelText: 'Tâche', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: priority,
                decoration: const InputDecoration(labelText: 'Priorité', border: OutlineInputBorder()),
                items: ['Urgent', 'Normal', 'Bas'].map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                onChanged: (v) => setLocal(() => priority = v ?? priority),
              ),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Créer')),
          ],
        ),
      ),
    );
    if (ok == true && task.text.isNotEmpty) {
      final machine = _machines.firstWhere((m) => m.id == machineId);
      setState(() {
        _maintenance.insert(0, MaintenanceOrder(
          id: 'MT-0$_mtSeq',
          machineId: machine.id,
          machineName: machine.name,
          task: task.text,
          priority: priority,
          dueDate: '2026-07-${10 + _mtSeq}',
        ));
        _mtSeq++;
        _pushAlert('Maintenance planifiée', '${machine.name} — ${task.text}', 'Maintenance');
      });
    }
  }

  void _showQr(FactoryMachine m) {
    _showQrDialog(m);
  }

  void _showQrDialog(FactoryMachine m) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('QR — ${m.id}'),
        content: SizedBox(
          width: 260,
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            QrImageView(
              data: m.qrPayload,
              version: QrVersions.auto,
              size: 200,
              backgroundColor: Colors.white,
              eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: Colors.black),
              dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: Colors.black),
            ),
            const SizedBox(height: 8),
            Text(m.name, textAlign: TextAlign.center),
            SelectableText(m.qrPayload, style: Theme.of(ctx).textTheme.bodySmall, textAlign: TextAlign.center),
          ]),
        ),
        actions: [
          TextButton(onPressed: () { Clipboard.setData(ClipboardData(text: m.qrPayload)); Navigator.pop(ctx); }, child: const Text('Copier')),
          FilledButton(onPressed: () => Navigator.pop(ctx), child: const Text('Fermer')),
        ],
      ),
    );
  }

  String _aiReply(String raw) {
    final q = raw.toLowerCase();
    if (q.contains('oee') || q.contains('performance')) {
      return 'OEE moyen : ${_avgOee.toStringAsFixed(1)}%.\n'
          '$_runningLines ligne(s) en marche, $_stoppedLines à l\'arrêt.\n'
          'Meilleure ligne : ${_lines.reduce((a, b) => a.oee > b.oee ? a : b).name} (${_lines.map((l) => l.oee).reduce(max).toStringAsFixed(1)}%).';
    }
    if (q.contains('ligne') || q.contains('production')) {
      final lines = _lines.map((l) => '• ${l.name} : ${l.actualPerHour}/${l.targetPerHour} u/h — ${l.status}').join('\n');
      return 'État des lignes :\n$lines\n\nProduction totale : $_totalOutput unités/h.';
    }
    if (q.contains('machine') || q.contains('capteur') || q.contains('iot')) {
      final critical = _machines.where((m) => m.status != 'En marche').map((m) => '• ${m.name} : ${m.status} (vib. ${m.vibration} mm/s)').join('\n');
      return 'Machines : ${_machines.length} installées, $_machineAlerts en alerte.\n'
          'Puissance totale : ${_totalPower.toStringAsFixed(1)} kW.\n'
          '${critical.isEmpty ? 'Toutes les machines opérationnelles.' : 'Points d\'attention :\n$critical'}';
    }
    if (q.contains('maintenance') || q.contains('mt-')) {
      final pending = _maintenance.where((m) => m.status != 'Terminé').map((m) => '• ${m.id} — ${m.machineName} : ${m.task} (${m.priority})').join('\n');
      return '$_pendingMaint ordre(s) de maintenance ouvert(s) :\n$pending';
    }
    if (q.contains('alerte') || q.contains('arrêt') || q.contains('arret')) {
      final open = _alerts.where((a) => !a.resolved).take(5).map((a) => '• ${a.title}').join('\n');
      return '$_openAlerts alerte(s) ouverte(s).\n${open.isEmpty ? 'Aucune alerte critique.' : open}';
    }
    if (q.contains('énergie') || q.contains('energie') || q.contains('kw')) {
      return 'Consommation estimée : ${_totalPower.toStringAsFixed(1)} kW.\n'
          'Poste le plus énergivore : ${_machines.reduce((a, b) => a.powerKw > b.powerKw ? a : b).name}.';
    }
    return 'Je peux vous renseigner sur l\'OEE, les lignes de production, les capteurs IoT, la maintenance et les alertes. Essayez : « Quel est l\'OEE ? » ou « Machines en alerte ».';
  }

  Future<void> _sendAi([String? preset]) async {
    final text = (preset ?? _aiInput.text).trim();
    if (text.isEmpty || _aiThinking) return;
    setState(() {
      _chat.add(FactoryAiMessage(role: 'user', text: text));
      _aiInput.clear();
      _aiThinking = true;
    });
    await Future<void>.delayed(Duration(milliseconds: 500 + _rng.nextInt(700)));
    if (!mounted) return;
    setState(() {
      _chat.add(FactoryAiMessage(role: 'ai', text: _aiReply(text)));
      _aiThinking = false;
    });
    await Future<void>.delayed(const Duration(milliseconds: 80));
    if (_chatScroll.hasClients) _chatScroll.jumpTo(_chatScroll.position.maxScrollExtent);
  }

  Widget _kpi(String label, String value, IconData icon, {Color? accent}) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, size: 18, color: accent),
            const SizedBox(height: 6),
            Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: accent)),
            Text(label, style: Theme.of(context).textTheme.bodySmall),
          ]),
        ),
      ),
    );
  }

  IconData _alertIcon(String type) => switch (type) {
        'Vibration' => Icons.vibration,
        'Température' => Icons.thermostat,
        'Arrêt' => Icons.stop_circle_outlined,
        'Qualité' => Icons.fact_check_outlined,
        'Énergie' => Icons.bolt_outlined,
        'Maintenance' => Icons.build_outlined,
        _ => Icons.notifications,
      };

  Widget _dashboardTab() {
    final critical = _alerts.where((a) => !a.resolved).take(4).toList();
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Text('FactoryLink · Usine connectée', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Row(children: [
          _kpi('OEE moy.', '${_avgOee.toStringAsFixed(1)}%', Icons.speed, accent: _avgOee < 85 ? Colors.orange : null),
          _kpi('Lignes actives', '$_runningLines/${_lines.length}', Icons.precision_manufacturing_outlined),
          _kpi('Production', '$_totalOutput u/h', Icons.trending_up),
        ]),
        const SizedBox(height: 4),
        Row(children: [
          _kpi('Alertes', '$_openAlerts', Icons.warning_amber_outlined, accent: _openAlerts > 0 ? Colors.orange : null),
          _kpi('Machines', '$_machineAlerts alerte(s)', Icons.sensors, accent: _machineAlerts > 0 ? Colors.redAccent : null),
          _kpi('Énergie', '${_totalPower.toStringAsFixed(0)} kW', Icons.bolt_outlined),
        ]),
        const SizedBox(height: 12),
        Card(
          child: ListTile(
            leading: const Icon(Icons.sensors),
            title: const Text('Scan IoT temps réel'),
            subtitle: Text('${_machines.length} machines · ${_lines.length} lignes · maintenance $_pendingMaint'),
            trailing: FilledButton.tonal(onPressed: _scanIot, child: const Text('Scanner')),
          ),
        ),
        const SizedBox(height: 12),
        Text('Lignes de production', style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 6),
        ..._lines.take(4).map((l) => Card(
          margin: const EdgeInsets.only(bottom: 6),
          child: ListTile(
            leading: Icon(l.status == 'En marche' ? Icons.play_circle_outline : Icons.pause_circle_outline),
            title: Text(l.name),
            subtitle: Text('${l.actualPerHour}/${l.targetPerHour} u/h · OEE ${l.oee}%'),
            trailing: Chip(label: Text(l.status), visualDensity: VisualDensity.compact),
            onTap: () => setState(() => _tab = 1),
          ),
        )),
        const SizedBox(height: 8),
        Text('Alertes récentes', style: Theme.of(context).textTheme.titleSmall),
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
          ActionChip(avatar: const Icon(Icons.precision_manufacturing, size: 18), label: const Text('Lignes'), onPressed: () => setState(() => _tab = 1)),
          ActionChip(avatar: const Icon(Icons.build, size: 18), label: const Text('Maintenance'), onPressed: () => setState(() => _tab = 4)),
          ActionChip(avatar: const Icon(Icons.smart_toy, size: 18), label: const Text('FactoryBot'), onPressed: () => setState(() => _tab = 5)),
        ]),
      ],
    );
  }

  Widget _linesTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Lignes', '${_lines.length}', Icons.factory_outlined),
          _kpi('En marche', '$_runningLines', Icons.play_arrow),
          _kpi('Arrêt', '$_stoppedLines', Icons.stop, accent: _stoppedLines > 0 ? Colors.orange : null),
        ]),
        const SizedBox(height: 8),
        TextField(
          controller: _searchCtrl,
          decoration: InputDecoration(
            hintText: 'Ligne, produit, ID…',
            prefixIcon: const Icon(Icons.search),
            border: const OutlineInputBorder(),
            suffixIcon: _search.isEmpty ? null : IconButton(icon: const Icon(Icons.clear), onPressed: () => setState(() { _search = ''; _searchCtrl.clear(); })),
          ),
          onChanged: (v) => setState(() => _search = v),
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(children: [
            for (final f in ['Toutes', 'En marche', 'Arrêt', 'OEE < 85%'])
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: FilterChip(label: Text(f), selected: _lineFilter == f, onSelected: (_) => setState(() => _lineFilter = f)),
              ),
          ]),
        ),
        const SizedBox(height: 8),
        ..._filteredLines.map((l) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(l.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text('${l.id} · ${l.product} · ${l.shift}'),
                ])),
                Chip(label: Text(l.status), visualDensity: VisualDensity.compact),
              ]),
              const SizedBox(height: 8),
              Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Cadence'),
                  Text('${l.actualPerHour} / ${l.targetPerHour} u/h', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                ])),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('OEE'),
                  Text('${l.oee}%', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: l.oee < 85 ? Colors.orange : null)),
                ])),
              ]),
              const SizedBox(height: 6),
              LinearProgressIndicator(value: l.targetPerHour == 0 ? 0 : (l.actualPerHour / l.targetPerHour).clamp(0, 1), minHeight: 6),
              Text('Défauts ${l.defectRate}%', style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 8),
              Row(children: [
                FilledButton.tonal(onPressed: () => _toggleLine(l), child: Text(l.status == 'En marche' ? 'Arrêter' : 'Démarrer')),
                const SizedBox(width: 8),
                OutlinedButton.icon(onPressed: _scanIot, icon: const Icon(Icons.sensors, size: 18), label: const Text('IoT')),
              ]),
            ]),
          ),
        )),
        if (_filteredLines.isEmpty) const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('Aucune ligne.'))),
      ],
    );
  }

  Widget _machinesTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Machines', '${_machines.length}', Icons.settings_input_component),
          _kpi('Alertes', '$_machineAlerts', Icons.warning_amber_outlined, accent: _machineAlerts > 0 ? Colors.orange : null),
          _kpi('Uptime moy.', '${(_machines.map((m) => m.uptimePct).reduce((a, b) => a + b) / _machines.length).toStringAsFixed(0)}%', Icons.timer_outlined),
        ]),
        const SizedBox(height: 8),
        FilledButton.icon(onPressed: _scanIot, icon: const Icon(Icons.refresh), label: const Text('Actualiser capteurs IoT')),
        const SizedBox(height: 12),
        ..._machines.map((m) {
          final alert = m.vibration > 6 || m.temperature > 180 || m.status == 'Arrêt';
          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Icon(_machineIcon(m.type)),
                  const SizedBox(width: 8),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(m.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text('${m.id} · ${m.line}'),
                  ])),
                  Chip(label: Text(m.status), visualDensity: VisualDensity.compact),
                ]),
                const SizedBox(height: 12),
                Row(children: [
                  _sensorCol('Temp.', '${m.temperature}°C', alert && m.temperature > 180),
                  _sensorCol('Vibr.', '${m.vibration} mm/s', m.vibration > 6),
                  _sensorCol('Puiss.', '${m.powerKw} kW', false),
                ]),
                const SizedBox(height: 8),
                LinearProgressIndicator(value: m.uptimePct / 100, minHeight: 6),
                Text('Uptime ${m.uptimePct}% · maintenance ${m.lastMaintenance}', style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 8),
                Row(children: [
                  OutlinedButton.icon(onPressed: () => _showQr(m), icon: const Icon(Icons.qr_code_2, size: 18), label: const Text('QR')),
                  const SizedBox(width: 8),
                  if (m.status == 'Arrêt')
                    FilledButton.tonal(onPressed: () => setState(() { m.status = 'En marche'; _pushAlert('Redémarrage', '${m.name} remise en service.', 'Système'); }), child: const Text('Redémarrer')),
                ]),
              ]),
            ),
          );
        }),
      ],
    );
  }

  IconData _machineIcon(String type) => switch (type) {
        'Robot' => Icons.smart_toy_outlined,
        'Injection' => Icons.opacity_outlined,
        'Soudure' => Icons.whatshot_outlined,
        'Convoyeur' => Icons.conveyor_belt,
        _ => Icons.precision_manufacturing_outlined,
      };

  Widget _sensorCol(String label, String value, bool warn) {
    return Expanded(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: Theme.of(context).textTheme.bodySmall),
        Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: warn ? Colors.orange : null)),
      ]),
    );
  }

  Widget _alertsTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Ouvertes', '$_openAlerts', Icons.notifications_active_outlined),
          _kpi('Total', '${_alerts.length}', Icons.list_alt),
          _kpi('Types', '${alertTypes.length}', Icons.category_outlined),
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
                if (v == 'resolve') { a.resolved = true; a.read = true; }
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

  Widget _maintenanceTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Ouverts', '$_pendingMaint', Icons.build_circle_outlined),
          _kpi('Urgent', '${_maintenance.where((m) => m.priority == 'Urgent' && m.status != 'Terminé').length}', Icons.priority_high, accent: Colors.orange),
          _kpi('Terminés', '${_maintenance.where((m) => m.status == 'Terminé').length}', Icons.check_circle_outline),
        ]),
        const SizedBox(height: 8),
        ..._maintenance.map((m) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: CircleAvatar(child: Text(m.priority[0])),
            title: Text('${m.id} — ${m.machineName}'),
            subtitle: Text('${m.task}\nÉchéance ${m.dueDate} · ${m.priority} · ${m.status}'),
            isThreeLine: true,
            trailing: PopupMenuButton<String>(
              onSelected: (v) => setState(() {
                if (v == 'start') m.status = 'En cours';
                if (v == 'done') {
                  m.status = 'Terminé';
                  _pushAlert('Maintenance terminée', '${m.machineName} — ${m.task}', 'Maintenance');
                }
              }),
              itemBuilder: (_) => [
                if (m.status == 'Planifié') const PopupMenuItem(value: 'start', child: Text('Démarrer')),
                if (m.status != 'Terminé') const PopupMenuItem(value: 'done', child: Text('Terminer')),
              ],
            ),
          ),
        )),
      ],
    );
  }

  Widget _aiTab() {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            controller: _chatScroll,
            padding: const EdgeInsets.all(12),
            itemCount: _chat.length + (_aiThinking ? 1 : 0),
            itemBuilder: (ctx, i) {
              if (_aiThinking && i == _chat.length) {
                return const Align(alignment: Alignment.centerLeft, child: Padding(padding: EdgeInsets.all(8), child: Chip(label: Text('FactoryBot réfléchit…'))));
              }
              final msg = _chat[i];
              final isAi = msg.role == 'ai';
              return Align(
                alignment: isAi ? Alignment.centerLeft : Alignment.centerRight,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.85),
                  decoration: BoxDecoration(
                    color: isAi ? Theme.of(context).colorScheme.surfaceContainerHighest : Theme.of(context).colorScheme.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(msg.text, style: TextStyle(color: isAi ? null : Theme.of(context).colorScheme.onPrimary)),
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
          child: Wrap(spacing: 6, runSpacing: 6, children: [
            ActionChip(label: const Text('OEE ?'), onPressed: () => _sendAi('Quel est l\'OEE ?')),
            ActionChip(label: const Text('Machines alerte'), onPressed: () => _sendAi('Machines en alerte')),
            ActionChip(label: const Text('Maintenance'), onPressed: () => _sendAi('État maintenance')),
          ]),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
          child: Row(children: [
            Expanded(child: TextField(controller: _aiInput, decoration: const InputDecoration(hintText: 'Demandez à FactoryBot…', border: OutlineInputBorder()), onSubmitted: (_) => _sendAi())),
            const SizedBox(width: 8),
            FilledButton(onPressed: _aiThinking ? null : () => _sendAi(), child: const Icon(Icons.send)),
          ]),
        ),
      ],
    );
  }

  void _fabAction() {
    switch (_tab) {
      case 1:
        _addLine();
      case 2:
        _scanIot();
      case 3:
        setState(() => _pushAlert('Test système', 'Alerte manuelle FactoryLink', 'Système'));
      case 4:
        _addMaintenance();
      case 5:
        _sendAi('Résumé usine');
      default:
        _scanIot();
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _aiInput.dispose();
    _chatScroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pages = [_dashboardTab(), _linesTab(), _machinesTab(), _alertsTab(), _maintenanceTab(), _aiTab()];
    final fabLabels = ['Scan IoT', 'Ligne', 'Capteurs', 'Alerte', 'Maintenance', 'Résumé IA'];
    return Scaffold(
      appBar: AppBar(
        title: const Text('🏭 FactoryLink'),
        actions: [
          if (_openAlerts > 0)
            IconButton(
              tooltip: 'Alertes',
              onPressed: () => setState(() => _tab = 3),
              icon: Badge(label: Text('$_openAlerts'), child: const Icon(Icons.notifications_outlined)),
            ),
          IconButton(tooltip: 'Actualiser IoT', onPressed: _scanIot, icon: const Icon(Icons.sensors)),
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
        icon: Icon(_tab == 1 ? Icons.add : _tab == 4 ? Icons.build : _tab == 5 ? Icons.smart_toy : Icons.refresh),
        label: Text(fabLabels[_tab]),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: [
          const NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          const NavigationDestination(icon: Icon(Icons.precision_manufacturing_outlined), selectedIcon: Icon(Icons.precision_manufacturing), label: 'Lignes'),
          const NavigationDestination(icon: Icon(Icons.sensors_outlined), selectedIcon: Icon(Icons.sensors), label: 'Machines'),
          NavigationDestination(
            icon: Badge(isLabelVisible: _openAlerts > 0, label: Text('$_openAlerts'), child: const Icon(Icons.warning_amber_outlined)),
            selectedIcon: const Icon(Icons.warning_amber),
            label: 'Alertes',
          ),
          const NavigationDestination(icon: Icon(Icons.build_outlined), selectedIcon: Icon(Icons.build), label: 'Maint.'),
          const NavigationDestination(icon: Icon(Icons.smart_toy_outlined), selectedIcon: Icon(Icons.smart_toy), label: 'IA'),
        ],
      ),
    );
  }
}
