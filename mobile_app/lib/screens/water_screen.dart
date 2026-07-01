import 'package:flutter/material.dart';

import '../models/iot_hub_state.dart';
import '../models/water_tracking.dart';
import '../services/auth_service.dart';
import '../services/nutrition_hydration_engine.dart';
import '../services/water_repository.dart';
import '../utils/species_catalog.dart';
import '../widgets/aquarium_view.dart';
import '../widgets/multi_species_bw_panel.dart';
import '../widgets/water_bowl_view.dart';

class WaterScreen extends StatefulWidget {
  const WaterScreen({
    super.key,
    required this.auth,
    this.hub,
    this.onHubRefresh,
  });

  final AuthService auth;
  final IotHubState? hub;
  final VoidCallback? onHubRefresh;

  @override
  State<WaterScreen> createState() => _WaterScreenState();
}

class _WaterScreenState extends State<WaterScreen> {
  late WaterRepository _repo;
  WaterTracking? _tracking;
  bool _loading = true;
  String? _selectedHour;
  final _volumeCtrl = TextEditingController(text: '150');

  @override
  void initState() {
    super.initState();
    _repo = _buildRepo();
    _load();
  }

  @override
  void didUpdateWidget(WaterScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.hub?.selectedPetId != widget.hub?.selectedPetId ||
        oldWidget.hub?.isLive != widget.hub?.isLive) {
      _repo = _buildRepo();
      _load();
    }
  }

  WaterRepository _buildRepo() {
    final r = WaterRepository(widget.auth.api);
    r.petWeights = widget.hub?.weightByPetId ?? {};
    return r;
  }

  @override
  void dispose() {
    _volumeCtrl.dispose();
    super.dispose();
  }

  String get _petId => widget.hub?.selectedPetId ?? 'demo-pet-1';

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final tracking = await _repo.fetchTracking(_petId);
      if (mounted) setState(() => _tracking = tracking);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _logWater() async {
    final ml = int.tryParse(_volumeCtrl.text.trim()) ?? 150;
    try {
      final t = await _repo.logWater(_petId, ml);
      setState(() => _tracking = t);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('+$ml ml enregistrés'), backgroundColor: Colors.green),
      );
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _refill() async {
    try {
      final t = await _repo.refill(_petId);
      setState(() => _tracking = t);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Réservoir rechargé'), backgroundColor: Colors.green),
      );
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = _tracking;
    final pets = widget.hub?.pets ?? [];
    final demo = widget.hub?.isLive == false;

    if (_loading && t == null) {
      return const Center(child: CircularProgressIndicator());
    }
    if (t == null) {
      return const Center(child: Text('Aucune donnée eau'));
    }

    final isAquarium = SpeciesCatalog.resolve(t.petType).usesAquarium;
    final weight = widget.hub?.weightFor(_petId);
    final score = NutritionHydrationEngine.computeHydrationScore(
      todayMl: t.todayMl,
      targetMl: t.targetMl,
      avg7dMl: (t.stats['avg7dMl'] as num?)?.toInt() ?? 0,
      filterDaysLeft: t.monitor?.filterDaysLeft ?? 30,
      reservoirPct: t.monitor?.reservoirPct ?? 100,
      online: t.monitor?.online ?? true,
    );

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (demo)
            Card(
              color: const Color(0xFFEFF6FF),
              child: ListTile(
                leading: const Icon(Icons.science, color: Color(0xFF0EA5E9)),
                title: const Text('Mode démo — API indisponible'),
                subtitle: Text('${pets.length} animaux · ${SpeciesCatalog.label(t.petType)} sélectionné'),
                trailing: IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: widget.onHubRefresh,
                ),
              ),
            ),
          if (pets.length > 1) ...[
            MultiSpeciesBwPanel(
              pets: pets,
              selectedPetId: _petId,
              weightByPetId: widget.hub?.weightByPetId,
            ),
            const SizedBox(height: 12),
          ],
          if (weight != null && weight > 0 && !isAquarium)
            Card(
              child: ListTile(
                leading: const Icon(Icons.monitor_weight, color: Color(0xFF059669)),
                title: Text('Objectif depuis poids : ${weight.toStringAsFixed(1)} kg'),
                subtitle: Text('Cible ${t.targetMl} ml/jour (${SpeciesCatalog.label(t.petType)})'),
              ),
            ),
          const SizedBox(height: 8),
          isAquarium ? AquariumView(tracking: t) : WaterBowlView(tracking: t),
          const SizedBox(height: 12),
          Card(
            color: const Color(0xFFF0FDFA),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: const Color(0xFFCCFBF1),
                child: Text('$score', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0D9488))),
              ),
              title: Text('Score hydratation $score/100'),
              subtitle: Text(isAquarium
                  ? 'Qualité aquarium'
                  : '${t.todayMl} / ${t.targetMl} ml (${t.pct} %)'),
            ),
          ),
          if (t.hydrationTip != null) ...[
            const SizedBox(height: 8),
            Card(
              child: ListTile(
                leading: Text(SpeciesCatalog.emoji(t.petType), style: const TextStyle(fontSize: 22)),
                title: Text(t.hydrationTip!),
              ),
            ),
          ],
          if (!isAquarium) ...[
            const SizedBox(height: 12),
            _hourlyChart(t),
            const SizedBox(height: 12),
            _weeklyChart(t),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Enregistrer consommation', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _volumeCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Volume (ml)', border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: FilledButton.icon(
                            onPressed: _logWater,
                            icon: const Icon(Icons.water_drop),
                            label: const Text('Ajouter'),
                            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF0EA5E9)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _refill,
                            icon: const Icon(Icons.refresh),
                            label: const Text('Recharger'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
          if (t.alerts.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Text('Alertes', style: TextStyle(fontWeight: FontWeight.bold)),
            ...t.alerts.map((a) => Card(
                  color: a.severity == 'high' ? Colors.red.shade50 : Colors.orange.shade50,
                  child: ListTile(
                    leading: Icon(Icons.warning_amber, color: a.severity == 'high' ? Colors.red : Colors.orange),
                    title: Text(a.message, style: const TextStyle(fontSize: 13)),
                  ),
                )),
          ],
          if (t.monitor != null && !isAquarium) ...[
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Capteurs fontaine', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    _sensorRow('Filtre', '${t.monitor!.filterDaysLeft ?? '—'} j restants'),
                    _sensorRow('Débit', t.monitor!.pumpActive == true ? 'Actif' : 'Veille'),
                    _sensorRow('Moy. 7j', '${t.stats['avg7dMl'] ?? '—'} ml'),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _sensorRow(String k, String v) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(k, style: const TextStyle(color: Colors.grey)),
            Text(v, style: const TextStyle(fontWeight: FontWeight.w600)),
          ],
        ),
      );

  Widget _hourlyChart(WaterTracking t) {
    final points = t.hourlyToday.where((h) => h.volumeMl > 0).toList();
    if (points.isEmpty) return const SizedBox.shrink();
    final max = points.map((p) => p.volumeMl).reduce((a, b) => a > b ? a : b);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Consommation par heure (tap)', style: TextStyle(fontWeight: FontWeight.bold)),
            if (_selectedHour != null)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(_selectedHour!, style: const TextStyle(fontSize: 12, color: Color(0xFF0EA5E9))),
              ),
            const SizedBox(height: 12),
            SizedBox(
              height: 110,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: points.map((p) {
                  final h = max > 0 ? (p.volumeMl / max) * 80 : 0.0;
                  final sel = _selectedHour == '${p.label} : ${p.volumeMl} ml';
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedHour = '${p.label} : ${p.volumeMl} ml'),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 2),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Container(
                              height: h,
                              decoration: BoxDecoration(
                                color: sel ? const Color(0xFF0369A1) : const Color(0xFF0EA5E9),
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(p.label, style: const TextStyle(fontSize: 9)),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _weeklyChart(WaterTracking t) {
    if (t.series.isEmpty) return const SizedBox.shrink();
    final max = t.series.map((d) => d.totalMl).reduce((a, b) => a > b ? a : b);
    String? selDay;

    return StatefulBuilder(
      builder: (context, setLocal) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Historique 7 jours (tap)', style: TextStyle(fontWeight: FontWeight.bold)),
              if (selDay != null)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(selDay!, style: const TextStyle(fontSize: 12, color: Color(0xFF38BDF8))),
                ),
              const SizedBox(height: 12),
              SizedBox(
                height: 110,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: t.series.map((d) {
                    final h = max > 0 ? (d.totalMl / max) * 80 : 0.0;
                    final label = '${d.label} : ${d.totalMl} ml';
                    final sel = selDay == label;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => setLocal(() => selDay = label),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 2),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Container(
                                height: h,
                                decoration: BoxDecoration(
                                  color: sel ? const Color(0xFF0284C7) : const Color(0xFF38BDF8),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(d.label, style: const TextStyle(fontSize: 9)),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
