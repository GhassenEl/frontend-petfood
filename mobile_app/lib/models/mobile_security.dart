class SecurityCheck {
  const SecurityCheck({required this.id, required this.label, required this.ok, this.detail});
  final String id;
  final String label;
  final bool ok;
  final String? detail;
}

class SecuritySession {
  const SecuritySession({
    required this.id,
    required this.device,
    this.ip,
    this.lastActive,
    this.current = false,
  });
  final String id;
  final String device;
  final String? ip;
  final DateTime? lastActive;
  final bool current;

  factory SecuritySession.fromJson(Map<String, dynamic> j) => SecuritySession(
        id: j['id']?.toString() ?? '',
        device: j['device']?.toString() ?? 'Appareil',
        ip: j['ip']?.toString(),
        lastActive: j['lastActive'] != null ? DateTime.tryParse(j['lastActive'].toString()) : null,
        current: j['current'] == true,
      );
}

class SecurityThreat {
  const SecurityThreat({
    required this.id,
    required this.title,
    this.severity,
    this.at,
  });
  final String id;
  final String title;
  final String? severity;
  final DateTime? at;

  factory SecurityThreat.fromJson(Map<String, dynamic> j) => SecurityThreat(
        id: j['id']?.toString() ?? j['_id']?.toString() ?? '',
        title: (j['title'] ?? j['type'] ?? j['message'] ?? 'Menace').toString(),
        severity: j['severity']?.toString(),
        at: j['at'] != null
            ? DateTime.tryParse(j['at'].toString())
            : j['createdAt'] != null
                ? DateTime.tryParse(j['createdAt'].toString())
                : null,
      );
}

class SecurityPack {
  const SecurityPack({
    required this.securityScore,
    required this.checks,
    required this.sessions,
    required this.threats,
    this.mode = 'demo',
    this.idsEvents24h = 0,
    this.signatureCount = 0,
  });

  final int securityScore;
  final List<SecurityCheck> checks;
  final List<SecuritySession> sessions;
  final List<SecurityThreat> threats;
  final String mode;
  final int idsEvents24h;
  final int signatureCount;
}
