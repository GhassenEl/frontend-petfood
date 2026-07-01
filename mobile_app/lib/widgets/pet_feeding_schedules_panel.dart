import 'package:flutter/material.dart';

import '../models/water_tracking.dart';
import '../utils/species_catalog.dart';

/// Horaires de nourriture pour chaque animal du foyer.
class PetFeedingSchedulesPanel extends StatelessWidget {
  const PetFeedingSchedulesPanel({
    super.key,
    required this.pets,
    this.selectedPetId,
    this.weightByPetId,
    this.onSelectPet,
    this.scrollable = false,
    this.todayGramsByPetId,
    this.isLive = true,
  });

  final List<WaterPetOverview> pets;
  final String? selectedPetId;
  final Map<String, double>? weightByPetId;
  final ValueChanged<String>? onSelectPet;
  final bool scrollable;
  final Map<String, int>? todayGramsByPetId;
  final bool isLive;

  List<WaterPetOverview> get _orderedPets {
    if (selectedPetId == null) return pets;
    final selected = pets.where((p) => p.petId == selectedPetId).toList();
    final others = pets.where((p) => p.petId != selectedPetId).toList();
    return [...selected, ...others];
  }

  @override
  Widget build(BuildContext context) {
    if (pets.isEmpty) return const SizedBox.shrink();

    final petBlocks = _orderedPets.map(_petBlock).toList();

    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Row(
              children: [
                Icon(Icons.schedule, size: 20, color: Color(0xFF059669)),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Horaires nourriture — tous les animaux',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              '${pets.length} planning${pets.length > 1 ? 's' : ''} · tap pour sélectionner',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 10),
            if (scrollable)
              Expanded(
                child: ListView.separated(
                  padding: EdgeInsets.zero,
                  itemCount: petBlocks.length,
                  separatorBuilder: (_, i) => const SizedBox(height: 8),
                  itemBuilder: (_, i) => petBlocks[i],
                ),
              )
            else
              ...petBlocks.map((b) => Padding(padding: const EdgeInsets.only(bottom: 8), child: b)),
          ],
        ),
      ),
    );
  }

  Widget _petBlock(WaterPetOverview pet) {
    final selected = pet.petId == selectedPetId;
    final weight = weightByPetId?[pet.petId];
    final slots = SpeciesCatalog.feedingSchedule(pet.type, weightKg: weight);
    final daily = SpeciesCatalog.estimateDailyGrams(pet.type, weightKg: weight);
    final todayGrams = todayGramsByPetId?[pet.petId] ??
        (isLive ? 0 : SpeciesCatalog.demoTodayGrams(pet.petId));
    final remaining = SpeciesCatalog.remainingDailyGrams(pet.type, weightKg: weight, todayGrams: todayGrams);
    final pct = daily > 0 ? ((todayGrams / daily) * 100).round().clamp(0, 100) : 0;
    final species = SpeciesCatalog.resolve(pet.type);

    return Material(
      color: selected ? const Color(0xFFECFDF5) : const Color(0xFFF8FAFC),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onSelectPet != null ? () => onSelectPet!(pet.petId) : null,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
              width: selected ? 2 : 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(species.emoji, style: const TextStyle(fontSize: 20)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(pet.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        Text(
                          species.usesAquarium
                              ? '${species.labelFr} · alimentation aquarium'
                              : '${species.labelFr} · objectif $daily g/jour',
                          style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                  ),
                  if (!species.usesAquarium && daily > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: remaining <= daily * 0.2 ? const Color(0xFFFEE2E2) : const Color(0xFFD1FAE5),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: remaining <= daily * 0.2 ? const Color(0xFFDC2626) : const Color(0xFF059669),
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(
                            '$remaining g',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: remaining <= daily * 0.2 ? const Color(0xFFDC2626) : const Color(0xFF059669),
                            ),
                          ),
                          Text(
                            'restants',
                            style: TextStyle(fontSize: 9, color: Colors.grey.shade700),
                          ),
                        ],
                      ),
                    )
                  else if (selected)
                    const Icon(Icons.check_circle, color: Color(0xFF059669), size: 18),
                ],
              ),
              if (!species.usesAquarium && daily > 0) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: pct / 100,
                          minHeight: 6,
                          backgroundColor: const Color(0xFFE2E8F0),
                          color: const Color(0xFF059669),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text('$todayGrams / $daily g', style: TextStyle(fontSize: 11, color: Colors.grey.shade700)),
                  ],
                ),
              ],
              const SizedBox(height: 8),
              ...slots.map(
                (slot) => Container(
                  margin: const EdgeInsets.only(bottom: 4),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E3A5F),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          slot.time,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontFamily: 'monospace',
                            fontSize: 12,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.restaurant, size: 14, color: Color(0xFF059669)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          species.usesAquarium || slot.portionGrams == 0
                              ? slot.label
                              : '${slot.label} — ${slot.portionGrams} g',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
