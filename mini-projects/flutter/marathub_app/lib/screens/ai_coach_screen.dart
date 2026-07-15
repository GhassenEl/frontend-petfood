import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../services/app_store.dart';

class AiCoachScreen extends StatefulWidget {
  const AiCoachScreen({super.key, required this.store});

  final AppStore store;

  @override
  State<AiCoachScreen> createState() => _AiCoachScreenState();
}

class _AiCoachScreenState extends State<AiCoachScreen> {
  bool _loading = false;

  Future<void> _generate() async {
    setState(() => _loading = true);
    await Future<void>.delayed(const Duration(milliseconds: 650));
    await widget.store.generateAiAdvice();
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final advice = widget.store.lastAdvice;

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          const Text(
            'Coach IA',
            style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, letterSpacing: -0.8),
          ),
          const SizedBox(height: 6),
          Text(
            'Analyse locale de tes sorties · estimation marathon (Riegel) · plan du jour',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.5)),
          ),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: _loading ? null : _generate,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFB8FF3C),
              foregroundColor: const Color(0xFF0B0D10),
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            icon: _loading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0B0D10)),
                  )
                : const Icon(Icons.auto_awesome),
            label: Text(_loading ? 'Analyse en cours…' : 'Générer un plan IA'),
          ),
          const SizedBox(height: 20),
          if (advice == null)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF161A1F),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFF2A3340)),
              ),
              child: Text(
                'Lance le coach pour obtenir une prédiction marathon, le niveau de charge et la prochaine séance.',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.65), height: 1.4),
              ),
            )
          else ...[
            _AdviceHero(advice: advice),
            const SizedBox(height: 12),
            _InfoCard(
              title: 'Prochaine séance',
              child: Text(advice.nextSession, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            ),
            const SizedBox(height: 10),
            _InfoCard(
              title: 'Conseils',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: advice.tips
                    .map(
                      (t) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('•  ', style: TextStyle(color: Color(0xFFB8FF3C), fontWeight: FontWeight.bold)),
                            Expanded(child: Text(t)),
                          ],
                        ),
                      ),
                    )
                    .toList(),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Généré le ${DateFormat('dd/MM HH:mm').format(advice.generatedAt)}',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.35)),
            ),
          ],
        ],
      ),
    );
  }
}

class _AdviceHero extends StatelessWidget {
  const _AdviceHero({required this.advice});
  final dynamic advice;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: const LinearGradient(
          colors: [Color(0xFF24301A), Color(0xFF161A1F)],
        ),
        border: Border.all(color: const Color(0xFFB8FF3C).withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFF6B4A).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Charge : ${advice.riskLevel}',
                  style: const TextStyle(
                    color: Color(0xFFFF6B4A),
                    fontWeight: FontWeight.w800,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            advice.headline as String,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, height: 1.2),
          ),
          const SizedBox(height: 8),
          Text(
            advice.summary as String,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.65), height: 1.4),
          ),
          const SizedBox(height: 14),
          Text(
            'Prédiction marathon',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 12),
          ),
          Text(
            advice.predictedMarathon as String,
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w300,
              letterSpacing: 1,
              color: Color(0xFFB8FF3C),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.title, required this.child});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF161A1F),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2A3340)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }
}
