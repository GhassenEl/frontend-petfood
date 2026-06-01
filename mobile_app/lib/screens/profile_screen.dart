import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.auth});

  final AuthService auth;

  Future<void> _logout(BuildContext context) async {
    await auth.logout();
    if (!context.mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => LoginScreen(auth: auth)),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = auth.user;
    return Scaffold(
      appBar: AppBar(title: const Text('Profil'), backgroundColor: const Color(0xFFF3F4F6)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const CircleAvatar(radius: 40, child: Text('🐾', style: TextStyle(fontSize: 36))),
                  const SizedBox(height: 12),
                  Text(user?['name']?.toString() ?? 'Client', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  Text(user?['email']?.toString() ?? '', style: const TextStyle(color: Colors.grey)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.link),
                  title: const Text('API backend'),
                  subtitle: Text(ApiConfig.baseUrl),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.memory),
                  title: const Text('Firmware ESP32'),
                  subtitle: const Text('firmware/esp32/PetFeederESP32'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.info_outline),
                  title: const Text('Version'),
                  subtitle: const Text('PetfoodTN Mobile 1.0.0'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: () => _logout(context),
            icon: const Icon(Icons.logout),
            label: const Text('Déconnexion'),
            style: FilledButton.styleFrom(
              backgroundColor: Colors.red.shade400,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ],
      ),
    );
  }
}
