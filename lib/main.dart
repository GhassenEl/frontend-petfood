import 'dart:math';

import 'package:flutter/material.dart';
import 'package:fitcoach_pro/data/demo_data.dart';

void main() => runApp(const FitCoachApp());

class FitCoachApp extends StatefulWidget {
  const FitCoachApp({super.key});
  @override
  State<FitCoachApp> createState() => _FitCoachAppState();
}

class _FitCoachAppState extends State<FitCoachApp> {
  ThemeMode _mode = ThemeMode.dark;

  static final _light = ThemeData(
    brightness: Brightness.light,
    useMaterial3: true,
    colorScheme: const ColorScheme.light(primary: Colors.black, onPrimary: Colors.white, secondary: Color(0xFF525252), surface: Colors.white, onSurface: Colors.black),
    scaffoldBackgroundColor: const Color(0xFFFAFAFA),
  );

  static final _dark = ThemeData(
    brightness: Brightness.dark,
    useMaterial3: true,
    colorScheme: const ColorScheme.dark(primary: Colors.white, onPrimary: Colors.black, secondary: Color(0xFFB0B0B0), surface: Color(0xFF141414), onSurface: Colors.white),
    scaffoldBackgroundColor: Colors.black,
  );

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FitCoach — Coach sportif',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: FitCoachHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class FitCoachHome extends StatefulWidget {
  const FitCoachHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<FitCoachHome> createState() => _FitCoachHomeState();
}

class _FitCoachHomeState extends State<FitCoachHome> {
  int _tab = 0;
  int _exSeq = 6;
  int _mlSeq = 5;
  final _rng = Random();
  bool _watchConnected = true;
  String _lastSync = 'Il y a 2 min';
  int _steps = 6842;
  int _heartRate = 72;
  int _activeMin = 38;
  int _watchCalories = 410;
  int _spo2 = 98;
  final List<WorkoutExercise> _exercises = List.of(initialExercises);
  final List<MealEntry> _meals = List.of(initialMeals);
  final List<CoachAiMessage> _chat = [
    CoachAiMessage(role: 'ai', text: 'Salut ! Je suis CoachBot 💪\nPosez-moi : plan séance, calories, nutrition, récupération ou sync montre.'),
  ];
  final TextEditingController _aiInput = TextEditingController();
  final ScrollController _chatScroll = ScrollController();
  bool _aiThinking = false;

  int get _eaten => _meals.fold(0, (s, m) => s + m.calories);
  int get _burnedWorkout => _exercises.where((e) => e.done).fold(0, (s, e) => s + e.calories);
  int get _burnedTotal => _burnedWorkout + _watchCalories;
  int get _balance => _eaten - _burnedTotal;
  int get _protein => _meals.fold(0, (s, m) => s + m.protein);
  int get _doneEx => _exercises.where((e) => e.done).length;

  void _syncWatch() {
    setState(() {
      _steps += 200 + _rng.nextInt(400);
      _heartRate = 65 + _rng.nextInt(35);
      _activeMin += _rng.nextInt(5);
      _watchCalories += 15 + _rng.nextInt(25);
      _spo2 = 96 + _rng.nextInt(4);
      _lastSync = 'À l\'instant';
      _watchConnected = true;
    });
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Montre synchronisée')));
  }

  Future<void> _addExercise() async {
    final name = TextEditingController();
    final duration = TextEditingController(text: '20');
    final calories = TextEditingController(text: '150');
    var muscle = muscleGroups.first;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Nouvel exercice'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: muscle,
                decoration: const InputDecoration(labelText: 'Groupe', border: OutlineInputBorder()),
                items: muscleGroups.map((m) => DropdownMenuItem(value: m, child: Text(m))).toList(),
                onChanged: (v) => setLocal(() => muscle = v ?? muscle),
              ),
              const SizedBox(height: 8),
              TextField(controller: duration, decoration: const InputDecoration(labelText: 'Durée (min)', border: OutlineInputBorder()), keyboardType: TextInputType.number),
              const SizedBox(height: 8),
              TextField(controller: calories, decoration: const InputDecoration(labelText: 'Calories', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Ajouter')),
          ],
        ),
      ),
    );
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _exercises.insert(0, WorkoutExercise(
        id: 'EX-${_exSeq++}',
        name: name.text,
        muscle: muscle,
        durationMin: int.tryParse(duration.text) ?? 20,
        calories: int.tryParse(calories.text) ?? 150,
        difficulty: 'Moyen',
      )));
    }
  }

  Future<void> _addMeal() async {
    final name = TextEditingController();
    final calories = TextEditingController(text: '300');
    var type = mealTypes[1];
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Ajouter repas'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: name, decoration: const InputDecoration(labelText: 'Aliment / repas', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: type,
                decoration: const InputDecoration(labelText: 'Type', border: OutlineInputBorder()),
                items: mealTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                onChanged: (v) => setLocal(() => type = v ?? type),
              ),
              const SizedBox(height: 8),
              TextField(controller: calories, decoration: const InputDecoration(labelText: 'Calories', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Ajouter')),
          ],
        ),
      ),
    );
    if (ok == true && name.text.isNotEmpty) {
      final cal = int.tryParse(calories.text) ?? 300;
      setState(() => _meals.insert(0, MealEntry(
        id: 'ML-${_mlSeq++}',
        name: name.text,
        mealType: type,
        calories: cal,
        protein: (cal * 0.25 / 4).round(),
        carbs: (cal * 0.45 / 4).round(),
        fat: (cal * 0.30 / 9).round(),
        time: 'Maintenant',
      )));
    }
  }

  String _aiReply(String raw) {
    final q = raw.toLowerCase();
    if (q.contains('bonjour') || q.contains('salut')) {
      return '💪 CoachBot prêt !\nAujourd\'hui : $_eaten kcal mangées · $_burnedTotal kcal brûlées · $_steps pas.';
    }
    if (q.contains('calorie') || q.contains('kcal') || q.contains('bilan')) {
      return '🔥 Bilan calories\n• Consommées : $_eaten kcal\n• Brûlées (sport + montre) : $_burnedTotal kcal\n• Solde : ${_balance > 0 ? '+' : ''}$_balance kcal\n${_balance > 200 ? 'Conseil : séance cardio 30 min.' : _balance < -300 ? 'Pensez à un snack protéiné.' : 'Équilibre correct, continuez !'}';
    }
    if (q.contains('nutrition') || q.contains('repas') || q.contains('manger') || q.contains('protéine')) {
      return '🥗 Nutrition du jour\n• Repas : ${_meals.length}\n• Protéines : $_protein g\n• Dernier : ${_meals.isNotEmpty ? _meals.first.name : '—'}\nConseil : 1,6–2 g protéines / kg pour la prise de masse.';
    }
    if (q.contains('exercice') || q.contains('séance') || q.contains('workout') || q.contains('entrain')) {
      final pending = _exercises.where((e) => !e.done).take(3).toList();
      return pending.isEmpty
          ? 'Tous les exercices sont faits ! Repos actif recommandé.'
          : '🏋️ Prochaine séance :\n${pending.map((e) => '• ${e.name} (${e.muscle}) — ${e.durationMin} min · ${e.calories} kcal').join('\n')}';
    }
    if (q.contains('montre') || q.contains('watch') || q.contains('capteur') || q.contains('sync')) {
      return '⌚ FitBand Pro\n• ${_watchConnected ? 'Connectée' : 'Déconnectée'}\n• Pas : $_steps\n• FC : $_heartRate bpm\n• Actif : $_activeMin min\n• SpO₂ : $_spo2%\nDernière sync : $_lastSync';
    }
    if (q.contains('cardio') || q.contains('course') || q.contains('courir')) {
      return '🏃 Cardio conseillé : 25–35 min zone 2 (FC ~${_heartRate + 20} bpm). Brûle ~300 kcal. Hydratez-vous toutes les 15 min.';
    }
    if (q.contains('repos') || q.contains('récup') || q.contains('fatigue')) {
      return '😴 Récupération : FC repos $_heartRate bpm. ${_heartRate > 80 ? 'Repos léger conseillé.' : 'Bonne récupération.'} Sommeil 7–8 h, étirements 10 min.';
    }
    if (q.contains('plan') || q.contains('programme')) {
      return '📅 Plan du jour\n1. Échauffement 10 min\n2. ${_exercises.where((e) => !e.done).take(2).map((e) => e.name).join(' + ')}\n3. Étirements 5 min\n4. Hydratation + snack protéiné si déficit.';
    }
    return 'Essayez : « calories », « nutrition », « séance », « montre », « plan », « cardio ».';
  }

  Future<void> _sendAi([String? preset]) async {
    final text = (preset ?? _aiInput.text).trim();
    if (text.isEmpty || _aiThinking) return;
    setState(() {
      _chat.add(CoachAiMessage(role: 'user', text: text));
      _aiInput.clear();
      _aiThinking = true;
    });
    await Future<void>.delayed(const Duration(milliseconds: 450));
    if (!mounted) return;
    setState(() {
      _chat.add(CoachAiMessage(role: 'ai', text: _aiReply(text)));
      _aiThinking = false;
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_chatScroll.hasClients) {
        _chatScroll.animateTo(_chatScroll.position.maxScrollExtent, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  Widget _kpi(String label, String value, IconData icon) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, size: 18),
            const SizedBox(height: 6),
            Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text(label, style: Theme.of(context).textTheme.bodySmall),
          ]),
        ),
      ),
    );
  }

  Widget _dashboardTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Text('Coach sportif · FitCoach', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Row(children: [
          _kpi('Mangées', '$_eaten', Icons.restaurant_outlined),
          _kpi('Brûlées', '$_burnedTotal', Icons.local_fire_department_outlined),
          _kpi('Solde', '${_balance > 0 ? '+' : ''}$_balance', Icons.balance),
        ]),
        const SizedBox(height: 4),
        Row(children: [
          _kpi('Pas', '$_steps', Icons.directions_walk),
          _kpi('FC', '$_heartRate', Icons.favorite_outline),
          _kpi('Exos', '$_doneEx/${_exercises.length}', Icons.fitness_center),
        ]),
        const SizedBox(height: 12),
        Card(
          child: ListTile(
            leading: Icon(_watchConnected ? Icons.watch : Icons.watch_off, size: 32),
            title: Text(_watchConnected ? 'FitBand Pro connectée' : 'Montre déconnectée'),
            subtitle: Text('Sync $_lastSync · $_activeMin min actif · SpO₂ $_spo2%'),
            trailing: FilledButton.tonal(onPressed: _syncWatch, child: const Text('Sync')),
          ),
        ),
        const SizedBox(height: 8),
        LinearProgressIndicator(value: (_eaten / 2500).clamp(0, 1), minHeight: 8),
        const SizedBox(height: 4),
        Text('Objectif 2500 kcal · Protéines $_protein g', style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 12),
        Wrap(spacing: 8, runSpacing: 8, children: [
          ActionChip(label: const Text('Exercices'), avatar: const Icon(Icons.fitness_center, size: 18), onPressed: () => setState(() => _tab = 1)),
          ActionChip(label: const Text('Nutrition'), avatar: const Icon(Icons.restaurant, size: 18), onPressed: () => setState(() => _tab = 2)),
          ActionChip(label: const Text('Capteurs'), avatar: const Icon(Icons.sensors, size: 18), onPressed: () => setState(() => _tab = 3)),
          ActionChip(label: const Text('Coach IA'), avatar: const Icon(Icons.smart_toy, size: 18), onPressed: () => setState(() => _tab = 4)),
        ]),
      ],
    );
  }

  Widget _exercisesTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Séances', '${_exercises.length}', Icons.list_alt),
          _kpi('Faits', '$_doneEx', Icons.check_circle_outline),
          _kpi('kcal', '$_burnedWorkout', Icons.local_fire_department_outlined),
        ]),
        const SizedBox(height: 8),
        ..._exercises.map((e) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: Checkbox(value: e.done, onChanged: (v) => setState(() => e.done = v ?? false)),
            title: Text(e.name, style: TextStyle(fontWeight: FontWeight.bold, decoration: e.done ? TextDecoration.lineThrough : null)),
            subtitle: Text('${e.muscle} · ${e.durationMin} min · ${e.calories} kcal · ${e.difficulty}'),
            trailing: IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: () => setState(() => _exercises.remove(e)),
            ),
          ),
        )),
      ],
    );
  }

  Widget _nutritionTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('kcal', '$_eaten', Icons.restaurant),
          _kpi('Prot.', '${_protein}g', Icons.egg_outlined),
          _kpi('Repas', '${_meals.length}', Icons.lunch_dining),
        ]),
        const SizedBox(height: 8),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Macros du jour', style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 8),
              Text('Protéines : $_protein g · Glucides : ${_meals.fold(0, (s, m) => s + m.carbs)} g · Lipides : ${_meals.fold(0, (s, m) => s + m.fat)} g'),
            ]),
          ),
        ),
        const SizedBox(height: 8),
        ..._meals.map((m) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: Text(m.name, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('${m.mealType} · ${m.time}\nP ${m.protein}g · G ${m.carbs}g · L ${m.fat}g'),
            isThreeLine: true,
            trailing: Text('${m.calories} kcal', style: const TextStyle(fontWeight: FontWeight.bold)),
            onLongPress: () => setState(() => _meals.remove(m)),
          ),
        )),
      ],
    );
  }

  Widget _sensorsTab() {
    final sensors = [
      ('Pas', '$_steps', 'pas', Icons.directions_walk),
      ('Fréquence cardiaque', '$_heartRate', 'bpm', Icons.favorite),
      ('Minutes actives', '$_activeMin', 'min', Icons.timer_outlined),
      ('Calories montre', '$_watchCalories', 'kcal', Icons.local_fire_department_outlined),
      ('SpO₂', '$_spo2', '%', Icons.air),
      ('Distance', (_steps * 0.00075).toStringAsFixed(1), 'km', Icons.route),
    ];
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Card(
          child: ListTile(
            leading: Icon(_watchConnected ? Icons.watch : Icons.watch_off, size: 36),
            title: const Text('FitBand Pro'),
            subtitle: Text(_watchConnected ? 'Bluetooth connecté · $_lastSync' : 'Non connectée'),
            trailing: Switch(
              value: _watchConnected,
              onChanged: (v) => setState(() => _watchConnected = v),
            ),
          ),
        ),
        const SizedBox(height: 8),
        FilledButton.icon(onPressed: _syncWatch, icon: const Icon(Icons.sync), label: const Text('Synchroniser la montre')),
        const SizedBox(height: 12),
        Text('Capteurs en direct', style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 6),
        ...sensors.map((s) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: Icon(s.$4),
            title: Text(s.$1),
            trailing: Text('${s.$2} ${s.$3}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          ),
        )),
        const SizedBox(height: 8),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'Les données proviennent de la montre connectée (simulation IoT). FC en zone ${_heartRate < 100 ? 'aérobie légère' : 'élevée'} — adaptez l\'intensité.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
        ),
      ],
    );
  }

  Widget _aiTab() {
    final chips = ['Calories', 'Nutrition', 'Séance', 'Montre', 'Plan cardio', 'Récupération'];
    return Column(children: [
      Expanded(
        child: ListView.builder(
          controller: _chatScroll,
          padding: const EdgeInsets.all(12),
          itemCount: _chat.length + (_aiThinking ? 1 : 0),
          itemBuilder: (ctx, i) {
            if (_aiThinking && i == _chat.length) {
              return const Align(alignment: Alignment.centerLeft, child: Padding(padding: EdgeInsets.all(8), child: Text('CoachBot réfléchit…')));
            }
            final m = _chat[i];
            final isUser = m.role == 'user';
            return Align(
              alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
                decoration: BoxDecoration(
                  color: isUser ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(m.text, style: TextStyle(color: isUser ? Theme.of(context).colorScheme.onPrimary : null)),
              ),
            );
          },
        ),
      ),
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Row(children: chips.map((c) => Padding(
          padding: const EdgeInsets.only(right: 6),
          child: ActionChip(label: Text(c), onPressed: () => _sendAi(c)),
        )).toList()),
      ),
      Padding(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
        child: Row(children: [
          Expanded(child: TextField(controller: _aiInput, decoration: const InputDecoration(hintText: 'Demandez à CoachBot…', border: OutlineInputBorder()), onSubmitted: (_) => _sendAi())),
          const SizedBox(width: 8),
          FilledButton(onPressed: _aiThinking ? null : () => _sendAi(), child: const Icon(Icons.send)),
        ]),
      ),
    ]);
  }

  void _fab() {
    switch (_tab) {
      case 1:
        _addExercise();
      case 2:
        _addMeal();
      case 3:
        _syncWatch();
      case 4:
        _sendAi('Calories');
      default:
        _syncWatch();
    }
  }

  @override
  void dispose() {
    _aiInput.dispose();
    _chatScroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pages = [_dashboardTab(), _exercisesTab(), _nutritionTab(), _sensorsTab(), _aiTab()];
    final labels = ['Sync', 'Exercice', 'Repas', 'Sync montre', 'Coach IA'];
    return Scaffold(
      appBar: AppBar(
        title: const Text('💪 FitCoach'),
        actions: [
          IconButton(tooltip: 'Sync montre', onPressed: _syncWatch, icon: const Icon(Icons.watch)),
          IconButton(
            tooltip: widget.isDark ? 'Mode clair' : 'Mode sombre',
            onPressed: widget.onToggleTheme,
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
          ),
        ],
      ),
      body: pages[_tab],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _fab,
        icon: Icon(_tab == 1 || _tab == 2 ? Icons.add : _tab == 4 ? Icons.smart_toy : Icons.sync),
        label: Text(labels[_tab]),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.fitness_center_outlined), selectedIcon: Icon(Icons.fitness_center), label: 'Exos'),
          NavigationDestination(icon: Icon(Icons.restaurant_outlined), selectedIcon: Icon(Icons.restaurant), label: 'Nutrition'),
          NavigationDestination(icon: Icon(Icons.watch_outlined), selectedIcon: Icon(Icons.watch), label: 'Montre'),
          NavigationDestination(icon: Icon(Icons.smart_toy_outlined), selectedIcon: Icon(Icons.smart_toy), label: 'IA'),
        ],
      ),
    );
  }
}
