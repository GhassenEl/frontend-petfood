import 'package:flutter/material.dart';

/// Écran de démarrage (optionnel) — l'app ouvre d'abord [LoginScreen].
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key, this.message = 'Chargement…'});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF065F46), Color(0xFF059669), Color(0xFF0D9488)],
          ),
        ),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('🐾', style: TextStyle(fontSize: 72)),
              const SizedBox(height: 16),
              const Text(
                'PetfoodTN',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'IoT · Nutrition · Boutique',
                style: TextStyle(color: Colors.white70, fontSize: 15),
              ),
              const SizedBox(height: 40),
              const SizedBox(
                width: 32,
                height: 32,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                message,
                style: const TextStyle(color: Colors.white70, fontSize: 13),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
