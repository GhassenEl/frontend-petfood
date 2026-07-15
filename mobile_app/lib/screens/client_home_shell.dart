import 'package:flutter/material.dart';
import '../models/client_account.dart';
import '../services/auth_service.dart';
import 'notifications_screen.dart';
import 'products_screen.dart';
import 'login_screen.dart';
import 'client_feeding_screen.dart';

/// Accueil client — nourriture, produits et notifications.
class ClientHomeShell extends StatefulWidget {
  const ClientHomeShell({super.key, required this.auth});

  final AuthService auth;

  @override
  State<ClientHomeShell> createState() => _ClientHomeShellState();
}

class _ClientHomeShellState extends State<ClientHomeShell> {
  int _index = 0;

  ClientAccount get _client => ClientAccount.fromUser(widget.auth.user ?? {});

  Future<void> _logout() async {
    await widget.auth.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => LoginScreen(auth: widget.auth)),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      ClientFeedingScreen(
        auth: widget.auth,
        client: _client,
        isOwnAccount: true,
        bottomNavPadding: true,
        onLogout: _logout,
      ),
      ProductsScreen(auth: widget.auth),
      NotificationsScreen(auth: widget.auth, bottomNavPadding: true),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.restaurant_outlined),
            selectedIcon: Icon(Icons.restaurant),
            label: 'Nourriture',
          ),
          NavigationDestination(
            icon: Icon(Icons.shopping_bag_outlined),
            selectedIcon: Icon(Icons.shopping_bag),
            label: 'Produits',
          ),
          NavigationDestination(
            icon: Icon(Icons.notifications_outlined),
            selectedIcon: Icon(Icons.notifications),
            label: 'Notifs',
          ),
        ],
      ),
    );
  }
}
