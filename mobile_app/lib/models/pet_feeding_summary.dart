import 'client_account.dart';

class PetFeedingSummary {
  PetFeedingSummary({
    required this.petId,
    required this.name,
    required this.species,
    this.breed,
    this.weightKg,
    required this.dailyTargetGrams,
    required this.todayGrams,
    required this.mealsPerDay,
    required this.gramsPerMeal,
    this.reservoirPercent,
    this.feederOnline = false,
    this.isLowFood = false,
    this.mode = 'live',
    this.schedules = const [],
  });

  final String petId;
  final String name;
  final String species;
  final String? breed;
  final double? weightKg;
  final int dailyTargetGrams;
  final int todayGrams;
  final int mealsPerDay;
  final int gramsPerMeal;
  final double? reservoirPercent;
  final bool feederOnline;
  final bool isLowFood;
  final String mode;
  final List<FeedingScheduleRow> schedules;

  int get adherencePercent =>
      dailyTargetGrams > 0 ? ((todayGrams / dailyTargetGrams) * 100).round().clamp(0, 150) : 0;

  bool get onTrack => adherencePercent >= 70 && adherencePercent <= 115;
}

class FeedingScheduleRow {
  const FeedingScheduleRow({required this.time, required this.grams, this.label});

  final String time;
  final int grams;
  final String? label;
}

class ClientFeedingPack {
  ClientFeedingPack({
    required this.client,
    required this.pets,
    this.mode = 'live',
  });

  final ClientAccount client;
  final List<PetFeedingSummary> pets;
  final String mode;

  int get totalTodayGrams => pets.fold(0, (sum, p) => sum + p.todayGrams);
  int get totalTargetGrams => pets.fold(0, (sum, p) => sum + p.dailyTargetGrams);
}
