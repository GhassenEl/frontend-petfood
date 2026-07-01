import 'package:flutter/material.dart';

import '../models/pet.dart';
import '../services/auth_service.dart';
import '../services/pet_service.dart';
import '../utils/species_catalog.dart';
import '../widgets/add_pet_sheet.dart';

class PetsScreen extends StatefulWidget {
  const PetsScreen({super.key, required this.auth});

  final AuthService auth;

  @override
  State<PetsScreen> createState() => _PetsScreenState();
}

class _PetsScreenState extends State<PetsScreen> {
  late final PetService _service = PetService(widget.auth.api);
  List<PetProfile> _pets = [];
  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final pets = await _service.fetchPets();
    if (mounted) {
      setState(() {
        _pets = pets;
        _loading = false;
      });
    }
  }

  Future<void> _openAddForm({PetProfile? edit}) async {
    final draft = await showModalBottomSheet<PetProfile>(
      context: context,
      isScrollControlled: true,
      useRootNavigator: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => AddPetSheet(initial: edit),
    );
    if (draft == null) return;
    await _savePet(draft);
  }

  Future<void> _savePet(PetProfile draft) async {
    setState(() => _saving = true);
    try {
      final pet = await _service.addPet(draft);
      if (!mounted) return;
      await _load();
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${pet.name} a été ajouté à vos animaux'),
          backgroundColor: const Color(0xFF059669),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur : $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Mes animaux'),
        backgroundColor: const Color(0xFFD1FAE5),
        foregroundColor: const Color(0xFF1E3A5F),
        actions: [
          IconButton(
            onPressed: _saving ? null : _openAddForm,
            icon: const Icon(Icons.add_circle_outline),
            tooltip: 'Ajouter un animal',
          ),
        ],
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: FloatingActionButton.extended(
          onPressed: _saving ? null : _openAddForm,
          backgroundColor: const Color(0xFF059669),
          foregroundColor: Colors.white,
          icon: _saving
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Icon(Icons.add),
          label: Text(_saving ? 'Enregistrement…' : 'Ajouter'),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF059669)))
          : RefreshIndicator(
              onRefresh: _load,
              color: const Color(0xFF059669),
              child: _pets.isEmpty ? _emptyState() : _petsList(),
            ),
    );
  }

  Widget _emptyState() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(24),
      children: [
        const SizedBox(height: 48),
        const Text('🐾', textAlign: TextAlign.center, style: TextStyle(fontSize: 56)),
        const SizedBox(height: 16),
        const Text(
          'Aucun animal enregistré',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E3A5F)),
        ),
        const SizedBox(height: 8),
        Text(
          'Ajoutez votre premier compagnon pour personnaliser l\'IoT, la nutrition et les recommandations.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey.shade600, height: 1.4),
        ),
        const SizedBox(height: 28),
        FilledButton.icon(
          onPressed: _saving ? null : _openAddForm,
          icon: const Icon(Icons.add),
          label: const Text('Ajouter un animal'),
          style: FilledButton.styleFrom(
            backgroundColor: const Color(0xFF059669),
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
        ),
      ],
    );
  }

  Widget _petsList() {
    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      itemCount: _pets.length,
      itemBuilder: (_, i) {
        final p = _pets[i];
        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: CircleAvatar(
              radius: 26,
              backgroundColor: const Color(0xFFECFDF5),
              child: Text(SpeciesCatalog.emoji(p.species), style: const TextStyle(fontSize: 24)),
            ),
            title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            subtitle: Text(
              [
                SpeciesCatalog.label(p.species),
                if (p.breed != null && p.breed!.isNotEmpty) p.breed,
                if (p.weightKg != null) '${p.weightKg} kg',
              ].join(' · '),
              style: TextStyle(color: Colors.grey.shade600),
            ),
            trailing: const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
            onTap: () => _showPetDetails(p),
          ),
        );
      },
    );
  }

  void _showPetDetails(PetProfile pet) {
    showModalBottomSheet<void>(
      context: context,
      useRootNavigator: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(SpeciesCatalog.emoji(pet.species), style: const TextStyle(fontSize: 32)),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(pet.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _detailRow('Espèce', SpeciesCatalog.label(pet.species)),
            if (pet.breed != null) _detailRow('Race', pet.breed!),
            if (pet.weightKg != null) _detailRow('Poids', '${pet.weightKg} kg'),
            if (pet.notes != null) _detailRow('Notes', pet.notes!),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.pop(ctx),
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF059669)),
                child: const Text('Fermer'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(width: 72, child: Text(label, style: TextStyle(color: Colors.grey.shade600))),
            Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500))),
          ],
        ),
      );
}
