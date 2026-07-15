import 'package:flutter/material.dart';
import '../models/client_account.dart';
import '../models/pet_feeding_summary.dart';
import '../services/auth_service.dart';
import '../services/feeding_distribution_service.dart';
import '../utils/species_catalog.dart';
import '../utils/page_scroll.dart';
import '../widgets/feeder_bowl_viewport.dart';

class ClientFeedingScreen extends StatefulWidget {
  const ClientFeedingScreen({
    super.key,
    required this.auth,
    required this.client,
    required this.isOwnAccount,
    this.bottomNavPadding = false,
    this.onLogout,
  });

  final AuthService auth;
  final ClientAccount client;
  final bool isOwnAccount;
  final bool bottomNavPadding;
  final VoidCallback? onLogout;

  @override
  State<ClientFeedingScreen> createState() => _ClientFeedingScreenState();
}

class _ClientFeedingScreenState extends State<ClientFeedingScreen> {
  late final FeedingDistributionService _service = FeedingDistributionService(widget.auth.api);
  ClientFeedingPack? _pack;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final pack = await _service.loadForClient(
      widget.client,
      isOwnAccount: widget.isOwnAccount,
    );
    if (mounted) {
      setState(() {
        _pack = pack;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isOwnAccount ? 'État nourriture' : widget.client.name),
        backgroundColor: const Color(0xFFD1FAE5),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
          if (widget.onLogout != null)
            IconButton(icon: const Icon(Icons.logout), tooltip: 'Déconnexion', onPressed: widget.onLogout),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _pack == null
              ? const Center(child: Text('Aucune donnée'))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    physics: PageScroll.physics,
                    padding: PageScroll.listPadding(context, bottomNav: widget.bottomNavPadding),
                    children: [
                      _SummaryHeader(pack: _pack!),
                      const SizedBox(height: 16),
                      if (_pack!.mode == 'demo' && widget.isOwnAccount == false)
                        const _InfoBanner(
                          message: 'Données estimées — synchronisation IoT disponible pour le compte connecté.',
                        ),
                      if (_pack!.mode == 'demo' && widget.isOwnAccount)
                        const _InfoBanner(
                          message: 'Mode démo — connectez un distributeur IoT pour des données live.',
                        ),
                      const SizedBox(height: 8),
                      Text(
                        'Animaux (${_pack!.pets.length})',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      ..._pack!.pets.map((pet) => _PetFeedingCard(pet: pet)),
                    ],
                  ),
                ),
    );
  }
}

class _SummaryHeader extends StatelessWidget {
  const _SummaryHeader({required this.pack});

  final ClientFeedingPack pack;

  @override
  Widget build(BuildContext context) {
    final adherence = pack.totalTargetGrams > 0
        ? ((pack.totalTodayGrams / pack.totalTargetGrams) * 100).round()
        : 0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF065F46), Color(0xFF059669)],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            pack.client.email,
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _kpi('${pack.totalTodayGrams}', 'g distribués', Icons.restaurant),
              _kpi('$adherence%', 'adhérence', Icons.trending_up),
              _kpi('${pack.pets.length}', 'animaux', Icons.pets),
            ],
          ),
        ],
      ),
    );
  }

  Widget _kpi(String value, String label, IconData icon) => Expanded(
        child: Column(
          children: [
            Icon(icon, color: Colors.white70, size: 20),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11), textAlign: TextAlign.center),
          ],
        ),
      );
}

class _InfoBanner extends StatelessWidget {
  const _InfoBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFED7AA)),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline, color: Color(0xFFD97706), size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text(message, style: const TextStyle(fontSize: 12, color: Color(0xFF9A3412)))),
        ],
      ),
    );
  }
}

class _PetFeedingCard extends StatelessWidget {
  const _PetFeedingCard({required this.pet});

  final PetFeedingSummary pet;

  @override
  Widget build(BuildContext context) {
    final species = SpeciesCatalog.resolve(pet.species);
    final statusColor = pet.onTrack ? const Color(0xFF059669) : const Color(0xFFD97706);
    final statusLabel = pet.onTrack ? 'Dans l\'objectif' : 'À surveiller';

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(species.emoji, style: const TextStyle(fontSize: 32)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(pet.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text(
                        '${species.labelFr}${pet.breed != null ? ' · ${pet.breed}' : ''}${pet.weightKg != null ? ' · ${pet.weightKg} kg' : ''}',
                        style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(statusLabel, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: statusColor)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            FeederBowlViewport(
              petName: pet.name,
              reservoirPercent: pet.reservoirPercent,
              todayGrams: pet.todayGrams,
              dailyTarget: pet.dailyTargetGrams,
              isLowFood: pet.isLowFood,
              isOnline: pet.feederOnline,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _stat('Objectif', '${pet.dailyTargetGrams} g/j'),
                _stat('Aujourd\'hui', '${pet.todayGrams} g'),
                _stat('Repas', '${pet.mealsPerDay} × ${pet.gramsPerMeal} g'),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: (pet.adherencePercent / 100).clamp(0.0, 1.0),
                minHeight: 8,
                backgroundColor: const Color(0xFFE2E8F0),
                color: statusColor,
              ),
            ),
            const SizedBox(height: 4),
            Text('Adhérence : ${pet.adherencePercent} %', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
            if (pet.schedules.isNotEmpty) ...[
              const SizedBox(height: 14),
              const Text('Planning distribution', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 8),
              ...pet.schedules.map(
                (s) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      const Icon(Icons.schedule, size: 16, color: Color(0xFF64748B)),
                      const SizedBox(width: 8),
                      Text('${s.time} — ${s.grams} g', style: const TextStyle(fontSize: 13)),
                      if (s.label != null) ...[
                        const SizedBox(width: 8),
                        Text('(${s.label})', style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _stat(String label, String value) => Expanded(
        child: Container(
          margin: const EdgeInsets.only(right: 8),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
              Text(value, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
            ],
          ),
        ),
      );
}
