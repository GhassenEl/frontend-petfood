import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/models.dart';
import '../services/app_store.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key, required this.store});

  final AppStore store;

  Future<void> _addRun(BuildContext context) async {
    final distanceCtrl = TextEditingController(text: '10');
    final minutesCtrl = TextEditingController(text: '55');
    String type = 'Endurance';
    final notesCtrl = TextEditingController();

    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF161A1F),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 16,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: StatefulBuilder(
            builder: (ctx, setModal) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Nouvelle sortie', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 14),
                  TextField(
                    controller: distanceCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      labelText: 'Distance (km)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: minutesCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Durée (minutes)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: type,
                    decoration: const InputDecoration(
                      labelText: 'Type',
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      'Endurance',
                      'Fractionné',
                      'Tempo',
                      'Sortie longue',
                      'Récupération',
                      'Semi-marathon',
                      'Marathon',
                    ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                    onChanged: (v) => setModal(() => type = v ?? type),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: notesCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Notes (optionnel)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: () => Navigator.pop(ctx, true),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFB8FF3C),
                      foregroundColor: const Color(0xFF0B0D10),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: const Text('Enregistrer'),
                  ),
                ],
              );
            },
          ),
        );
      },
    );

    if (ok != true) return;
    final km = double.tryParse(distanceCtrl.text.replaceAll(',', '.')) ?? 0;
    final mins = int.tryParse(minutesCtrl.text) ?? 0;
    if (km <= 0 || mins <= 0) return;

    await store.addRun(
      RunEntry(
        id: 'r${DateTime.now().microsecondsSinceEpoch}',
        date: DateTime.now(),
        distanceKm: km,
        duration: Duration(minutes: mins),
        type: type,
        notes: notesCtrl.text.trim(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 12, 8),
            child: Row(
              children: [
                const Expanded(
                  child: Text(
                    'Historique',
                    style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, letterSpacing: -0.8),
                  ),
                ),
                FilledButton.icon(
                  onPressed: () => _addRun(context),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFFB8FF3C),
                    foregroundColor: const Color(0xFF0B0D10),
                  ),
                  icon: const Icon(Icons.add),
                  label: const Text('Ajouter'),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                '${store.runs.length} sorties · ${store.totalKm.toStringAsFixed(0)} km cumulés',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.5)),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: store.runs.isEmpty
                ? Center(
                    child: Text(
                      'Pas encore d’historique.',
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.45)),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                    itemCount: store.runs.length,
                    itemBuilder: (context, i) {
                      final r = store.runs[i];
                      final pace = r.pacePerKm;
                      final paceStr =
                          "${pace.inMinutes}'${(pace.inSeconds % 60).toString().padLeft(2, '0')}\"/km";
                      return Dismissible(
                        key: ValueKey(r.id),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          color: const Color(0xFFFF6B4A),
                          child: const Icon(Icons.delete, color: Colors.white),
                        ),
                        onDismissed: (_) => store.deleteRun(r.id),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFF161A1F),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFF2A3340)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      r.type,
                                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                                    ),
                                  ),
                                  Text(
                                    '${r.distanceKm.toStringAsFixed(1)} km',
                                    style: const TextStyle(
                                      color: Color(0xFFB8FF3C),
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${DateFormat('dd MMM yyyy · HH:mm').format(r.date)} · ${r.duration.inMinutes} min · $paceStr',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.45),
                                  fontSize: 12,
                                ),
                              ),
                              if (r.notes.isNotEmpty) ...[
                                const SizedBox(height: 6),
                                Text(r.notes, style: TextStyle(color: Colors.white.withValues(alpha: 0.7))),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
