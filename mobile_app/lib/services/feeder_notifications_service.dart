import '../models/models.dart';
import 'push_notification_service.dart';
import 'repositories.dart';

/// Surveille les gamelles et émet des notifications locales (réservoir vide, offline).
class FeederNotificationService {
  FeederNotificationService({PushNotificationService? push})
      : _push = push ?? PushNotificationService();

  final PushNotificationService _push;
  final Map<String, bool> _lastLowFood = {};
  final Map<String, String> _lastStatus = {};

  Future<void> checkFeeders(FeederRepository repo, List<PetFeeder> feeders) async {
    for (final f in feeders) {
      await _checkOne(repo, f);
    }
  }

  Future<void> checkFeeder(FeederRepository repo, PetFeeder feeder) async {
    await _checkOne(repo, feeder);
  }

  Future<void> _checkOne(FeederRepository repo, PetFeeder feeder) async {
    final id = feeder.id;
    final wasLow = _lastLowFood[id] ?? false;
    final wasStatus = _lastStatus[id];

    if (feeder.isLowFood && !wasLow) {
      final pct = feeder.reservoirCm != null
          ? ((30 - feeder.reservoirCm!) / 30 * 100).clamp(0, 100).round()
          : null;
      await _push.push(
        'Réservoir vide — ${feeder.name}',
        pct != null
            ? 'Niveau estimé ~$pct %. Rechargez les croquettes maintenant.'
            : 'LED rouge active — rechargez le réservoir de la gamelle.',
        category: 'feeder',
      );
    }

    if (!feeder.isOnline && wasStatus == 'online') {
      await _push.push(
        'Gamelle hors ligne — ${feeder.name}',
        'Connexion ESP32 perdue. Vérifiez le Wi-Fi et l\'alimentation.',
        category: 'feeder',
      );
    }

    _lastLowFood[id] = feeder.isLowFood;
    _lastStatus[id] = feeder.status;
  }

  void reset() {
    _lastLowFood.clear();
    _lastStatus.clear();
  }
}
