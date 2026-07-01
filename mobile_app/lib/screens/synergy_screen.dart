import 'package:flutter/material.dart';

import '../models/iot_hub_state.dart';
import '../services/auth_service.dart';
import '../services/feeder_auto_engine.dart';
import '../services/nutrition_hydration_engine.dart';
import '../services/repositories.dart';
import '../services/water_repository.dart';
import '../utils/species_catalog.dart';
import '../widgets/multi_species_bw_panel.dart';

class SynergyScreen extends StatefulWidget {
  const SynergyScreen({super.key, required this.auth, this.hub});

  final AuthService auth;
  final IotHubState? hub;

  @override
  State<SynergyScreen> createState() => _SynergyScreenState();
}

class _SynergyScreenState extends State<SynergyScreen> {
  late FeederRepository _feederRepo;
  late WaterRepository _waterRepo;

  NutritionWaterSynergy? _synergy;
  bool _loading = true;
  String _petType = 'dog';
  String? _linkedFeederName;

  @override
  void initState() {
    super.initState();
    _initRepos();
    _load();
  }

  @override
  void didUpdateWidget(SynergyScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.hub?.selectedPetId != widget.hub?.selectedPetId ||
        oldWidget.hub?.isLive != widget.hub?.isLive) {
      _initRepos();
      _load();
    }
  }

  void _initRepos() {
    _feederRepo = FeederRepository(widget.auth.api);
    _waterRepo = WaterRepository(widget.auth.api);
    _waterRepo.petWeights = widget.hub?.weightByPetId ?? {};
  }

  String get _petId => widget.hub?.selectedPetId ?? 'demo-pet-1';

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final water = await _waterRepo.fetchTracking(_petId);
      _petType = water.petType;

      var todayGrams = 0;
      var dailyTarget = 95;
      String? feederName;

      final feeders = await _feederRepo.listFeeders();
      for (final f in feeders) {
        final detail = await _feederRepo.getFeeder(f.id);
        final plan = await _feederRepo.nutritionPlan(f.id);
        final petMatch = plan.petName?.toLowerCase() == water.petName.toLowerCase();
        feederName = detail.name;
        dailyTarget = plan.dailyGrams;
        final logs = detail.logs
            .map((l) => FeederLogLite(eventType: l.eventType, portionGrams: l.portionGrams, createdAt: l.createdAt))
            .toList();
        todayGrams = FeederAutoEngine.todayGramsFromLogs(logs);
        if (petMatch) break;
      }

      if (feeders.isEmpty && widget.hub?.isLive == false) {
        todayGrams = switch (SpeciesCatalog.resolve(water.petType).id) {
          'cat' => 45,
          'hamster' => 8,
          'rabbit' => 60,
          'bird' => 12,
          _ => 85,
        };
        dailyTarget = switch (SpeciesCatalog.resolve(water.petType).id) {
          'cat' => 55,
          'hamster' => 12,
          'rabbit' => 80,
          'bird' => 18,
          _ => 95,
        };
      } else if (todayGrams == 0) {
        final hubGrams = widget.hub?.todayGramsByPetId[_petId];
        if (hubGrams != null) todayGrams = hubGrams;
        final weight = widget.hub?.weightFor(_petId);
        dailyTarget = SpeciesCatalog.estimateDailyGrams(water.petType, weightKg: weight);
      }

      final synergy = NutritionHydrationEngine.buildSynergy(
        petName: water.petName,
        todayGrams: todayGrams,
        dailyTarget: dailyTarget,
        todayMl: water.todayMl,
        targetMl: water.targetMl,
        petType: water.petType,
      );

      setState(() {
        _synergy = synergy;
        _linkedFeederName = feederName;
      });
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Color _statusColor(String status) => switch (status) {
        'optimal' => const Color(0xFF059669),
        'dehydration_risk' => const Color(0xFFB91C1C),
        'low_food' => const Color(0xFFD97706),
        'aquarium' => const Color(0xFF1A1A1A),
        _ => const Color(0xFF0EA5E9),
      };

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    final s = _synergy;
    if (s == null) return const Center(child: Text('Données indisponibles'));
    final pets = widget.hub?.pets ?? [];

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (pets.length > 1) ...[
            MultiSpeciesBwPanel(
              pets: pets,
              selectedPetId: _petId,
              weightByPetId: widget.hub?.weightByPetId,
            ),
            const SizedBox(height: 12),
          ],
          Card(
            child: ListTile(
              leading: Text(SpeciesCatalog.emoji(_petType), style: const TextStyle(fontSize: 24)),
              title: Text('${SpeciesCatalog.label(_petType)} — synergie'),
              subtitle: Text(
                _linkedFeederName != null
                    ? 'Distributeur lié : $_linkedFeederName'
                    : SpeciesCatalog.resolve(_petType).hydrationTip,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            color: _statusColor(s.status).withValues(alpha: 0.08),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.sync_alt, color: _statusColor(s.status)),
                      const SizedBox(width: 8),
                      const Text('Synergie nutrition / eau', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(s.message),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _metric('Alimentation', '${s.foodPct}%', Icons.restaurant)),
                      Expanded(child: _metric('Hydratation', '${s.waterPct}%', Icons.water_drop)),
                      Expanded(child: _metric('Score', '${s.combinedScore}', Icons.grade)),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          if (!SpeciesCatalog.resolve(_petType).usesAquarium)
            Card(
              child: ListTile(
                title: const Text('Ratio eau / nourriture'),
                subtitle: Text('${s.ratio} ml/g — idéal ~${s.idealRatio} ml/g'),
                trailing: Icon(
                  s.ratio >= s.idealRatio - 1 ? Icons.check_circle : Icons.info_outline,
                  color: s.ratio >= s.idealRatio - 1 ? Colors.green : Colors.orange,
                ),
              ),
            ),
          const SizedBox(height: 12),
          const Text('Conseils', style: TextStyle(fontWeight: FontWeight.bold)),
          ...s.tips.map((t) => Card(
                child: ListTile(
                  leading: Text(t.icon, style: const TextStyle(fontSize: 20)),
                  title: Text(t.text, style: const TextStyle(fontSize: 13)),
                ),
              )),
        ],
      ),
    );
  }

  Widget _metric(String label, String value, IconData icon) => Column(
        children: [
          Icon(icon, size: 22),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ],
      );
}
