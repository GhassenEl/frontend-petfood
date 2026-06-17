class BiKpi {
  const BiKpi({required this.label, required this.value, this.colorValue = 0xFF059669});
  final String label;
  final String value;
  final int colorValue;
}

class BiQualityPoint {
  const BiQualityPoint({required this.label, required this.score});
  final String label;
  final int score;
}

class BiAlert {
  const BiAlert({required this.id, required this.message, this.level = 'info'});
  final String id;
  final String message;
  final String level;
}

class BiDashboardPack {
  const BiDashboardPack({
    required this.kpis,
    required this.qualityTrend,
    required this.alerts,
    this.loyaltyPoints = 0,
    this.loyaltyTier = 'standard',
    this.monthlySpend = 0,
    this.activeOrders = 0,
    this.mode = 'demo',
  });

  final List<BiKpi> kpis;
  final List<BiQualityPoint> qualityTrend;
  final List<BiAlert> alerts;
  final int loyaltyPoints;
  final String loyaltyTier;
  final double monthlySpend;
  final int activeOrders;
  final String mode;
}
