import 'package:flutter/material.dart';
import '../models/pet.dart';
import '../services/auth_service.dart';
import '../services/pet_service.dart';

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

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final pets = await _service.fetchPets();
    if (mounted) setState(() { _pets = pets; _loading = false; });
  }

  Future<void> _addPet() async {
    final nameCtrl = TextEditingController();
    var species = 'chien';
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Nouvel animal'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Nom')),
              const SizedBox(height: 12),
              ...['chien', 'chat', 'nac'].map((s) => RadioListTile<String>(
                    title: Text(s == 'chien' ? 'Chien' : s == 'chat' ? 'Chat' : 'NAC'),
                    value: s,
                    groupValue: species,
                    onChanged: (v) => setDialogState(() => species = v ?? 'chien'),
                  )),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Ajouter')),
          ],
        ),
      ),
    );
    if (result != true || nameCtrl.text.trim().isEmpty) return;
    final pet = await _service.addPet(PetProfile(id: '', name: nameCtrl.text.trim(), species: species));
    setState(() => _pets = [..._pets, pet]);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${pet.name} ajouté')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mes animaux'), backgroundColor: const Color(0xFFD1FAE5)),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addPet,
        icon: const Icon(Icons.add),
        label: const Text('Ajouter'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _pets.length,
              itemBuilder: (_, i) {
                final p = _pets[i];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: const Color(0xFFECFDF5),
                      child: Text(p.species == 'chat' ? '🐱' : '🐕', style: const TextStyle(fontSize: 22)),
                    ),
                    title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${p.species}${p.breed != null ? ' · ${p.breed}' : ''}${p.weightKg != null ? ' · ${p.weightKg} kg' : ''}'),
                    trailing: const Icon(Icons.chevron_right),
                  ),
                );
              },
            ),
    );
  }
}
