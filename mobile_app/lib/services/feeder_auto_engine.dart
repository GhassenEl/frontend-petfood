/// Distribution automatique intelligente — portions adaptatives.
class SuggestedPortion {
  const SuggestedPortion({required this.grams, required this.reason, this.compensateMissed = false});

  final int grams;
  final String reason;
  final bool compensateMissed;
}

class FeederAutoEngine {
  static SuggestedPortion computeSuggestedPortion({
    required int portionGrams,
    required int dailyGrams,
    required int todayGrams,
    required List<ScheduleSlot> slots,
    bool reservoirLow = false,
    String species = 'dog',
  }) {
    final (minG, maxG) = _limits(species);
    int clampG(int g) => g.clamp(minG, maxG);

    final base = clampG(portionGrams);
    final remaining = (dailyGrams - todayGrams).clamp(0, 9999);
    final upcoming = slots.where((s) => s.status == 'upcoming' && s.enabled).toList();
    final missed = slots.where((s) => s.status == 'missed' && s.enabled).toList();

    if (reservoirLow) {
      return SuggestedPortion(
        grams: clampG(base < 20 ? base : 20),
        reason: 'Reservoir bas — portion reduite pour preserver le stock.',
      );
    }

    if (missed.isNotEmpty && remaining > 0) {
      final boost = (remaining / (upcoming.length + missed.length) * 0.4).round().clamp(0, 15);
      return SuggestedPortion(
        grams: clampG(base + boost),
        reason: '${missed.length} repas manque(s) — portion ajustee (+$boost g).',
        compensateMissed: true,
      );
    }

    if (remaining > 0 && upcoming.isNotEmpty) {
      final fairShare = (remaining / upcoming.length).round();
      if (fairShare > base + 5) {
        return SuggestedPortion(
          grams: clampG(fairShare),
          reason: 'Objectif journalier : $remaining g restants sur ${upcoming.length} repas.',
        );
      }
    }

    if (todayGrams > dailyGrams * 1.1) {
      return SuggestedPortion(
        grams: clampG(base - 5),
        reason: 'Apport au-dessus de l\'objectif — portion legerement reduite.',
      );
    }

    return SuggestedPortion(grams: base, reason: 'Portion standard selon le plan nutritionnel.');
  }

  static (int, int) _limits(String species) {
    final s = species.toLowerCase();
    if (s.contains('hamster')) return (3, 15);
    if (s.contains('bird') || s.contains('oiseau')) return (5, 20);
    if (s.contains('rabbit') || s.contains('lapin')) return (20, 80);
    if (s.contains('reptile')) return (5, 40);
    if (s.contains('cat') || s.contains('chat')) return (10, 80);
    return (10, 200);
  }

  static int todayGramsFromLogs(List<FeederLogLite> logs) {
    final now = DateTime.now();
    var total = 0.0;
    for (final log in logs) {
      if (log.createdAt == null) continue;
      if (!_sameDay(log.createdAt!, now)) continue;
      if (log.eventType == 'dispense' || log.eventType == 'manual_request') {
        total += log.portionGrams ?? 0;
      }
    }
    return total.round();
  }

  static List<ScheduleSlot> getScheduleSlots(List<FeederScheduleLite> schedules, List<FeederLogLite> history) {
    final now = DateTime.now();
    final todayDispenses = history.where((log) {
      if (log.createdAt == null) return false;
      if (!_sameDay(log.createdAt!, now)) return false;
      return log.eventType == 'dispense' || log.eventType == 'manual_request';
    }).toList();

    return schedules.map((sch) {
      if (!sch.enabled) return ScheduleSlot(time: sch.time, portionGrams: sch.portionGrams, label: sch.label, status: 'disabled', enabled: false);
      final parts = sch.time.split(':');
      final h = int.tryParse(parts.first) ?? 0;
      final m = int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0;
      final schedDate = DateTime(now.year, now.month, now.day, h, m);
      final matched = todayDispenses.any((log) {
        final ld = log.createdAt!;
        return ld.difference(schedDate).inMinutes.abs() < 90;
      });
      if (matched) {
        return ScheduleSlot(time: sch.time, portionGrams: sch.portionGrams, label: sch.label, status: 'done', enabled: true);
      }
      if (schedDate.isAfter(now)) {
        return ScheduleSlot(time: sch.time, portionGrams: sch.portionGrams, label: sch.label, status: 'upcoming', enabled: true);
      }
      return ScheduleSlot(time: sch.time, portionGrams: sch.portionGrams, label: sch.label, status: 'missed', enabled: true);
    }).toList();
  }

  static bool _sameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  static ScheduleSlot? getNextMeal(List<ScheduleSlot> slots) {
    for (final s in slots) {
      if (s.status == 'upcoming') return s;
    }
    return null;
  }

  static String formatCountdown(DateTime? nextTime) {
    if (nextTime == null) return '—';
    final mins = nextTime.difference(DateTime.now()).inMinutes;
    if (mins <= 0) return 'Imminent';
    if (mins < 60) return '$mins min';
    final h = mins ~/ 60;
    final m = mins % 60;
    return m > 0 ? '${h}h ${m}min' : '${h}h';
  }

  static ({int pct, int remaining}) getTodayAdherence(int todayGrams, int dailyTarget) {
    if (dailyTarget <= 0) return (pct: 0, remaining: 0);
    final pct = ((todayGrams / dailyTarget) * 100).round().clamp(0, 150);
    final remaining = (dailyTarget - todayGrams).clamp(0, 9999);
    return (pct: pct, remaining: remaining);
  }

  static Map<String, dynamic>? predictDepletion({
    double? reservoirPercent,
    required int todayGrams,
    int capacityGrams = 1200,
  }) {
    if (reservoirPercent == null) return null;
    final daily = todayGrams > 0 ? todayGrams : 65;
    final remaining = (reservoirPercent / 100) * capacityGrams;
    final daysLeft = daily > 0 ? (remaining / daily).round() : null;
    final urgency = daysLeft != null && daysLeft <= 2
        ? 'high'
        : daysLeft != null && daysLeft <= 5
            ? 'medium'
            : 'low';
    return {
      'daysLeft': daysLeft,
      'urgency': urgency,
      'summary': daysLeft != null && daysLeft <= 2
          ? 'Rupture estimée dans $daysLeft jour(s) — rechargez le réservoir.'
          : daysLeft != null
              ? 'Stock suffisant ~$daysLeft jours au rythme actuel.'
              : 'Surveillez le niveau du réservoir.',
    };
  }
}

class ScheduleSlot {
  const ScheduleSlot({
    required this.time,
    required this.portionGrams,
    this.label,
    required this.status,
    this.enabled = true,
  });

  final String time;
  final double portionGrams;
  final String? label;
  final String status;
  final bool enabled;
}

class FeederScheduleLite {
  FeederScheduleLite({required this.time, required this.portionGrams, this.label, this.enabled = true});

  final String time;
  final double portionGrams;
  final String? label;
  final bool enabled;
}

class FeederLogLite {
  FeederLogLite({required this.eventType, this.portionGrams, this.createdAt});

  final String eventType;
  final double? portionGrams;
  final DateTime? createdAt;
}
