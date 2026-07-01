import 'package:flutter/material.dart';
import '../utils/date_format_utils.dart';
import '../models/mobile_security.dart';
import '../services/auth_service.dart';
import '../services/mobile_security_service.dart';

class SecurityScreen extends StatefulWidget {
  const SecurityScreen({super.key, required this.auth});

  final AuthService auth;

  @override
  State<SecurityScreen> createState() => _SecurityScreenState();
}

class _SecurityScreenState extends State<SecurityScreen> {
  late final MobileSecurityService _service = MobileSecurityService(widget.auth.api);
  SecurityPack? _pack;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final pack = await _service.loadPack();
      if (mounted) setState(() => _pack = pack);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar.large(
            title: const Text('Sécurité'),
            backgroundColor: const Color(0xFFDBEAFE),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFFDBEAFE), Color(0xFFE0E7FF), Color(0xFFF8FAFC)],
                  ),
                ),
              ),
            ),
            actions: [
              IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
            ],
          ),
          if (_loading && _pack == null)
            const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
          else if (_pack != null)
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  if (_pack!.mode == 'demo')
                    const Chip(
                      avatar: Icon(Icons.science, size: 16),
                      label: Text('Mode démo — backend sécurité indisponible'),
                    ),
                  _ScoreCard(score: _pack!.securityScore),
                  const SizedBox(height: 16),
                  _SectionTitle('Contrôles actifs'),
                  ..._pack!.checks.map(_CheckTile.new),
                  const SizedBox(height: 16),
                  _SectionTitle('Sessions actives (${_pack!.sessions.length})'),
                  ..._pack!.sessions.map(_SessionTile.new),
                  const SizedBox(height: 16),
                  _SectionTitle('Journal des menaces (${_pack!.threats.length})'),
                  if (_pack!.threats.isEmpty)
                    const Text('Aucune menace récente', style: TextStyle(color: Colors.grey))
                  else
                    ..._pack!.threats.map(_ThreatTile.new),
                  const SizedBox(height: 24),
                ]),
              ),
            ),
        ],
      ),
    );
  }
}

class _ScoreCard extends StatelessWidget {
  const _ScoreCard({required this.score});
  final int score;

  Color get _color {
    if (score >= 90) return const Color(0xFF059669);
    if (score >= 70) return const Color(0xFFD97706);
    return const Color(0xFFDC2626);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          colors: [
            _color.withValues(alpha: 0.12),
            _color.withValues(alpha: 0.04),
          ],
        ),
        border: Border.all(color: _color.withValues(alpha: 0.35)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _color.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.shield, size: 40, color: _color),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Score sécurité', style: Theme.of(context).textTheme.titleMedium),
                  Text(
                    '$score / 100',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          color: _color,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  Text(
                    score >= 90 ? 'Posture excellente' : score >= 70 ? 'Posture correcte' : 'Attention requise',
                    style: TextStyle(color: _color),
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

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
    );
  }
}

class _CheckTile extends StatelessWidget {
  const _CheckTile(this.check);
  final SecurityCheck check;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(check.ok ? Icons.check_circle : Icons.cancel, color: check.ok ? Colors.green : Colors.red),
      title: Text(check.label),
      subtitle: check.detail != null ? Text(check.detail!) : null,
    );
  }
}

class _SessionTile extends StatelessWidget {
  const _SessionTile(this.session);
  final SecuritySession session;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(session.current ? Icons.phone_android : Icons.devices, color: const Color(0xFF2563EB)),
        title: Text(session.device),
        subtitle: Text('${session.ip ?? '—'} · ${session.lastActive != null ? DateFormatUtils.formatDateTimeShort(session.lastActive!) : '—'}'),
        trailing: session.current ? const Chip(label: Text('Actuelle')) : null,
      ),
    );
  }
}

class _ThreatTile extends StatelessWidget {
  const _ThreatTile(this.threat);
  final SecurityThreat threat;

  Color _severityColor() {
    switch (threat.severity) {
      case 'high':
        return const Color(0xFFDC2626);
      case 'medium':
        return const Color(0xFFD97706);
      default:
        return const Color(0xFF64748B);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(Icons.warning_amber, color: _severityColor()),
        title: Text(threat.title),
        subtitle: Text(
          '${threat.severity ?? 'info'} · ${threat.at != null ? DateFormatUtils.formatDateTimeShort(threat.at!) : '—'}',
        ),
      ),
    );
  }
}
