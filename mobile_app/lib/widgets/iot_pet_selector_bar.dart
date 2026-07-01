import 'package:flutter/material.dart';

import '../models/water_tracking.dart';
import '../utils/species_catalog.dart';

/// Barre de sélection animal partagée (hub IoT).
class IotPetSelectorBar extends StatelessWidget {
  const IotPetSelectorBar({
    super.key,
    required this.pets,
    required this.selectedPetId,
    required this.onSelect,
    this.onRefresh,
    this.isLive = true,
  });

  final List<WaterPetOverview> pets;
  final String? selectedPetId;
  final ValueChanged<String> onSelect;
  final VoidCallback? onRefresh;
  final bool isLive;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFFF1F5F9),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
            child: Row(
              children: [
                Icon(
                  isLive ? Icons.sensors : Icons.cloud_off,
                  size: 18,
                  color: isLive ? const Color(0xFF059669) : const Color(0xFFD97706),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    isLive ? 'Données live API' : 'Démo — API indisponible',
                    style: TextStyle(
                      fontSize: 12,
                      color: isLive ? const Color(0xFF059669) : const Color(0xFFD97706),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                if (onRefresh != null)
                  IconButton(
                    onPressed: onRefresh,
                    icon: const Icon(Icons.refresh, size: 20),
                    tooltip: 'Actualiser',
                    color: const Color(0xFF0EA5E9),
                    visualDensity: VisualDensity.compact,
                  ),
              ],
            ),
          ),
          SizedBox(
            height: 52,
            child: pets.isEmpty
                ? Center(
                    child: Text(
                      isLive ? 'Aucun animal — ajoutez un profil' : 'Chargement démo…',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    ),
                  )
                : ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    children: pets.map((p) {
                      final sel = p.petId == selectedPetId;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text('${p.alert ? '⚠️' : SpeciesCatalog.emoji(p.type)} ${p.name}'),
                          selected: sel,
                          onSelected: (_) => onSelect(p.petId),
                          selectedColor: const Color(0xFFDBEAFE),
                          checkmarkColor: const Color(0xFF1E3A5F),
                        ),
                      );
                    }).toList(),
                  ),
          ),
        ],
      ),
    );
  }
}
