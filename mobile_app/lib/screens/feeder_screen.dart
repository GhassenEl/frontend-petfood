import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/models.dart';
import '../services/auth_service.dart';
import '../services/repositories.dart';

class FeederScreen extends StatefulWidget {
  const FeederScreen({super.key, required this.auth});

  final AuthService auth;

  @override
  State<FeederScreen> createState() => _FeederScreenState();
}

class _FeederScreenState extends State<FeederScreen> {
  late final FeederRepository _repo = FeederRepository(widget.auth.api);
  List<PetFeeder> _feeders = [];
  PetFeeder? _selected;
  NutritionPlan? _plan;
  bool _loading = true;
  double _grams = 30;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final list = await _repo.listFeeders();
      PetFeeder? sel = list.isNotEmpty ? list.first : null;
      if (sel != null) {
        sel = await _repo.getFeeder(sel.id);
        _plan = await _repo.nutritionPlan(sel.id);
        _grams = _plan?.portionGrams.toDouble() ?? 30;
      }
      setState(() {
        _feeders = list;
        _selected = sel;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _selectFeeder(PetFeeder f) async {
    setState(() => _loading = true);
    try {
      final detail = await _repo.getFeeder(f.id);
      final plan = await _repo.nutritionPlan(f.id);
      setState(() {
        _selected = detail;
        _plan = plan;
        _grams = plan.portionGrams.toDouble();
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _dispense() async {
    if (_selected == null) return;
    try {
      await _repo.dispense(_selected!.id, _grams);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Commande envoyée : ${_grams.toInt()} g'), backgroundColor: Colors.green),
      );
      await _selectFeeder(_selected!);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _addFeeder() async {
    try {
      final f = await _repo.registerFeeder();
      await _load();
      await _selectFeeder(f);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _applyPlan() async {
    if (_selected == null) return;
    try {
      await _repo.applySchedules(_selected!.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Planning 8h / 18h appliqué'), backgroundColor: Colors.green),
      );
      await _selectFeeder(_selected!);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final f = _selected;
    return RefreshIndicator(
      onRefresh: _load,
      child: CustomScrollView(
        slivers: [
          SliverAppBar.large(
            title: const Text('Distributeur IoT'),
            backgroundColor: const Color(0xFFDBEAFE),
          ),
          if (_loading && f == null)
            const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
          else if (_feeders.isEmpty)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.pets, size: 64, color: Colors.grey),
                    const SizedBox(height: 16),
                    const Text('Aucun distributeur'),
                    const SizedBox(height: 16),
                    FilledButton.icon(
                      onPressed: _addFeeder,
                      icon: const Icon(Icons.add),
                      label: const Text('Ajouter ESP32'),
                    ),
                  ],
                ),
              ),
            )
          else ...[
            SliverToBoxAdapter(
              child: SizedBox(
                height: 48,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: _feeders.map((item) {
                    final sel = item.id == f?.id;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text('${item.isOnline ? '🟢' : '⚫'} ${item.name}'),
                        selected: sel,
                        onSelected: (_) => _selectFeeder(item),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
            if (f != null)
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    if (f.isLowFood)
                      Card(
                        color: Colors.red.shade50,
                        child: const ListTile(
                          leading: Icon(Icons.warning, color: Colors.red),
                          title: Text('Réservoir bas — LED rouge'),
                        ),
                      ),
                    _statusCard(f),
                    const SizedBox(height: 12),
                    _dispenseCard(f),
                    if (_plan != null) ...[
                      const SizedBox(height: 12),
                      _planCard(_plan!),
                    ],
                    const SizedBox(height: 12),
                    _schedulesCard(f),
                    const SizedBox(height: 12),
                    _logsCard(f),
                    const SizedBox(height: 12),
                    _deviceKeyCard(f),
                  ]),
                ),
              ),
          ],
        ],
      ),
    );
  }

  Widget _statusCard(PetFeeder f) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(f.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              _row('Statut', f.isOnline ? 'En ligne' : 'Hors ligne'),
              _row('Animal détecté', f.animalPresent ? 'Oui' : 'Non'),
              _row('Réservoir', f.reservoirCm != null ? '${f.reservoirCm!.toStringAsFixed(1)} cm' : '—'),
              _row('Balance', f.foodGrams != null ? '${f.foodGrams!.toStringAsFixed(0)} g' : '—'),
              _row('Température', f.temperature != null ? '${f.temperature}°C' : '—'),
              _row('Humidité', f.humidity != null ? '${f.humidity}%' : '—'),
            ],
          ),
        ),
      );

  Widget _dispenseCard(PetFeeder f) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Distribution manuelle', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              const Text('IR → servo → moteur → balance vérifie la quantité'),
              Slider(
                value: _grams,
                min: 5,
                max: 200,
                divisions: 39,
                label: '${_grams.toInt()} g',
                onChanged: f.isLowFood ? null : (v) => setState(() => _grams = v),
              ),
              Text('${_grams.toInt()} grammes', textAlign: TextAlign.center),
              const SizedBox(height: 8),
              FilledButton.icon(
                onPressed: f.isLowFood ? null : _dispense,
                icon: const Icon(Icons.play_arrow),
                label: const Text('Distribuer maintenant'),
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF059669)),
              ),
            ],
          ),
        ),
      );

  Widget _planCard(NutritionPlan p) => Card(
        color: Colors.orange.shade50,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Plan nutritionnel', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              if (p.petName != null) Text('Animal : ${p.petName}'),
              Text('Besoin : ${p.dailyGrams} g/jour'),
              Text('Par repas : ${p.portionGrams} g × ${p.mealsPerDay}'),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: _applyPlan,
                icon: const Icon(Icons.schedule),
                label: const Text('Appliquer planning auto'),
              ),
            ],
          ),
        ),
      );

  Widget _schedulesCard(PetFeeder f) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Planning repas', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              if (f.schedules.isEmpty)
                const Text('Aucun créneau', style: TextStyle(color: Colors.grey))
              else
                ...f.schedules.map((s) => ListTile(
                      dense: true,
                      leading: const Icon(Icons.alarm),
                      title: Text('${s.time} — ${s.portionGrams.toInt()} g'),
                      subtitle: s.label != null ? Text(s.label!) : null,
                    )),
            ],
          ),
        ),
      );

  Widget _logsCard(PetFeeder f) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Journal', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              if (f.logs.isEmpty)
                const Text('Aucun événement', style: TextStyle(color: Colors.grey))
              else
                ...f.logs.take(10).map((log) => ListTile(
                      dense: true,
                      title: Text(_logLabel(log)),
                      subtitle: Text(log.message ?? ''),
                    )),
            ],
          ),
        ),
      );

  Widget _deviceKeyCard(PetFeeder f) => Card(
        child: ListTile(
          title: const Text('Clé ESP32'),
          subtitle: Text(f.deviceKey, style: const TextStyle(fontFamily: 'monospace', fontSize: 12)),
          trailing: IconButton(
            icon: const Icon(Icons.copy),
            onPressed: () {
              Clipboard.setData(ClipboardData(text: f.deviceKey));
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Clé copiée')));
            },
          ),
        ),
      );

  Widget _row(String k, String v) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [Text(k, style: const TextStyle(color: Colors.grey)), Text(v, style: const TextStyle(fontWeight: FontWeight.w600))],
        ),
      );

  String _logLabel(FeederLog log) {
    switch (log.eventType) {
      case 'dispense':
        return '✅ Distribution ${log.portionGrams?.toInt() ?? ''} g';
      case 'alert':
        return '🔴 Alerte';
      case 'manual_request':
        return '📲 Demande manuelle';
      default:
        return log.eventType;
    }
  }
}
