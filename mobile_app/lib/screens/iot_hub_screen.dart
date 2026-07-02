import 'dart:async';

import 'package:flutter/material.dart';

import '../models/iot_hub_state.dart';
import '../models/water_tracking.dart';
import '../services/auth_service.dart';
import '../services/feeder_auto_engine.dart';
import '../services/pet_service.dart';
import '../services/repositories.dart';
import '../services/water_repository.dart';
import '../utils/species_catalog.dart';
import '../widgets/iot_pet_selector_bar.dart';
import '../widgets/pet_feeding_schedules_panel.dart';
import 'feeder_screen.dart';
import 'synergy_screen.dart';
import 'water_screen.dart';

/// Hub IoT PetfoodTN — sélecteur animal unifié + 3 onglets, données API live.
class IotHubScreen extends StatefulWidget {
  const IotHubScreen({super.key, required this.auth});

  final AuthService auth;

  @override
  State<IotHubScreen> createState() => _IotHubScreenState();
}

class _IotHubScreenState extends State<IotHubScreen> {
  IotHubState _hub = IotHubState();
  bool _init = true;
  late final WaterRepository _waterRepo;
  Timer? _pollTimer;

  static const _pollInterval = Duration(seconds: 20);

  @override
  void initState() {
    super.initState();
    _waterRepo = WaterRepository(widget.auth.api);
    _bootstrap();
    _pollTimer = Timer.periodic(_pollInterval, (_) {
      if (mounted) _bootstrap(silent: true);
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _bootstrap({bool silent = false}) async {
    if (!silent) setState(() => _init = true);

    final petService = PetService(widget.auth.api);
    final profiles = await petService.fetchPets();
    final weights = <String, double>{};
    final types = <String, String>{};
    for (final p in profiles) {
      weights[p.id] = p.weightKg ?? 0;
      types[p.id] = p.species;
    }

    _waterRepo.petWeights = weights;
    final pets = await _waterRepo.fetchOverview();
    final isLive = _waterRepo.lastFetchWasLive;

    if (!isLive) {
      const demoWeights = {
        'demo-pet-1': 28.5,
        'demo-pet-2': 4.2,
        'demo-pet-3': 0.08,
        'demo-pet-4': 3.5,
        'demo-pet-5': 0.0,
        'demo-pet-6': 0.12,
      };
      demoWeights.forEach((k, v) => weights.putIfAbsent(k, () => v));
    }

    for (final p in pets) {
      types[p.petId] = p.type;
    }

    final todayGrams = await _loadTodayGrams(pets, isLive: isLive);

    final sel = _hub.selectedPetId;
    final selected = pets.any((p) => p.petId == sel)
        ? sel!
        : (pets.isNotEmpty ? pets.first.petId : null);

    if (mounted) {
      setState(() {
        _hub = IotHubState(
          selectedPetId: selected,
          pets: pets,
          isLive: isLive,
          weightByPetId: weights,
          petTypeByPetId: types,
          todayGramsByPetId: todayGrams,
        );
        _init = false;
      });
    }
  }

  Future<Map<String, int>> _loadTodayGrams(List<WaterPetOverview> pets, {required bool isLive}) async {
    final grams = <String, int>{};
    try {
      final feederRepo = FeederRepository(widget.auth.api);
      final feeders = await feederRepo.listFeeders();
      for (final f in feeders) {
        final detail = await feederRepo.getFeeder(f.id);
        final plan = await feederRepo.nutritionPlan(f.id);
        final petName = plan.petName?.toLowerCase();
        if (petName == null) continue;
        final match = pets.where((p) => p.name.toLowerCase() == petName).toList();
        if (match.isEmpty) continue;
        final logs = detail.logs
            .map((l) => FeederLogLite(eventType: l.eventType, portionGrams: l.portionGrams, createdAt: l.createdAt))
            .toList();
        grams[match.first.petId] = FeederAutoEngine.todayGramsFromLogs(logs);
      }
    } catch (_) {}

    if (!isLive) {
      for (final p in pets) {
        grams.putIfAbsent(p.petId, () => SpeciesCatalog.demoTodayGrams(p.petId));
      }
    }
    return grams;
  }

  void _selectPet(String id) => setState(() => _hub = _hub.copyWith(selectedPetId: id));

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('IoT — Distribution nourriture'),
          backgroundColor: const Color(0xFFDBEAFE),
          foregroundColor: const Color(0xFF1E3A5F),
          bottom: const TabBar(
            labelColor: Color(0xFF1E3A5F),
            unselectedLabelColor: Color(0xFF64748B),
            indicatorColor: Color(0xFF059669),
            tabs: [
              Tab(icon: Icon(Icons.restaurant), text: 'Distribution'),
              Tab(icon: Icon(Icons.water_drop), text: 'Eau'),
              Tab(icon: Icon(Icons.sync_alt), text: 'Synergie'),
            ],
          ),
        ),
        body: _init
            ? const Center(child: CircularProgressIndicator())
            : Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  IotPetSelectorBar(
                    pets: _hub.pets,
                    selectedPetId: _hub.selectedPetId,
                    onSelect: _selectPet,
                    isLive: _hub.isLive,
                    onRefresh: () => _bootstrap(),
                  ),
                  if (_hub.pets.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFF6EE7B7)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.memory, size: 18, color: Color(0xFF059669)),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _hub.isLive
                                        ? 'ESP32 live · portions auto · HX711 + planning multi-animaux'
                                        : 'Mode démo — horaires et portions simulés',
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF065F46)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 8),
                          SizedBox(
                            height: 240,
                            child: PetFeedingSchedulesPanel(
                          pets: _hub.pets,
                          selectedPetId: _hub.selectedPetId,
                          weightByPetId: _hub.weightByPetId,
                          onSelectPet: _selectPet,
                          scrollable: true,
                          todayGramsByPetId: _hub.todayGramsByPetId,
                          isLive: _hub.isLive,
                            ),
                          ),
                        ],
                      ),
                    ),
                  Expanded(
                    child: TabBarView(
                      children: [
                        FeederScreen(
                          auth: widget.auth,
                          embedded: true,
                          hub: _hub,
                          onSelectPet: _selectPet,
                        ),
                        WaterScreen(
                          auth: widget.auth,
                          hub: _hub,
                          onHubRefresh: () => _bootstrap(),
                        ),
                        SynergyScreen(
                          auth: widget.auth,
                          hub: _hub,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
