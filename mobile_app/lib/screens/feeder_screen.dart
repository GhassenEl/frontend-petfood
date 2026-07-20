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
import '../services/feeder_notifications_service.dart';
import '../widgets/feeder_scale_card.dart';
import '../widgets/feeder_history_panel.dart';
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

class _FeederScreenState extends State<FeederScreen> with SingleTickerProviderStateMixin {
  late final FeederRepository _repo = FeederRepository(widget.auth.api);
  late final FeederNotificationService _feederNotify = FeederNotificationService();
  late final TabController _tabs = TabController(length: 3, vsync: this);
  List<PetFeeder> _feeders = [];
  PetFeeder? _selected;
  NutritionPlan? _plan;
  bool _loading = true;
  double _grams = 30;
  Timer? _pollTimer;
  List<Map<String, dynamic>> _anomalies = [];
  bool _mlLoading = false;
  List<FeederLog> _history = [];
  FeederStats? _stats;
  List<FeederAlert> _alerts = [];
  String _historyFilter = 'all';
  TimeOfDay _newScheduleTime = const TimeOfDay(hour: 8, minute: 0);
  double _newScheduleGrams = 30;
  bool _dispensing = false;

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
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _loadFeederExtras(PetFeeder feeder) async {
    final results = await Future.wait([
      _repo.getHistory(feeder.id, limit: 50),
      _repo.getStats(feeder.id),
      _repo.getAlerts(feeder.id),
    ]);
    if (!mounted) return;
    setState(() {
      _history = results[0] as List<FeederLog>;
      _stats = results[1] as FeederStats;
      _alerts = results[2] as List<FeederAlert>;
    });
    await _feederNotify.checkFeeder(_repo, feeder);
  }

  double? _lastPortionGrams(PetFeeder f) {
    for (final log in [...f.logs, ..._history]) {
      if (log.eventType == 'dispense' && log.portionGrams != null) {
        return log.portionGrams;
      }
    }
    return null;
  }

  Future<void> _loadBehaviorMl({bool silent = false}) async {
    if (!silent && mounted) setState(() => _mlLoading = true);
    try {
      await _repo.analyzeBehavior();
      final anomalies = await _repo.listBehaviorAnomalies();
      if (mounted) setState(() => _anomalies = anomalies);
    } catch (_) {
      // Keep feeder UX usable if ML backend is offline
    } finally {
      if (mounted) setState(() => _mlLoading = false);
    }
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
        await _loadFeederExtras(sel);
      }
      setState(() {
        _feeders = list;
        _selected = sel;
      });
      if (!silent) await _loadBehaviorMl(silent: true);
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
      await _loadFeederExtras(detail);
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _dispense() async {
    if (_selected == null || _dispensing) return;
    setState(() => _dispensing = true);
    try {
      await _repo.dispense(_selected!.id, _grams);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Commande mobile envoyée : ${_grams.toInt()} g'),
          backgroundColor: Colors.green,
        ),
      );
      await _selectFeeder(_selected!);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _dispensing = false);
    }
  }

  Future<void> _markRefill() async {
    if (_selected == null) return;
    try {
      await _repo.markRefill(_selected!.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Réservoir marqué comme rechargé'), backgroundColor: Colors.green),
      );
      await _selectFeeder(_selected!);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _addSchedule() async {
    if (_selected == null) return;
    final time =
        '${_newScheduleTime.hour.toString().padLeft(2, '0')}:${_newScheduleTime.minute.toString().padLeft(2, '0')}';
    try {
      await _repo.addSchedule(
        _selected!.id,
        time: time,
        portionGrams: _newScheduleGrams,
        label: 'Repas',
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Créneau $time ajouté'), backgroundColor: Colors.green),
      );
      await _selectFeeder(_selected!);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _pickScheduleTime() async {
    final picked = await showTimePicker(context: context, initialTime: _newScheduleTime);
    if (picked != null) setState(() => _newScheduleTime = picked);
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

  String _anomalyDetail(Map<String, dynamic> a) {
    const fallback = 'Signal comportemental';
    final factors = a['factors'];
    if (factors is List && factors.isNotEmpty && factors.first is Map) {
      final first = Map<String, dynamic>.from(factors.first as Map);
      return first['detail']?.toString() ?? first['signal']?.toString() ?? fallback;
    }
    final raw = a['factorsJson']?.toString() ?? '';
    final match = RegExp(r'"detail"\s*:\s*"([^"]+)"').firstMatch(raw);
    return match?.group(1) ?? fallback;
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
              title: const Text('Gamelle intelligente'),
              backgroundColor: const Color(0xFFDBEAFE),
              bottom: TabBar(
                controller: _tabs,
                labelColor: const Color(0xFF1E40AF),
                tabs: const [
                  Tab(icon: Icon(Icons.phone_android), text: 'Contrôle'),
                  Tab(icon: Icon(Icons.schedule), text: 'Auto'),
                  Tab(icon: Icon(Icons.history), text: 'Historique'),
                ],
              ),
            )
          else
            SliverToBoxAdapter(
              child: Material(
                color: const Color(0xFFDBEAFE),
                child: TabBar(
                  controller: _tabs,
                  labelColor: const Color(0xFF1E40AF),
                  tabs: const [
                    Tab(text: 'Contrôle'),
                    Tab(text: 'Auto'),
                    Tab(text: 'Historique'),
                  ],
                ),
              ),
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
                        const Text('Aucune gamelle intelligente'),
                        const SizedBox(height: 8),
                        Text(
                          widget.embedded
                              ? 'Les horaires ci-dessus restent actifs pour chaque animal.'
                              : 'Associez une gamelle après achat pour contrôler portions et alertes.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                        ),
                        const SizedBox(height: 16),
                        FilledButton.icon(
                          onPressed: _addFeeder,
                          icon: const Icon(Icons.add),
                          label: const Text('Associer gamelle'),
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
              SliverFillRemaining(
                child: TabBarView(
                  controller: _tabs,
                  children: [
                    _buildControlTab(f),
                    _buildAutoTab(f),
                    _buildHistoryTab(f),
                  ],
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }

  Widget _buildControlTab(PetFeeder f) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ..._alertBanners(f),
        FeederScaleCard(
          foodGrams: f.foodGrams,
          lastPortionGrams: _lastPortionGrams(f),
          animalPresent: f.animalPresent,
        ),
        const SizedBox(height: 12),
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
            todayGrams: _stats?.todayGrams ?? FeederAutoEngine.todayGramsFromLogs(_logLites(f)),
            dailyTarget: _plan!.dailyGrams,
            isLowFood: f.isLowFood,
            animalPresent: f.animalPresent,
            isOnline: f.isOnline,
          ),
        const SizedBox(height: 12),
        if (_plan != null) _nutritionScoreCard(f),
        const SizedBox(height: 12),
        _dispenseCard(f),
        const SizedBox(height: 12),
        _statusCard(f),
        const SizedBox(height: 12),
        _deviceKeyCard(f),
        const SizedBox(height: 12),
        _mlCard(),
      ],
    );
  }

  Widget _buildAutoTab(PetFeeder f) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          color: const Color(0xFFEFF6FF),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.schedule_send, color: Color(0xFF2563EB)),
                    SizedBox(width: 8),
                    Text('Distribution automatique', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'L\'ESP32 distribue aux horaires programmés. La balance vérifie chaque portion.',
                  style: TextStyle(fontSize: 13, color: Colors.black54),
                ),
                const SizedBox(height: 12),
                if (_plan != null)
                  OutlinedButton.icon(
                    onPressed: _applyPlan,
                    icon: const Icon(Icons.auto_fix_high),
                    label: const Text('Appliquer planning 8h / 18h'),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        _nextMealCard(f),
        const SizedBox(height: 12),
        if (_suggestedPortion(f) != null) _autoPortionCard(f, _suggestedPortion(f)!),
        const SizedBox(height: 12),
        _schedulesCard(f),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Ajouter un créneau', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _pickScheduleTime,
                  icon: const Icon(Icons.access_time),
                  label: Text(
                    '${_newScheduleTime.hour.toString().padLeft(2, '0')}:${_newScheduleTime.minute.toString().padLeft(2, '0')}',
                  ),
                ),
                Slider(
                  value: _newScheduleGrams,
                  min: 5,
                  max: 120,
                  divisions: 23,
                  label: '${_newScheduleGrams.toInt()} g',
                  onChanged: (v) => setState(() => _newScheduleGrams = v),
                ),
                FilledButton.icon(
                  onPressed: _addSchedule,
                  icon: const Icon(Icons.add_alarm),
                  label: const Text('Programmer ce repas'),
                ),
              ],
            ),
          ),
        ),
        if (_plan != null) ...[
          const SizedBox(height: 12),
          _depletionCard(f),
          const SizedBox(height: 12),
          FeederWeeklyBars(gramsByDay: _weeklyGrams(f), dailyTarget: _plan!.dailyGrams),
        ],
      ],
    );
  }

  Widget _buildHistoryTab(PetFeeder f) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        FeederHistoryPanel(
          logs: _history.isNotEmpty ? _history : f.logs,
          filter: _historyFilter,
          onFilterChanged: (v) => setState(() => _historyFilter = v),
          todayGrams: _stats?.todayGrams ?? 0,
          weekGrams: _stats?.weekGrams ?? 0,
          dispenseCount: _stats?.dispenseCount ?? 0,
        ),
        const SizedBox(height: 12),
        if (_alerts.isNotEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Alertes actives', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  ..._alerts.map((a) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: Icon(
                          a.isCritical ? Icons.warning : Icons.info_outline,
                          color: a.isCritical ? Colors.red : Colors.orange,
                        ),
                        title: Text(a.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text(a.message),
                      )),
                ],
              ),
            ),
          ),
        const SizedBox(height: 12),
        _liveEventsStrip(f),
      ],
    );
  }

  List<Widget> _alertBanners(PetFeeder f) {
    final widgets = <Widget>[];
    if (f.isLowFood) {
      widgets.add(
        Card(
          color: Colors.red.shade50,
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: const Icon(Icons.notifications_active, color: Colors.red),
            title: const Text('Réservoir vide ou bas', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(
              _reservoirPercent(f) != null
                  ? 'Niveau ~${_reservoirPercent(f)!.toStringAsFixed(0)} % — rechargez les croquettes'
                  : 'LED rouge active sur la gamelle',
            ),
            trailing: TextButton(onPressed: _markRefill, child: const Text('Rechargé')),
          ),
        ),
      );
    }
    return widgets;
  }

  Widget _mlCard() => Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Expanded(
                    child: Text('Comportement ML', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                  TextButton(
                    onPressed: _mlLoading ? null : () => _loadBehaviorMl(),
                    child: Text(_mlLoading ? 'Analyse…' : 'Analyser'),
                  ),
                ],
              ),
              const Text(
                'Indicateur multi-sources — ne remplace pas un avis vétérinaire.',
                style: TextStyle(fontSize: 12, color: Colors.black54),
              ),
              if (_anomalies.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 8),
                  child: Text('Aucune anomalie ouverte.', style: TextStyle(fontSize: 13)),
                )
              else
                ..._anomalies.take(3).map((a) {
                  final score = ((a['score'] as num?)?.toDouble() ?? 0) * 100;
                  return ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: Text('Score ${score.round()} · ${a['severity'] ?? 'medium'}'),
                    subtitle: Text(_anomalyDetail(a)),
                  );
                }),
            ],
          ),
        ),
      );

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
              const Text('Contrôle via l\'application', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              const Text('Envoyez une commande MQTT à la gamelle — la balance HX711 confirme la portion.'),
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
                onPressed: f.isLowFood || _dispensing ? null : _dispense,
                icon: _dispensing
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.play_arrow),
                label: Text(_dispensing ? 'Envoi…' : 'Distribuer maintenant'),
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF059669)),
              ),
              if (f.isLowFood) ...[
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _markRefill,
                  icon: const Icon(Icons.inventory_2),
                  label: const Text('Marquer réservoir rechargé'),
                ),
              ],
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
