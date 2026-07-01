import 'package:flutter/material.dart';

import '../services/theme_preferences.dart';

/// Bouton flottant noir & blanc — visible sur toute l'app mobile.
class GlobalMonochromeToggle extends StatelessWidget {
  const GlobalMonochromeToggle({super.key, this.bottomOffset = 16});

  final double bottomOffset;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: ThemePreferences.instance,
      builder: (context, _) {
        final active = ThemePreferences.instance.isMonochrome;
        return Positioned(
          left: 16,
          bottom: bottomOffset,
          child: Material(
            elevation: 6,
            shadowColor: Colors.black26,
            borderRadius: BorderRadius.circular(24),
            color: active ? const Color(0xFF1A1A1A) : Colors.white,
            child: InkWell(
              onTap: () => ThemePreferences.instance.toggle(),
              borderRadius: BorderRadius.circular(24),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFF1A1A1A), width: 2),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      active ? '🎨' : '◐',
                      style: const TextStyle(fontSize: 16, height: 1),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      active ? 'Couleurs' : 'Noir & blanc',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: active ? Colors.white : const Color(0xFF1A1A1A),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
