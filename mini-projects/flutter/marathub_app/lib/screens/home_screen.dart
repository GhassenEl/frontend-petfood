import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/models.dart';
import '../services/app_store.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({
    super.key,
    required this.store,
    required this.onOpenAi,
    required this.onOpenNotifications,
  });

  final AppStore store;
  final VoidCallback onOpenAi;
  final VoidCallback onOpenNotifications;

  @override
  Widget build(BuildContext context) {
    final goal = store.profile.weeklyGoalKm;
    final week = store.weekKm;
    final progress = (week / goal).clamp(0.0, 1.2);

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF12161C), Color(0xFF0B0D10), Color(0xFF15120F)],
        ),
      ),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'MaratHub',
                        style: TextStyle(
                          fontSize: 34,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -1,
                          color: Colors.white.withValues(alpha: 0.96),
                        ),
                      ),
                      Text(
                        'Entraînement marathon · ${store.profile.name}',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.5),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFB8FF3C).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFB8FF3C).withValues(alpha: 0.35)),
                  ),
                  child: Text(
                    'Objectif ${store.profile.targetMarathon}',
                    style: const TextStyle(
                      color: Color(0xFFB8FF3C),
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),
            _HeroCard(
              weekKm: week,
              goalKm: goal,
              progress: progress,
              streak: store.streakDays,
              totalKm: store.totalKm,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _QuickAction(
                    icon: Icons.auto_awesome,
                    label: 'Coach IA',
                    color: const Color(0xFFB8FF3C),
                    onTap: onOpenAi,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _QuickAction(
                    icon: Icons.notifications_active_outlined,
                    label: 'Alertes (${store.unreadNotifications})',
                    color: const Color(0xFFFF6B4A),
                    onTap: onOpenNotifications,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),
            Text(
              'Dernières sorties',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: Colors.white.withValues(alpha: 0.9),
              ),
            ),
            const SizedBox(height: 10),
            ...store.runs.take(4).map((r) => _RunTile(run: r)),
            if (store.runs.isEmpty)
              Text(
                'Aucune course — ajoute ta première sortie dans Historique.',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.45)),
              ),
          ],
        ),
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({
    required this.weekKm,
    required this.goalKm,
    required this.progress,
    required this.streak,
    required this.totalKm,
  });

  final double weekKm;
  final double goalKm;
  final double progress;
  final int streak;
  final double totalKm;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          colors: [Color(0xFF1C2430), Color(0xFF14181F)],
        ),
        border: Border.all(color: const Color(0xFF2A3340)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Volume cette semaine',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.55)),
          ),
          const SizedBox(height: 6),
          RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: weekKm.toStringAsFixed(1),
                  style: const TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFFB8FF3C),
                  ),
                ),
                TextSpan(
                  text: ' / ${goalKm.toStringAsFixed(0)} km',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.white.withValues(alpha: 0.45),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: progress.clamp(0.0, 1.0),
              minHeight: 10,
              backgroundColor: const Color(0xFF2A3340),
              color: const Color(0xFFB8FF3C),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _StatChip(label: 'Série', value: '$streak j'),
              const SizedBox(width: 8),
              _StatChip(label: 'Total', value: '${totalKm.toStringAsFixed(0)} km'),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0B0D10),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Text('$label · ', style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 12)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFF161A1F),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color.withValues(alpha: 0.35)),
          ),
          child: Row(
            children: [
              Icon(icon, color: color),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RunTile extends StatelessWidget {
  const _RunTile({required this.run});
  final RunEntry run;

  @override
  Widget build(BuildContext context) {
    final date = DateFormat('EEE dd MMM').format(run.date);
    final mins = run.duration.inMinutes;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF14181F),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF232A33)),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFFB8FF3C).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.directions_run, color: Color(0xFFB8FF3C)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(run.type, style: const TextStyle(fontWeight: FontWeight.w800)),
                Text(date, style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${run.distanceKm.toStringAsFixed(1)} km',
                style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFFB8FF3C)),
              ),
              Text('${mins} min', style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }
}
