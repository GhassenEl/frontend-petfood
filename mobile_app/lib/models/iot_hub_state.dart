import '../models/water_tracking.dart';

/// État partagé du hub IoT — animal sélectionné, liste, source données, poids, grammes.
class IotHubState {
  IotHubState({
    this.selectedPetId,
    this.pets = const [],
    this.isLive = true,
    this.weightByPetId = const {},
    this.petTypeByPetId = const {},
    this.todayGramsByPetId = const {},
  });

  final String? selectedPetId;
  final List<WaterPetOverview> pets;
  /// `true` si la dernière requête API a réussi ; `false` = fallback démo.
  final bool isLive;
  final Map<String, double> weightByPetId;
  final Map<String, String> petTypeByPetId;
  final Map<String, int> todayGramsByPetId;

  String? get selectedPetType =>
      selectedPetId != null ? petTypeByPetId[selectedPetId] : null;

  double? weightFor(String petId) => weightByPetId[petId];

  IotHubState copyWith({
    String? selectedPetId,
    List<WaterPetOverview>? pets,
    bool? isLive,
    Map<String, double>? weightByPetId,
    Map<String, String>? petTypeByPetId,
    Map<String, int>? todayGramsByPetId,
  }) =>
      IotHubState(
        selectedPetId: selectedPetId ?? this.selectedPetId,
        pets: pets ?? this.pets,
        isLive: isLive ?? this.isLive,
        weightByPetId: weightByPetId ?? this.weightByPetId,
        petTypeByPetId: petTypeByPetId ?? this.petTypeByPetId,
        todayGramsByPetId: todayGramsByPetId ?? this.todayGramsByPetId,
      );
}

typedef IotHubStateCallback = void Function(IotHubState state);
