import 'package:flutter/material.dart';
import 'package:greenleaf_plants/data/demo_data.dart';

void main() => runApp(const GreenLeafApp());

class GreenLeafApp extends StatefulWidget {
  const GreenLeafApp({super.key});
  @override
  State<GreenLeafApp> createState() => _GreenLeafAppState();
}

class _GreenLeafAppState extends State<GreenLeafApp> {
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
      title: 'GreenLeaf — Boutique plantes',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: GreenLeafHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class GreenLeafHome extends StatefulWidget {
  const GreenLeafHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<GreenLeafHome> createState() => _GreenLeafHomeState();
}

class _GreenLeafHomeState extends State<GreenLeafHome> {
  int _tab = 0;
  int _orderSeq = 4402;
  final List<PlantProduct> _plants = List.of(initialPlants);
  final List<PlantOrder> _orders = List.of(initialOrders);
  final List<AiPlantMessage> _chat = [
    AiPlantMessage(role: 'ai', text: 'Bonjour ! Je suis GreenBot 🌱\nDemandez : « plante débutant », « appartement ombre », « conseil arrosage » ou « analyse panier ».'),
  ];
  final TextEditingController _aiInput = TextEditingController();
  final ScrollController _chatScroll = ScrollController();
  bool _aiThinking = false;

  List<PlantProduct> get _cart => _plants.where((p) => p.inCart).toList();
  int get _revenue => _orders.where((o) => o.status != 'Annulée').fold(0, (s, o) => s + o.total);
  int get _activeOrders => _orders.where((o) => o.status != 'Livrée' && o.status != 'Annulée').length;
  int get _totalStock => _plants.fold(0, (s, p) => s + p.stock);

  Future<bool?> _dialog(String title, List<Widget> fields) {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Column(mainAxisSize: MainAxisSize.min, children: fields),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Valider')),
        ],
      ),
    );
  }

  void _addPlant() async {
    final name = TextEditingController();
    final price = TextEditingController(text: '45');
    final stock = TextEditingController(text: '10');
    final ok = await _dialog('Nouvelle plante', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix DT'), keyboardType: TextInputType.number),
      TextField(controller: stock, decoration: const InputDecoration(labelText: 'Stock'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _plants.insert(0, PlantProduct(
        name: name.text,
        species: 'Variété',
        category: 'Intérieur',
        price: int.tryParse(price.text) ?? 45,
        light: 'Lumière indirecte',
        watering: '1×/semaine',
        stock: int.tryParse(stock.text) ?? 10,
        emoji: '🌿',
      )));
    }
  }

  void _addOrder() async {
    final client = TextEditingController();
    final items = TextEditingController();
    final total = TextEditingController(text: '50');
    final ok = await _dialog('Nouvelle commande', [
      TextField(controller: client, decoration: const InputDecoration(labelText: 'Client')),
      TextField(controller: items, decoration: const InputDecoration(labelText: 'Articles')),
      TextField(controller: total, decoration: const InputDecoration(labelText: 'Total DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && client.text.isNotEmpty) {
      setState(() => _orders.insert(0, PlantOrder(
        id: 'GL-${_orderSeq++}',
        client: client.text,
        items: items.text,
        total: int.tryParse(total.text) ?? 50,
        status: 'En attente',
      )));
    }
  }

  void _toggleCart(PlantProduct p) {
    setState(() => p.inCart = !p.inCart);
  }

  void _sellPlant(PlantProduct p) {
    if (p.stock > 0) setState(() => p.stock--);
  }

  void _cycleOrder(PlantOrder o) {
    final i = orderStatuses.indexOf(o.status);
    setState(() => o.status = orderStatuses[(i + 1) % orderStatuses.length]);
  }

  void _showCare(PlantProduct p) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('${p.emoji} ${p.name}'),
        content: Text(aiCareTip(p).replaceAll('**', '')),
        actions: [FilledButton(onPressed: () => Navigator.pop(ctx), child: const Text('Fermer'))],
      ),
    );
  }

  void _sendAi([String? preset]) {
    final text = (preset ?? _aiInput.text).trim();
    if (text.isEmpty || _aiThinking) return;
    _aiInput.clear();
    setState(() {
      _chat.add(AiPlantMessage(role: 'user', text: text));
      _aiThinking = true;
    });
    Future.delayed(const Duration(milliseconds: 500), () {
      if (!mounted) return;
      setState(() {
        _chat.add(AiPlantMessage(role: 'ai', text: aiPlantChat(text, _plants, _cart)));
        _aiThinking = false;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_chatScroll.hasClients) {
          _chatScroll.animateTo(_chatScroll.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
        }
      });
    });
  }

  void _aiAddToCart() {
    final picks = aiRecommendPlants(_plants, 'débutant appartement', cart: _cart);
    setState(() {
      for (final p in picks) {
        p.inCart = true;
      }
      _chat.add(AiPlantMessage(role: 'user', text: 'Sélection IA pour mon appartement'));
      _chat.add(AiPlantMessage(role: 'ai', text: 'Ajouté au panier :\n${picks.map((p) => '• ${p.emoji} ${p.name}').join('\n')}'));
    });
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 2:
        return _addOrder;
      case 1:
        return _addPlant;
      case 3:
        return () => _sendAi('plante débutant appartement');
      default:
        return null;
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
    final aiPicks = aiRecommendPlants(_plants, 'appartement', cart: _cart);

    return Scaffold(
      appBar: AppBar(
        title: const Text('🌿 GreenLeaf'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: FloatingActionButton(onPressed: _fabAction, child: Icon(_tab == 3 ? Icons.auto_awesome : Icons.add)),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.all(16), children: [
            Text('Boutique en ligne', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Commandes actives', value: '$_activeOrders'),
                _Kpi(label: 'Chiffre d\'affaires', value: '$_revenue DT'),
                _Kpi(label: 'Stock total', value: '$_totalStock'),
                _Kpi(label: 'Panier', value: '${_cart.length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('🤖 Suggestions GreenBot', style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            SizedBox(
              height: 130,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: aiPicks.length,
                separatorBuilder: (context, index) => const SizedBox(width: 10),
                itemBuilder: (_, i) {
                  final p = aiPicks[i];
                  return _PlantChip(plant: p, onTap: () => _showCare(p));
                },
              ),
            ),
            const SizedBox(height: 16),
            const Text('Commandes en cours', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._orders.where((o) => o.status != 'Livrée' && o.status != 'Annulée').take(3).map((o) => Card(
              child: ListTile(title: Text('${o.id} — ${o.client}'), subtitle: Text(o.items), trailing: Text('${o.total} DT')),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _plants.map((p) => Card(
            child: ListTile(
              leading: Text(p.emoji, style: const TextStyle(fontSize: 32)),
              title: Text(p.name),
              subtitle: Text('${p.category} · ${p.light}\n${p.price} DT · Stock ${p.stock}'),
              isThreeLine: true,
              onTap: () => _showCare(p),
              onLongPress: () => _sellPlant(p),
              trailing: IconButton(
                icon: Icon(p.inCart ? Icons.shopping_cart : Icons.shopping_cart_outlined),
                onPressed: () => _toggleCart(p),
              ),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _orders.map((o) => Card(
            child: ListTile(
              leading: const Icon(Icons.local_shipping_outlined),
              title: Text('${o.id} — ${o.client}'),
              subtitle: Text(o.items),
              onTap: () => _cycleOrder(o),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${o.total} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(o.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          Column(children: [
            Expanded(
              child: ListView.builder(
                controller: _chatScroll,
                padding: const EdgeInsets.all(16),
                itemCount: _chat.length + (_aiThinking ? 1 : 0),
                itemBuilder: (_, i) {
                  if (_aiThinking && i == _chat.length) {
                    return const Padding(padding: EdgeInsets.all(8), child: Text('GreenBot réfléchit…'));
                  }
                  final m = _chat[i];
                  final isAi = m.role == 'ai';
                  return Align(
                    alignment: isAi ? Alignment.centerLeft : Alignment.centerRight,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      constraints: const BoxConstraints(maxWidth: 320),
                      decoration: BoxDecoration(
                        color: isAi ? Theme.of(context).colorScheme.surface : Theme.of(context).colorScheme.primary,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.3)),
                      ),
                      child: Text(m.text, style: TextStyle(color: isAi ? Theme.of(context).colorScheme.onSurface : Theme.of(context).colorScheme.onPrimary)),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
              child: Wrap(spacing: 6, runSpacing: 6, children: [
                ActionChip(label: const Text('Débutant'), onPressed: () => _sendAi('plante débutant')),
                ActionChip(label: const Text('Appartement'), onPressed: () => _sendAi('plante appartement')),
                ActionChip(label: const Text('Arrosage'), onPressed: () => _sendAi('conseil arrosage')),
                ActionChip(label: const Text('Panier'), onPressed: _aiAddToCart),
              ]),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: Row(children: [
                Expanded(child: TextField(
                  controller: _aiInput,
                  decoration: const InputDecoration(hintText: 'Demandez à GreenBot…', border: OutlineInputBorder()),
                  onSubmitted: (_) => _sendAi(),
                )),
                const SizedBox(width: 8),
                FilledButton(onPressed: () => _sendAi(), child: const Icon(Icons.send)),
              ]),
            ),
          ]),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.storefront_outlined), label: 'Boutique'),
          NavigationDestination(icon: Icon(Icons.eco_outlined), label: 'Catalogue'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), label: 'Commandes'),
          NavigationDestination(icon: Icon(Icons.smart_toy_outlined), label: 'IA'),
        ],
      ),
    );
  }
}

class _Kpi extends StatelessWidget {
  const _Kpi({required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) {
    return Card(child: Padding(padding: const EdgeInsets.all(14), child: Column(
      crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(label, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
        const SizedBox(height: 6),
        Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
      ],
    )));
  }
}

class _PlantChip extends StatelessWidget {
  const _PlantChip({required this.plant, required this.onTap});
  final PlantProduct plant;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 110,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.3)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(plant.emoji, style: const TextStyle(fontSize: 28)),
          const Spacer(),
          Text(plant.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
          Text('${plant.price} DT', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.secondary)),
        ]),
      ),
    );
  }
}
