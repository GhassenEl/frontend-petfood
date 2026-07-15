import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../utils/auth_navigation.dart';
import 'auth_gate_screen.dart';

/// Page d'accueil publique avant connexion / inscription.
class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key, required this.auth});

  final AuthService auth;

  void _openAuth(BuildContext context, {int initialTab = 0}) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => AuthGateScreen(auth: auth, initialTab: initialTab),
      ),
    );
  }

  Future<void> _demoLogin(BuildContext context) async {
    final ok = await auth.tryDemoLogin();
    if (!context.mounted) return;
    if (ok) {
      navigateAfterAuth(context, auth);
    } else {
      _openAuth(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF065F46), Color(0xFF059669), Color(0xFF0D9488)],
          ),
        ),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              return SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: constraints.maxHeight - 40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 12),
                      const Icon(Icons.pets, size: 64, color: Colors.white),
                      const SizedBox(height: 8),
                      const Text(
                        'PetfoodTN',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Nutrition et bien-être animal',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white70, fontSize: 16),
                      ),
                      const SizedBox(height: 28),
                      const _FeatureCard(
                        icon: Icons.restaurant,
                        title: 'État nourriture',
                        subtitle: 'Grammes distribués, adhérence et planning par animal.',
                      ),
                      const SizedBox(height: 12),
                      const _FeatureCard(
                        icon: Icons.notifications_active,
                        title: 'Notifications ESP32',
                        subtitle: 'Alertes distributeurs IoT par profil animal.',
                      ),
                      const SizedBox(height: 12),
                      const _FeatureCard(
                        icon: Icons.shopping_bag_outlined,
                        title: 'Produits & boutique',
                        subtitle: 'Catalogue recommandé, avis et alertes livraison.',
                      ),
                      const SizedBox(height: 32),
                      FilledButton.icon(
                        onPressed: () => _openAuth(context),
                        icon: const Icon(Icons.login),
                        style: FilledButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF065F46),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        label: const Text('Se connecter', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        onPressed: () => _openAuth(context, initialTab: 1),
                        icon: const Icon(Icons.person_add_alt_1),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Colors.white70),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        label: const Text('Créer un compte', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      ),
                      const SizedBox(height: 16),
                      TextButton.icon(
                        onPressed: () => _demoLogin(context),
                        icon: const Icon(Icons.bolt, color: Colors.white70, size: 18),
                        label: const Text(
                          'Compte démo client',
                          style: TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  const _FeatureCard({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white.withValues(alpha: 0.12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.white.withValues(alpha: 0.15)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: Colors.white.withValues(alpha: 0.2),
              child: Icon(icon, color: Colors.white),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                  const SizedBox(height: 4),
                  Text(subtitle, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
