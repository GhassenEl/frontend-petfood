import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';
import 'pets_screen.dart';
import 'delivery_tracking_screen.dart';
import 'qr_scan_screen.dart';
import 'notifications_screen.dart';
import 'food_quality_screen.dart';

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

  void _openLogin(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => LoginScreen(auth: auth)),
    );
  }

  void _open(BuildContext context, Widget screen) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    final user = auth.user;
    return Scaffold(
      appBar: AppBar(title: const Text('Profil & services'), backgroundColor: const Color(0xFFF3F4F6)),
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
                  if (auth.isDemoMode) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF7ED),
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: const Color(0xFFFED7AA)),
                      ),
                      child: const Text(
                        'Mode démo — connectez-vous pour synchroniser',
                        style: TextStyle(fontSize: 11, color: Color(0xFF9A3412), fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text('Services mobile', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.pets, color: Color(0xFF059669)),
                  title: const Text('Mes animaux'),
                  subtitle: const Text('Gestion profil animal'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _open(context, PetsScreen(auth: auth)),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.local_shipping, color: Color(0xFF1E40AF)),
                  title: const Text('Suivi livraison'),
                  subtitle: const Text('Temps réel · chaîne du froid'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _open(context, DeliveryTrackingScreen(auth: auth)),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.qr_code_scanner, color: Color(0xFF7C3AED)),
                  title: const Text('Scan QR produit'),
                  subtitle: const Text('Traçabilité blockchain lot'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _open(context, QrScanScreen(auth: auth)),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.notifications_active, color: Color(0xFFD97706)),
                  title: const Text('Notifications push'),
                  subtitle: const Text('Alertes IoT et livraison'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _open(context, NotificationsScreen(auth: auth)),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.camera_alt, color: Color(0xFF059669)),
                  title: const Text('Données IoT'),
                  subtitle: const Text('ESP32-CAM qualité alimentaire'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _open(context, FoodQualityScreen(auth: auth)),
                ),
              ],
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
                  leading: const Icon(Icons.phone_android),
                  title: const Text('Plateformes'),
                  subtitle: const Text('Flutter Android & iOS 1.1.0'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          if (auth.isDemoMode)
            FilledButton.icon(
              onPressed: () => _openLogin(context),
              icon: const Icon(Icons.login),
              label: const Text('Se connecter'),
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF059669),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            )
          else
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
