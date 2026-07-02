import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/models.dart';
import '../services/auth_service.dart';
import '../services/feeder_auto_engine.dart';
import '../models/iot_hub_state.dart';
import '../services/nutrition_hydration_engine.dart';
import '../services/repositories.dart';
import '../utils/species_catalog.dart';
import '../widgets/pet_feeding_schedules_panel.dart';
import '../widgets/feeder_bowl_viewport.dart';
import '../widgets/feeder_pipeline_strip.dart';
import '../widgets/feeder_weekly_bars.dart';

class FeederScreen extends StatefulWidget {
  const FeederScreen({super.key, required this.auth, this.embedded = false, this.hub, this.onSelectPet});

  final AuthService auth;
  final bool embedded;
  final IotHubState? hub;
  final ValueChanged<String>? onSelectPet;

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
  Timer? _pollTimer;

  static const _pollInterval = Duration(seconds: 15);

  @override
  void initState() {
    super.initState();
    _load();
    _pollTimer = Timer.periodic(_pollInterval, (_) {
      if (mounted) _load(silent: true);
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _load({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);
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
      if (mounted) setState(() => _loading = silent ? _loading : false);
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

  List<FeederLogLite> _logLites(PetFeeder f) =>
      f.logs.map((l) => FeederLogLite(eventType: l.eventType, portionGrams: l.portionGrams, createdAt: l.createdAt)).toList();

  List<FeederScheduleLite> _scheduleLites(PetFeeder f) =>
      f.schedules.map((s) => FeederScheduleLite(time: s.time, portionGrams: s.portionGrams, label: s.label)).toList();

  SuggestedPortion? _suggestedPortion(PetFeeder f) {
    if (_plan == null) return null;
    final species = widget.hub?.selectedPetType ?? 'dog';
    final slots = FeederAutoEngine.getScheduleSlots(_scheduleLites(f), _logLites(f));
    final raw = FeederAutoEngine.computeSuggestedPortion(
      portionGrams: _plan!.portionGrams,
      dailyGrams: _plan!.dailyGrams,
      todayGrams: FeederAutoEngine.todayGramsFromLogs(_logLites(f)),
      slots: slots,
      reservoirLow: f.isLowFood,
      species: species,
    );
    final clamped = SpeciesCatalog.clampPortion(species, raw.grams);
    if (clamped == raw.grams) return raw;
    return SuggestedPortion(
      grams: clamped,
      reason: '${raw.reason} (limite ${SpeciesCatalog.label(species)})',
      compensateMissed: raw.compensateMissed,
    );
  }

  Future<void> _dispenseGrams(double grams) async {
    setState(() => _grams = grams);
    await _dispense();
  }

  double? _reservoirPercent(PetFeeder f) {
    if (f.reservoirCm == null) return null;
    return (f.reservoirCm! / 30 * 100).clamp(0, 100);
  }

  DateTime? _nextMealAt(List<ScheduleSlot> slots) {
    final next = FeederAutoEngine.getNextMeal(slots);
    if (next == null) return null;
    final parts = next.time.split(':');
    final now = DateTime.now();
    return DateTime(
      now.year,
      now.month,
      now.day,
      int.parse(parts[0]),
      int.parse(parts.length > 1 ? parts[1] : '0'),
    );
  }

  List<int> _weeklyGrams(PetFeeder f) {
    final today = FeederAutoEngine.todayGramsFromLogs(_logLites(f));
    return [today - 18, today - 10, today - 6, today - 14, today + 4, today - 2, today]
        .map((g) => g.clamp(0, 999))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final f = _selected;
    return RefreshIndicator(
      onRefresh: _load,
      child: CustomScrollView(
        slivers: [
          if (!widget.embedded)
            SliverAppBar.large(
              title: const Text('Distributeur IoT'),
              backgroundColor: const Color(0xFFDBEAFE),
            ),
          if (_loading && f == null)
            const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
          else ...[
            if (widget.hub != null && widget.hub!.pets.isNotEmpty && !widget.embedded) ...[
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                  child: PetFeedingSchedulesPanel(
                    pets: widget.hub!.pets,
                    selectedPetId: widget.hub!.selectedPetId,
                    weightByPetId: widget.hub!.weightByPetId,
                    onSelectPet: widget.onSelectPet,
                    todayGramsByPetId: widget.hub!.todayGramsByPetId,
                    isLive: widget.hub!.isLive,
                  ),
                ),
              ),
            ],
            if (_feeders.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.pets, size: 64, color: Colors.grey),
                        const SizedBox(height: 16),
                        const Text('Aucun distributeur ESP32'),
                        const SizedBox(height: 8),
                        Text(
                          widget.embedded
                              ? 'Les horaires ci-dessus restent actifs pour chaque animal.'
                              : 'Ajoutez un distributeur pour déclencher les repas.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                        ),
                        const SizedBox(height: 16),
                        FilledButton.icon(
                          onPressed: _addFeeder,
                          icon: const Icon(Icons.add),
                          label: const Text('Ajouter ESP32'),
                        ),
                      ],
                    ),
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
                    if (widget.hub?.selectedPetType != null)
                      Card(
                        child: ListTile(
                          leading: Text(SpeciesCatalog.emoji(widget.hub!.selectedPetType), style: const TextStyle(fontSize: 22)),
                          title: Text('Animal hub : ${SpeciesCatalog.label(widget.hub!.selectedPetType)}'),
                          subtitle: const Text('Portions limitées selon espèce'),
                        ),
                      ),
                    if (f.isLowFood)
                      Card(
                        color: Colors.red.shade50,
                        child: const ListTile(
                          leading: Icon(Icons.warning, color: Colors.red),
                          title: Text('Réservoir bas — LED rouge'),
                        ),
                      ),
                    FeederPipelineStrip(
                      isOnline: f.isOnline,
                      animalPresent: f.animalPresent,
                      lastWeightG: f.foodGrams,
                    ),
                    const SizedBox(height: 12),
                    if (_plan != null)
                      FeederBowlViewport(
                        petName: _plan!.petName ?? f.name,
                        reservoirPercent: _reservoirPercent(f),
                        todayGrams: FeederAutoEngine.todayGramsFromLogs(_logLites(f)),
                        dailyTarget: _plan!.dailyGrams,
                        isLowFood: f.isLowFood,
                        animalPresent: f.animalPresent,
                        isOnline: f.isOnline,
                      ),
                    const SizedBox(height: 12),
                    _liveEventsStrip(f),
                    if (_plan != null) ...[
                      _nutritionScoreCard(f),
                      const SizedBox(height: 12),
                    ],
                    if (_suggestedPortion(f) != null) ...[
                      _autoPortionCard(f, _suggestedPortion(f)!),
                      const SizedBox(height: 12),
                    ],
                    if (_plan != null) ...[
                      _nextMealCard(f),
                      const SizedBox(height: 12),
                      _depletionCard(f),
                      const SizedBox(height: 12),
                      FeederWeeklyBars(gramsByDay: _weeklyGrams(f), dailyTarget: _plan!.dailyGrams),
                      const SizedBox(height: 12),
                    ],
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
        ],
      ),
    );
  }

  Widget _liveEventsStrip(PetFeeder f) {
    if (f.logs.isEmpty) return const SizedBox.shrink();
    return Card(
      color: const Color(0xFF0F172A),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.sensors, size: 14, color: Color(0xFF6EE7B7)),
                SizedBox(width: 6),
                Text('LIVE ESP32', style: TextStyle(color: Color(0xFF6EE7B7), fontSize: 11, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 8),
            ...f.logs.take(4).map((log) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      Expanded(child: Text(_logLabel(log), style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12))),
                      if (log.createdAt != null)
                        Text(
                          '${log.createdAt!.hour.toString().padLeft(2, '0')}:${log.createdAt!.minute.toString().padLeft(2, '0')}',
                          style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                        ),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }

  Widget _nextMealCard(PetFeeder f) {
    final slots = FeederAutoEngine.getScheduleSlots(_scheduleLites(f), _logLites(f));
    final next = FeederAutoEngine.getNextMeal(slots);
    final at = _nextMealAt(slots);
    return Card(
      color: const Color(0xFFEFF6FF),
      child: ListTile(
        leading: const Icon(Icons.schedule, color: Color(0xFF2563EB)),
        title: Text(next != null ? 'Prochain repas ${next.time}' : 'Aucun repas à venir'),
        subtitle: Text(
          next != null
              ? '${next.portionGrams.toInt()} g · ${next.label ?? 'Repas'} · ${FeederAutoEngine.formatCountdown(at)}'
              : 'Tous les créneaux du jour sont traités',
        ),
      ),
    );
  }

  Widget _depletionCard(PetFeeder f) {
    final today = FeederAutoEngine.todayGramsFromLogs(_logLites(f));
    final pred = FeederAutoEngine.predictDepletion(reservoirPercent: _reservoirPercent(f), todayGrams: today);
    if (pred == null) return const SizedBox.shrink();
    final urgency = pred['urgency'] as String;
    final color = urgency == 'high' ? const Color(0xFFDC2626) : urgency == 'medium' ? const Color(0xFFD97706) : const Color(0xFF059669);
    return Card(
      child: ListTile(
        leading: Icon(Icons.inventory_2, color: color),
        title: const Text('Stock croquettes'),
        subtitle: Text(pred['summary'] as String),
      ),
    );
  }

  Widget _nutritionScoreCard(PetFeeder f) {
    final todayGrams = FeederAutoEngine.todayGramsFromLogs(_logLites(f));
    final missed = FeederAutoEngine.getScheduleSlots(_scheduleLites(f), _logLites(f))
        .where((s) => s.status == 'missed')
        .length;
    final score = NutritionHydrationEngine.computeNutritionScore(
      todayGrams: todayGrams,
      dailyTarget: _plan!.dailyGrams,
      missedMeals: missed,
      reservoirLow: f.isLowFood,
    );
    return Card(
      color: const Color(0xFFF0FDF4),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: const Color(0xFFD1FAE5),
          child: Text('$score', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF059669))),
        ),
        title: Text('Score nutrition $score/100'),
        subtitle: Text('$todayGrams / ${_plan!.dailyGrams} g aujourd\'hui'),
      ),
    );
  }

  Widget _autoPortionCard(PetFeeder f, SuggestedPortion suggestion) => Card(
        color: Colors.orange.shade50,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.auto_awesome, color: Color(0xFFD97706)),
                  SizedBox(width: 8),
                  Text('Distribution auto intelligente', style: TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 8),
              Text(suggestion.reason, style: const TextStyle(fontSize: 13)),
              const SizedBox(height: 8),
              Text('Portion suggérée : ${suggestion.grams} g', style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: f.isLowFood
                    ? null
                    : () {
                        setState(() => _grams = suggestion.grams.toDouble());
                        _dispense();
                      },
                icon: const Icon(Icons.play_arrow),
                label: const Text('Distribuer portion suggérée'),
              ),
            ],
          ),
        ),
      );

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
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                alignment: WrapAlignment.center,
                children: [15, 30, 45, 60].map((g) => ActionChip(
                  label: Text('$g g'),
                  onPressed: f.isLowFood ? null : () => _dispenseGrams(g.toDouble()),
                )).toList(),
              ),
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
              else ...[
                ...FeederAutoEngine.getScheduleSlots(_scheduleLites(f), _logLites(f)).map((slot) {
                  final icon = switch (slot.status) {
                    'done' => Icons.check_circle,
                    'missed' => Icons.error_outline,
                    'upcoming' => Icons.schedule,
                    _ => Icons.alarm,
                  };
                  final color = switch (slot.status) {
                    'done' => Colors.green,
                    'missed' => Colors.red,
                    'upcoming' => Colors.blue,
                    _ => Colors.grey,
                  };
                  final statusLabel = switch (slot.status) {
                    'done' => 'Distribué',
                    'missed' => 'Manqué',
                    'upcoming' => 'À venir',
                    _ => slot.status,
                  };
                  return ListTile(
                    dense: true,
                    leading: Icon(icon, color: color, size: 20),
                    title: Text('${slot.time} — ${slot.portionGrams.toInt()} g'),
                    subtitle: Text(slot.label ?? statusLabel),
                    trailing: Text(statusLabel, style: TextStyle(fontSize: 11, color: color)),
                  );
                }),
              ],
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
