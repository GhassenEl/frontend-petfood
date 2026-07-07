import 'package:flutter/material.dart';
import 'package:quickbite_fastfood/data/demo_data.dart';

void main() => runApp(const QuickBiteApp());

class QuickBiteApp extends StatefulWidget {
  const QuickBiteApp({super.key});
  @override
  State<QuickBiteApp> createState() => _QuickBiteAppState();
}

class _QuickBiteAppState extends State<QuickBiteApp> {
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
      title: 'QuickBite — Fast-food',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: QuickBiteHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class QuickBiteHome extends StatefulWidget {
  const QuickBiteHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<QuickBiteHome> createState() => _QuickBiteHomeState();
}

class _QuickBiteHomeState extends State<QuickBiteHome> {
  int _tab = 0;
  int _orderSeq = 1043;
  final List<MenuItem> _menu = List.of(initialMenu);
  final List<FoodOrder> _orders = List.of(initialOrders);
  final List<Promo> _promos = List.of(initialPromos);
  static const _statuses = ['En attente', 'En préparation', 'Prête', 'Livrée'];

  int get _revenue => _orders.fold(0, (sum, o) => sum + o.total);
  int get _activeOrders => _orders.where((o) => o.status != 'Livrée').length;

  void _addOrder() async {
    final client = TextEditingController();
    final items = TextEditingController();
    final total = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouvelle commande'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: client, decoration: const InputDecoration(labelText: 'Client')),
          TextField(controller: items, decoration: const InputDecoration(labelText: 'Articles')),
          TextField(controller: total, decoration: const InputDecoration(labelText: 'Total DT'), keyboardType: TextInputType.number),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Créer')),
        ],
      ),
    );
    if (ok == true && client.text.isNotEmpty) {
      setState(() => _orders.insert(0, FoodOrder(
        id: 'QB-${_orderSeq++}',
        client: client.text,
        items: items.text,
        total: int.tryParse(total.text) ?? 0,
        status: 'En attente',
      )));
    }
  }

  void _addMenuItem() async {
    final name = TextEditingController();
    final category = TextEditingController();
    final price = TextEditingController();
    final emoji = TextEditingController(text: '🍽️');
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouvel article'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
          TextField(controller: category, decoration: const InputDecoration(labelText: 'Catégorie')),
          TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix DT'), keyboardType: TextInputType.number),
          TextField(controller: emoji, decoration: const InputDecoration(labelText: 'Emoji')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Ajouter')),
        ],
      ),
    );
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _menu.add(MenuItem(
        name: name.text,
        category: category.text,
        price: int.tryParse(price.text) ?? 0,
        emoji: emoji.text.isEmpty ? '🍽️' : emoji.text,
      )));
    }
  }

  void _addPromo() async {
    final title = TextEditingController();
    final description = TextEditingController();
    final code = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouvelle promo'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: title, decoration: const InputDecoration(labelText: 'Titre')),
          TextField(controller: description, decoration: const InputDecoration(labelText: 'Description')),
          TextField(controller: code, decoration: const InputDecoration(labelText: 'Code')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Ajouter')),
        ],
      ),
    );
    if (ok == true && title.text.isNotEmpty) {
      setState(() => _promos.add(Promo(title: title.text, description: description.text, code: code.text)));
    }
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 2:
        return _addOrder;
      case 1:
        return _addMenuItem;
      case 3:
        return _addPromo;
      default:
        return null;
    }
  }

  void _cycleStatus(FoodOrder o) {
    final i = _statuses.indexOf(o.status);
    setState(() => o.status = _statuses[(i + 1) % _statuses.length]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🍔 QuickBite'),
        actions: [
          IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined)),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _fabAction,
        tooltip: _tab == 1 ? 'Ajouter un article' : _tab == 3 ? 'Ajouter une promo' : 'Nouvelle commande',
        child: const Icon(Icons.add),
      ),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.all(16), children: [
            Text('Tableau de bord', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Commandes actives', value: '$_activeOrders'),
                _Kpi(label: 'CA total', value: '$_revenue DT'),
                _Kpi(label: 'Articles menu', value: '${_menu.length}'),
                _Kpi(label: 'Promos', value: '${_promos.length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Commandes en cours', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._orders.where((o) => o.status != 'Livrée').take(4).map((o) => Card(
              child: ListTile(title: Text('${o.id} — ${o.client}'), subtitle: Text(o.items), trailing: Text('${o.total} DT')),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _menu.map((m) => Card(
            child: ListTile(
              leading: Text(m.emoji, style: const TextStyle(fontSize: 28)),
              title: Text(m.name), subtitle: Text(m.category),
              trailing: Text('${m.price} DT', style: const TextStyle(fontWeight: FontWeight.w800)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _orders.map((o) => Card(
            child: ListTile(
              title: Text(o.id), subtitle: Text('${o.client} · ${o.items}'),
              onTap: () => _cycleStatus(o),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${o.total} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(o.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _promos.map((p) => Card(
            child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(p.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6), Text(p.description),
              const SizedBox(height: 8), Text('Code : ${p.code}', style: const TextStyle(fontWeight: FontWeight.w700)),
            ])),
          )).toList()),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.restaurant_menu_outlined), label: 'Menu'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), label: 'Commandes'),
          NavigationDestination(icon: Icon(Icons.local_offer_outlined), label: 'Promos'),
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
