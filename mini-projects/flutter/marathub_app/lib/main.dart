import 'package:flutter/material.dart';

import 'screens/ai_coach_screen.dart';
import 'screens/history_screen.dart';
import 'screens/home_screen.dart';
import 'screens/notifications_screen.dart';
import 'services/app_store.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final store = await AppStore.create();
  runApp(MaratHubApp(store: store));
}

class MaratHubApp extends StatelessWidget {
  const MaratHubApp({super.key, required this.store});

  final AppStore store;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: store,
      builder: (context, _) {
        return MaterialApp(
          title: 'MaratHub',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            useMaterial3: true,
            brightness: Brightness.dark,
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFFB8FF3C),
              secondary: Color(0xFFFF6B4A),
              surface: Color(0xFF161A1F),
              onSurface: Color(0xFFF2F4F7),
            ),
            scaffoldBackgroundColor: const Color(0xFF0B0D10),
            fontFamily: 'Segoe UI',
          ),
          home: MaratHubShell(store: store),
        );
      },
    );
  }
}

class MaratHubShell extends StatefulWidget {
  const MaratHubShell({super.key, required this.store});

  final AppStore store;

  @override
  State<MaratHubShell> createState() => _MaratHubShellState();
}

class _MaratHubShellState extends State<MaratHubShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final unread = widget.store.unreadNotifications;
    final pages = [
      HomeScreen(
        store: widget.store,
        onOpenAi: () => setState(() => _index = 1),
        onOpenNotifications: () => setState(() => _index = 3),
      ),
      AiCoachScreen(store: widget.store),
      HistoryScreen(store: widget.store),
      NotificationsScreen(store: widget.store),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        backgroundColor: const Color(0xFF12151A),
        indicatorColor: const Color(0xFFB8FF3C).withValues(alpha: 0.18),
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.directions_run_outlined),
            selectedIcon: Icon(Icons.directions_run),
            label: 'Accueil',
          ),
          const NavigationDestination(
            icon: Icon(Icons.auto_awesome_outlined),
            selectedIcon: Icon(Icons.auto_awesome),
            label: 'IA Coach',
          ),
          const NavigationDestination(
            icon: Icon(Icons.history_outlined),
            selectedIcon: Icon(Icons.history),
            label: 'Historique',
          ),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: unread > 0,
              label: Text('$unread'),
              child: const Icon(Icons.notifications_outlined),
            ),
            selectedIcon: Badge(
              isLabelVisible: unread > 0,
              label: Text('$unread'),
              child: const Icon(Icons.notifications),
            ),
            label: 'Alertes',
          ),
        ],
      ),
    );
  }
}
