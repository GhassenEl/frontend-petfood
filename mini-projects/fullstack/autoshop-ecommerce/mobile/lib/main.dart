import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

const apiBase = 'http://localhost:3300/api/v1';

void main() => runApp(const AutoShopApp());

class AutoShopApp extends StatelessWidget {
  const AutoShopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AutoShop',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF5AD1FF),
          secondary: Color(0xFF7DFFB3),
          surface: Color(0xFF121A28),
        ),
        scaffoldBackgroundColor: const Color(0xFF070D16),
      ),
      home: const HomeShell(),
    );
  }
}

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});
  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int index = 0;
  final pages = const [CarsPage(), AccessoriesPage(), AiPage()];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AutoShop', style: TextStyle(fontWeight: FontWeight.w900)),
        backgroundColor: const Color(0xFF0B1220),
      ),
      body: pages[index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (i) => setState(() => index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.directions_car), label: 'Voitures'),
          NavigationDestination(icon: Icon(Icons.extension), label: 'Accessoires'),
          NavigationDestination(icon: Icon(Icons.auto_awesome), label: 'IA'),
        ],
      ),
    );
  }
}

Future<List<dynamic>> fetchJson(String path) async {
  final res = await http.get(Uri.parse('$apiBase$path'));
  if (res.statusCode != 200) throw Exception('HTTP ${res.statusCode}');
  return jsonDecode(res.body) as List<dynamic>;
}

class CarsPage extends StatefulWidget {
  const CarsPage({super.key});
  @override
  State<CarsPage> createState() => _CarsPageState();
}

class _CarsPageState extends State<CarsPage> {
  late Future<List<dynamic>> future;

  @override
  void initState() {
    super.initState();
    future = fetchJson('/cars');
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: future,
      builder: (context, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snap.hasError) {
          return Center(child: Text('API NestJS requise (:3300)\n${snap.error}', textAlign: TextAlign.center));
        }
        final cars = snap.data ?? [];
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: cars.length,
          itemBuilder: (_, i) {
            final c = cars[i] as Map<String, dynamic>;
            final imageUrl = (c['imageUrl'] as String?) ?? '';
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              clipBehavior: Clip.antiAlias,
              child: InkWell(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => CarDetailPage(carId: c['id'] as int)),
                  );
                },
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (imageUrl.isNotEmpty)
                      SizedBox(
                        height: 170,
                        child: Image.network(
                          imageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: const Color(0xFF1B2738),
                            alignment: Alignment.center,
                            child: const Icon(Icons.directions_car, size: 48),
                          ),
                        ),
                      ),
                    ListTile(
                      title: Text('${c['brand']} ${c['model']}', style: const TextStyle(fontWeight: FontWeight.w800)),
                      subtitle: Text('${c['year']} · ${c['fuel']} · ${c['powerHp'] ?? '—'} ch · ${c['price']} TND'),
                      trailing: const Icon(Icons.chevron_right, color: Color(0xFF5AD1FF)),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class CarDetailPage extends StatefulWidget {
  const CarDetailPage({super.key, required this.carId});
  final int carId;

  @override
  State<CarDetailPage> createState() => _CarDetailPageState();
}

class _CarDetailPageState extends State<CarDetailPage> {
  Map<String, dynamic>? car;
  String? error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await http.get(Uri.parse('$apiBase/cars/${widget.carId}'));
      if (res.statusCode != 200) throw Exception('HTTP ${res.statusCode}');
      setState(() => car = jsonDecode(res.body) as Map<String, dynamic>);
    } catch (e) {
      setState(() => error = '$e');
    }
  }

  Widget _spec(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF121A28),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF243041)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF8FA0B8), fontSize: 12)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Fiche technique')),
        body: Center(child: Text(error!)),
      );
    }
    if (car == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Fiche technique')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    final c = car!;
    final imageUrl = (c['imageUrl'] as String?) ?? '';
    final equipment = (c['equipment'] as List?)?.cast<String>() ?? [];
    final conso = c['consumptionL100'];
    final consoLabel = (conso != null && conso != 0)
        ? '$conso L/100km'
        : (c['fuel'] == 'Électrique' ? 'Électrique' : '—');

    return Scaffold(
      appBar: AppBar(title: Text('${c['brand']} ${c['model']}')),
      body: ListView(
        children: [
          if (imageUrl.isNotEmpty)
            SizedBox(
              height: 220,
              child: Image.network(
                imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  color: const Color(0xFF1B2738),
                  alignment: Alignment.center,
                  child: const Icon(Icons.directions_car, size: 64),
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${c['bodyType']} · ${c['year']}', style: const TextStyle(color: Color(0xFF5AD1FF), fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text('${c['brand']} ${c['model']}', style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900)),
                Text('${c['price']} TND', style: const TextStyle(color: Color(0xFF7DFFB3), fontSize: 22, fontWeight: FontWeight.w800)),
                const SizedBox(height: 8),
                Text('${c['description'] ?? ''}', style: const TextStyle(color: Color(0xFF8FA0B8))),
                const SizedBox(height: 8),
                Text('${c['fuel']} · ${c['transmission']} · ${c['mileageKm']} km · ${c['color']}',
                    style: const TextStyle(color: Color(0xFF8FA0B8))),
                const SizedBox(height: 20),
                const Text('Fiche technique', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                const SizedBox(height: 10),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 8,
                  crossAxisSpacing: 8,
                  childAspectRatio: 1.8,
                  children: [
                    _spec('Moteur', '${c['engine'] ?? '—'}'),
                    _spec('Puissance', '${c['powerHp'] ?? '—'} ch'),
                    _spec('Couple', '${c['torqueNm'] ?? '—'} Nm'),
                    _spec('Propulsion', '${c['drivetrain'] ?? '—'}'),
                    _spec('Portes / places', '${c['doors'] ?? '—'} / ${c['seats'] ?? '—'}'),
                    _spec('Coffre', '${c['trunkLiters'] ?? '—'} L'),
                    _spec('Conso.', consoLabel),
                    _spec('CO₂', c['co2Gkm'] != null && c['co2Gkm'] != 0 ? '${c['co2Gkm']} g/km' : '—'),
                    _spec('0 → 100', '${c['acceleration0to100'] ?? '—'} s'),
                    _spec('Vitesse max', '${c['topSpeedKmh'] ?? '—'} km/h'),
                  ],
                ),
                if (equipment.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  const Text('Équipements', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: equipment
                        .map((e) => Chip(label: Text(e), backgroundColor: const Color(0xFF1B2738)))
                        .toList(),
                  ),
                ],
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () async {
                    final res = await http.get(Uri.parse('$apiBase/ai/cars/${c['id']}/estimate'));
                    if (!context.mounted) return;
                    showDialog(
                      context: context,
                      builder: (_) => AlertDialog(
                        title: const Text('Estimation IA'),
                        content: Text(res.body),
                        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))],
                      ),
                    );
                  },
                  icon: const Icon(Icons.analytics_outlined),
                  label: const Text('Estimation IA'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class AccessoriesPage extends StatefulWidget {
  const AccessoriesPage({super.key});
  @override
  State<AccessoriesPage> createState() => _AccessoriesPageState();
}

class _AccessoriesPageState extends State<AccessoriesPage> {
  late Future<List<dynamic>> future;
  @override
  void initState() {
    super.initState();
    future = fetchJson('/accessories');
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: future,
      builder: (context, snap) {
        if (!snap.hasData) return const Center(child: CircularProgressIndicator());
        final items = snap.data!;
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          itemBuilder: (_, i) {
            final a = items[i] as Map<String, dynamic>;
            return Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                title: Text(a['name'] as String, style: const TextStyle(fontWeight: FontWeight.w800)),
                subtitle: Text('${a['category']} · ${a['price']} TND · stock ${a['stock']}'),
              ),
            );
          },
        );
      },
    );
  }
}

class AiPage extends StatefulWidget {
  const AiPage({super.key});
  @override
  State<AiPage> createState() => _AiPageState();
}

class _AiPageState extends State<AiPage> {
  final controller = TextEditingController();
  final messages = <String>['IA: Demandez une recommandation, un budget ou des accessoires.'];

  Future<void> send() async {
    final text = controller.text.trim();
    if (text.isEmpty) return;
    setState(() {
      messages.add('Vous: $text');
      controller.clear();
    });
    final res = await http.post(
      Uri.parse('$apiBase/ai/chat'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'message': text, 'userId': 1}),
    );
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    setState(() => messages.add('IA: ${data['answer']}'));
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: messages.length,
            itemBuilder: (_, i) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(messages[i]),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller,
                  decoration: const InputDecoration(
                    hintText: 'Ex: SUV hybride 120k',
                    border: OutlineInputBorder(),
                  ),
                  onSubmitted: (_) => send(),
                ),
              ),
              const SizedBox(width: 8),
              FilledButton(onPressed: send, child: const Text('Envoyer')),
            ],
          ),
        ),
      ],
    );
  }
}
