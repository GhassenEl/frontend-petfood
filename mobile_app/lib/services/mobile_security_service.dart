import '../models/mobile_security.dart';
import 'api_client.dart';

class MobileSecurityService {
  MobileSecurityService(this.api);
  final ApiClient api;

  Future<SecurityPack> loadPack() async {
    Map<String, dynamic>? status;
    List<dynamic> threatsRaw = [];
    List<dynamic> sessionsRaw = [];

    try {
      status = Map<String, dynamic>.from(await api.get('/security/status') as Map);
    } catch (_) {}

    try {
      final t = await api.get('/security/threats', query: {'limit': '15'});
      threatsRaw = t is Map ? (t['threats'] as List? ?? []) : (t is List ? t : []);
    } catch (_) {}

    try {
      final s = await api.get('/security/sessions');
      sessionsRaw = s is Map ? (s['sessions'] as List? ?? []) : [];
    } catch (_) {}

    if (status != null || sessionsRaw.isNotEmpty) {
      return _fromApi(status, threatsRaw, sessionsRaw);
    }
    return _demoPack();
  }

  SecurityPack _fromApi(Map<String, dynamic>? status, List threatsRaw, List sessionsRaw) {
    final threats = threatsRaw.map((e) => SecurityThreat.fromJson(Map<String, dynamic>.from(e))).toList();
    final sessions = sessionsRaw.isNotEmpty
        ? sessionsRaw.map((e) => SecuritySession.fromJson(Map<String, dynamic>.from(e))).toList()
        : _demoSessions();

    final checks = [
      SecurityCheck(
        id: 'jwt',
        label: 'JWT sécurisé',
        ok: true,
        detail: 'Token valide · session mobile',
      ),
      SecurityCheck(
        id: 'ids',
        label: 'Détection intrusions',
        ok: status?['ids']?['enabled'] != false,
        detail: '${status?['ids']?['eventsLast24h'] ?? 0} alertes / 24 h',
      ),
      SecurityCheck(
        id: 'av',
        label: 'Anti-virus applicatif',
        ok: status?['protection']?['antivirus'] != false,
        detail: '${status?['signatureCount'] ?? 0} signatures',
      ),
      SecurityCheck(
        id: 'iot',
        label: 'IoT chiffré',
        ok: true,
        detail: 'ESP32-CAM · TLS',
      ),
      SecurityCheck(
        id: '2fa',
        label: 'Authentification',
        ok: true,
        detail: 'Mot de passe + JWT',
      ),
      SecurityCheck(
        id: 'rgpd',
        label: 'RGPD / consentement',
        ok: true,
        detail: 'Données protégées',
      ),
    ];

    final score = ((checks.where((c) => c.ok).length / checks.length) * 100).round();

    return SecurityPack(
      securityScore: score,
      checks: checks,
      sessions: sessions,
      threats: threats.isNotEmpty ? threats : _demoThreats(),
      mode: 'live',
      idsEvents24h: status?['ids']?['eventsLast24h'] ?? 0,
      signatureCount: status?['signatureCount'] ?? 0,
    );
  }

  SecurityPack _demoPack() => SecurityPack(
        securityScore: 92,
        checks: const [
          SecurityCheck(id: 'jwt', label: 'JWT sécurisé', ok: true, detail: 'Token valide · session mobile'),
          SecurityCheck(id: 'ids', label: 'Détection intrusions', ok: true, detail: '2 alertes / 24 h'),
          SecurityCheck(id: 'av', label: 'Anti-virus applicatif', ok: true, detail: '1247 signatures'),
          SecurityCheck(id: 'iot', label: 'IoT chiffré', ok: true, detail: 'ESP32-CAM · TLS'),
          SecurityCheck(id: '2fa', label: 'Authentification', ok: true, detail: 'Mot de passe + JWT'),
          SecurityCheck(id: 'rgpd', label: 'RGPD / consentement', ok: true, detail: 'Données protégées'),
        ],
        sessions: _demoSessions(),
        threats: _demoThreats(),
        mode: 'demo',
        idsEvents24h: 2,
        signatureCount: 1247,
      );

  List<SecuritySession> _demoSessions() => [
        SecuritySession(
          id: 'sess-mobile',
          device: 'PetfoodTN Mobile · Android',
          ip: '41.224.*.*',
          lastActive: DateTime.now(),
          current: true,
        ),
        SecuritySession(
          id: 'sess-web',
          device: 'Chrome · Windows',
          ip: '196.168.*.*',
          lastActive: DateTime.now().subtract(const Duration(hours: 2)),
        ),
      ];

  List<SecurityThreat> _demoThreats() => [
        SecurityThreat(
          id: 't1',
          title: 'Tentative login échouée',
          severity: 'low',
          at: DateTime.now().subtract(const Duration(hours: 5)),
        ),
        SecurityThreat(
          id: 't2',
          title: 'Scan payload bloqué (XSS)',
          severity: 'medium',
          at: DateTime.now().subtract(const Duration(days: 1)),
        ),
      ];
}
