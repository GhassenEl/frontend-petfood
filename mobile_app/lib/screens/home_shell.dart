import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'bi_dashboard_screen.dart';
import 'feeder_screen.dart';
import 'food_quality_screen.dart';
import 'products_screen.dart';
import 'profile_screen.dart';
import 'security_screen.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key, required this.auth});

  final AuthService auth;

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      BiDashboardScreen(auth: widget.auth),
      FoodQualityScreen(auth: widget.auth),
      FeederScreen(auth: widget.auth),
      SecurityScreen(auth: widget.auth),
      ProductsScreen(auth: widget.auth),
      ProfileScreen(auth: widget.auth),
    ];

    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'BI'),
          NavigationDestination(icon: Icon(Icons.camera_alt), label: 'Qualité'),
          NavigationDestination(icon: Icon(Icons.pets), label: 'IoT'),
          NavigationDestination(icon: Icon(Icons.shield), label: 'Sécurité'),
          NavigationDestination(icon: Icon(Icons.shopping_bag), label: 'Produits'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }
}
