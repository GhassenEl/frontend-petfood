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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🍔 QuickBite'),
        actions: [
          IconButton(
            onPressed: widget.onToggleTheme,
            icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined),
          ),
        ],
      ),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text('Tableau de bord', style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 12),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 1.6,
                children: const [
                  _Kpi(label: 'Commandes jour', value: '47'),
                  _Kpi(label: 'CA du jour', value: '892 DT'),
                  _Kpi(label: 'Temps moyen', value: '12 min'),
                  _Kpi(label: 'Satisfaction', value: '4.6★'),
                ],
              ),
              const SizedBox(height: 16),
              const Text('Commandes en cours', style: TextStyle(fontWeight: FontWeight.w700)),
              ...foodOrders.take(3).map((o) => Card(
                    child: ListTile(
                      title: Text('${o.id} — ${o.client}'),
                      subtitle: Text(o.items),
                      trailing: Text('${o.total} DT'),
                    ),
                  )),
            ],
          ),
          ListView(
            padding: const EdgeInsets.all(16),
            children: menuItems.map((m) => Card(
                  child: ListTile(
                    leading: Text(m.emoji, style: const TextStyle(fontSize: 28)),
                    title: Text(m.name),
                    subtitle: Text(m.category),
                    trailing: Text('${m.price} DT', style: const TextStyle(fontWeight: FontWeight.w800)),
                  ),
                )).toList(),
          ),
          ListView(
            padding: const EdgeInsets.all(16),
            children: foodOrders.map((o) => Card(
                  child: ListTile(
                    title: Text(o.id),
                    subtitle: Text('${o.client} · ${o.items}'),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('${o.total} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                        Text(o.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
                      ],
                    ),
                  ),
                )).toList(),
          ),
          ListView(
            padding: const EdgeInsets.all(16),
            children: promos.map((p) => Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 6),
                        Text(p.description),
                        const SizedBox(height: 8),
                        Text('Code : ${p.code}', style: const TextStyle(fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                )).toList(),
          ),
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
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(label, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
            const SizedBox(height: 6),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
          ],
        ),
      ),
    );
  }
}
