import 'package:flutter/material.dart';
import '../models/food_quality.dart';
import '../theme/app_theme.dart';

/// Afficheur LCD PETFOODIOT simulé — glow + scanlines.
class PetfoodLcdCard extends StatelessWidget {
  const PetfoodLcdCard({super.key, required this.reading});

  final FoodQualityReading reading;

  @override
  Widget build(BuildContext context) {
    final alert = reading.isNonConforme;
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: (alert ? Colors.red : AppTheme.lcdGreen).withValues(alpha: 0.35),
            blurRadius: 18,
            spreadRadius: -2,
          ),
        ],
      ),
      child: Card(
        margin: EdgeInsets.zero,
        color: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: alert ? Colors.redAccent : AppTheme.lcdGreen,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: (alert ? Colors.redAccent : AppTheme.lcdGreen).withValues(alpha: 0.8),
                          blurRadius: 6,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'PETFOODIOT',
                    style: TextStyle(
                      color: AppTheme.lcdGreen,
                      fontSize: 11,
                      letterSpacing: 2,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Stack(
                children: [
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppTheme.lcdBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: alert ? _AlertContent(reading: reading) : _NormalContent(reading: reading),
                  ),
                  Positioned.fill(
                    child: IgnorePointer(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: CustomPaint(painter: _ScanlinePainter()),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'LCD · I2C · GPIO 14/15',
                style: TextStyle(color: Color(0xFF475569), fontSize: 9),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NormalContent extends StatelessWidget {
  const _NormalContent({required this.reading});
  final FoodQualityReading reading;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _LcdLine('Qualité', '${reading.qualityScore}%', highlight: true),
        _LcdLine('Stock', '${reading.stockLevelPct ?? '—'}%'),
        _LcdLine('État', reading.displayState),
      ],
    );
  }
}

class _AlertContent extends StatelessWidget {
  const _AlertContent({required this.reading});
  final FoodQualityReading reading;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text(
          '⚠ ALERTE',
          style: TextStyle(
            color: Color(0xFFF87171),
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          reading.displayState,
          style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 11, fontFamily: 'monospace'),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 10),
        Text(
          'Qualité : ${reading.qualityScore}%',
          style: const TextStyle(color: AppTheme.lcdGreen, fontFamily: 'monospace', fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}

class _LcdLine extends StatelessWidget {
  const _LcdLine(this.label, this.value, {this.highlight = false});
  final String label;
  final String value;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF64748B), fontFamily: 'monospace', fontSize: 12)),
          Text(
            value,
            style: TextStyle(
              color: highlight ? AppTheme.lcdGreen : const Color(0xFF86EFAC),
              fontFamily: 'monospace',
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

class _ScanlinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white.withValues(alpha: 0.03);
    for (var y = 0.0; y < size.height; y += 3) {
      canvas.drawRect(Rect.fromLTWH(0, y, size.width, 1), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
