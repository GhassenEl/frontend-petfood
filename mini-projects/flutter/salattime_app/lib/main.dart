import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

void main() => runApp(const SalatTimeApp());

/// Matrice grayscale pour le mode noir & blanc.
const _grayscaleMatrix = <double>[
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0, 0, 0, 1, 0,
];

class SalatTimeApp extends StatefulWidget {
  const SalatTimeApp({super.key});

  @override
  State<SalatTimeApp> createState() => _SalatTimeAppState();

  static _SalatTimeAppState? of(BuildContext context) {
    return context.findAncestorStateOfType<_SalatTimeAppState>();
  }
}

class _SalatTimeAppState extends State<SalatTimeApp> {
  bool _monochrome = false;

  bool get isMonochrome => _monochrome;

  void toggleMonochrome() => setState(() => _monochrome = !_monochrome);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SalatTime',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF3DDBB0),
          secondary: Color(0xFFE2C078),
          surface: Color(0xFF10241F),
          onSurface: Color(0xFFE8F5F0),
        ),
        scaffoldBackgroundColor: const Color(0xFF071512),
        fontFamily: 'Segoe UI',
      ),
      builder: (context, child) {
        final content = child ?? const SizedBox.shrink();
        if (!_monochrome) return content;
        return ColorFiltered(
          colorFilter: const ColorFilter.matrix(_grayscaleMatrix),
          child: content,
        );
      },
      home: const PrayerHomePage(),
    );
  }
}

class CityOption {
  const CityOption({
    required this.name,
    required this.country,
    required this.lat,
    required this.lng,
  });

  final String name;
  final String country;
  final double lat;
  final double lng;
}

const cities = <CityOption>[
  CityOption(name: 'Tunis', country: 'Tunisie', lat: 36.8065, lng: 10.1815),
  CityOption(name: 'Sfax', country: 'Tunisie', lat: 34.7398, lng: 10.7600),
  CityOption(name: 'Sousse', country: 'Tunisie', lat: 35.8256, lng: 10.6411),
  CityOption(name: 'Gabès', country: 'Tunisie', lat: 33.8815, lng: 10.0982),
  CityOption(name: 'Bizerte', country: 'Tunisie', lat: 37.2744, lng: 9.8739),
  CityOption(name: 'Kairouan', country: 'Tunisie', lat: 35.6781, lng: 10.0963),
  CityOption(name: 'Gafsa', country: 'Tunisie', lat: 34.4250, lng: 8.7842),
  CityOption(name: 'Monastir', country: 'Tunisie', lat: 35.7770, lng: 10.8262),
  CityOption(name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522),
  CityOption(name: 'Lyon', country: 'France', lat: 45.7640, lng: 4.8357),
  CityOption(name: 'Marseille', country: 'France', lat: 43.2965, lng: 5.3698),
  CityOption(name: 'Casablanca', country: 'Maroc', lat: 33.5731, lng: -7.5898),
  CityOption(name: 'Alger', country: 'Algérie', lat: 36.7538, lng: 3.0588),
  CityOption(name: 'Istanbul', country: 'Turquie', lat: 41.0082, lng: 28.9784),
  CityOption(name: 'La Mecque', country: 'Arabie saoudite', lat: 21.3891, lng: 39.8579),
];

class PrayerTimes {
  PrayerTimes({
    required this.fajr,
    required this.sunrise,
    required this.dhuhr,
    required this.asr,
    required this.maghrib,
    required this.isha,
    required this.hijriDate,
    required this.gregorianDate,
  });

  final DateTime fajr;
  final DateTime sunrise;
  final DateTime dhuhr;
  final DateTime asr;
  final DateTime maghrib;
  final DateTime isha;
  final String hijriDate;
  final String gregorianDate;

  List<({String name, String arabic, DateTime time})> get entries => [
        (name: 'Fajr', arabic: 'الفجر', time: fajr),
        (name: 'Chourouk', arabic: 'الشروق', time: sunrise),
        (name: 'Dhuhr', arabic: 'الظهر', time: dhuhr),
        (name: 'Asr', arabic: 'العصر', time: asr),
        (name: 'Maghrib', arabic: 'المغرب', time: maghrib),
        (name: 'Isha', arabic: 'العشاء', time: isha),
      ];
}

class PrayerHomePage extends StatefulWidget {
  const PrayerHomePage({super.key});

  @override
  State<PrayerHomePage> createState() => _PrayerHomePageState();
}

class _PrayerHomePageState extends State<PrayerHomePage> {
  CityOption _city = cities.first;
  PrayerTimes? _times;
  String? _error;
  bool _loading = true;
  DateTime _now = DateTime.now();
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    _load();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final times = await fetchPrayerTimes(_city);
      if (!mounted) return;
      setState(() {
        _times = times;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Impossible de charger les horaires. Vérifiez la connexion.';
        _loading = false;
      });
    }
  }

  ({String name, String arabic, DateTime time})? get _nextPrayer {
    final times = _times;
    if (times == null) return null;
    for (final entry in times.entries) {
      if (entry.name == 'Chourouk') continue;
      if (entry.time.isAfter(_now)) return entry;
    }
    // Après Isha → Fajr du lendemain (approximation affichée)
    return (name: 'Fajr', arabic: 'الفجر', time: times.fajr.add(const Duration(days: 1)));
  }

  @override
  Widget build(BuildContext context) {
    final next = _nextPrayer;
    final remaining = next?.time.difference(_now);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF0C2A24),
              Color(0xFF071512),
              Color(0xFF050F0D),
            ],
          ),
        ),
        child: SafeArea(
          child: RefreshIndicator(
            color: const Color(0xFF3DDBB0),
            backgroundColor: const Color(0xFF10241F),
            onRefresh: _load,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'SalatTime',
                            style: TextStyle(
                              fontSize: 34,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.8,
                              color: Colors.white.withValues(alpha: 0.96),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Horaires de prière',
                            style: TextStyle(
                              fontSize: 15,
                              color: Colors.white.withValues(alpha: 0.55),
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      tooltip: SalatTimeApp.of(context)?.isMonochrome == true
                          ? 'Revenir aux couleurs'
                          : 'Mode noir & blanc',
                      onPressed: () => SalatTimeApp.of(context)?.toggleMonochrome(),
                      icon: Icon(
                        SalatTimeApp.of(context)?.isMonochrome == true
                            ? Icons.palette_outlined
                            : Icons.filter_b_and_w,
                      ),
                      color: const Color(0xFF3DDBB0),
                    ),
                    IconButton(
                      tooltip: 'Actualiser',
                      onPressed: _loading ? null : _load,
                      icon: const Icon(Icons.refresh_rounded),
                      color: const Color(0xFF3DDBB0),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                _CityPicker(
                  city: _city,
                  onChanged: (city) {
                    setState(() => _city = city);
                    _load();
                  },
                ),
                const SizedBox(height: 20),
                if (_loading)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 80),
                    child: Center(
                      child: CircularProgressIndicator(color: Color(0xFF3DDBB0)),
                    ),
                  )
                else if (_error != null)
                  _ErrorCard(message: _error!, onRetry: _load)
                else if (_times != null) ...[
                  _NextPrayerCard(
                    next: next!,
                    remaining: remaining!,
                    now: _now,
                    hijri: _times!.hijriDate,
                    gregorian: _times!.gregorianDate,
                  ),
                  const SizedBox(height: 18),
                  ..._times!.entries.map((entry) {
                    final isNext = next!.name == entry.name &&
                        entry.time.isAfter(_now.subtract(const Duration(seconds: 1)));
                    final isPast = entry.time.isBefore(_now);
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _PrayerRow(
                        name: entry.name,
                        arabic: entry.arabic,
                        time: entry.time,
                        isNext: isNext && entry.name != 'Chourouk',
                        isPast: isPast,
                      ),
                    );
                  }),
                  const SizedBox(height: 8),
                  Text(
                    'Méthode : Muslim World League · ${_city.name}',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withValues(alpha: 0.35),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _CityPicker extends StatelessWidget {
  const _CityPicker({required this.city, required this.onChanged});

  final CityOption city;
  final ValueChanged<CityOption> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF10241F),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1F4A40)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<CityOption>(
          value: city,
          isExpanded: true,
          dropdownColor: const Color(0xFF132E28),
          icon: const Icon(Icons.expand_more_rounded, color: Color(0xFF3DDBB0)),
          items: cities
              .map(
                (c) => DropdownMenuItem(
                  value: c,
                  child: Text(
                    '${c.name} · ${c.country}',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              )
              .toList(),
          onChanged: (value) {
            if (value != null) onChanged(value);
          },
        ),
      ),
    );
  }
}

class _NextPrayerCard extends StatelessWidget {
  const _NextPrayerCard({
    required this.next,
    required this.remaining,
    required this.now,
    required this.hijri,
    required this.gregorian,
  });

  final ({String name, String arabic, DateTime time}) next;
  final Duration remaining;
  final DateTime now;
  final String hijri;
  final String gregorian;

  String _formatDuration(Duration d) {
    final h = d.inHours;
    final m = d.inMinutes.remainder(60);
    final s = d.inSeconds.remainder(60);
    return '${h.toString().padLeft(2, '0')}:'
        '${m.toString().padLeft(2, '0')}:'
        '${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF164A3E), Color(0xFF0E2F28), Color(0xFF1A3F2F)],
        ),
        border: Border.all(color: const Color(0xFF2F6B58).withValues(alpha: 0.7)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            DateFormat('HH:mm:ss').format(now),
            style: TextStyle(
              fontSize: 13,
              letterSpacing: 1.2,
              color: Colors.white.withValues(alpha: 0.5),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Prochaine prière',
            style: TextStyle(
              fontSize: 14,
              color: const Color(0xFF3DDBB0).withValues(alpha: 0.9),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                next.name,
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(width: 12),
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Text(
                  next.arabic,
                  style: TextStyle(
                    fontSize: 22,
                    color: Colors.white.withValues(alpha: 0.7),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            DateFormat('HH:mm').format(next.time),
            style: const TextStyle(
              fontSize: 42,
              fontWeight: FontWeight.w300,
              letterSpacing: 2,
              color: Color(0xFFE2C078),
            ),
          ),
          const SizedBox(height: 14),
          Text(
            'Dans ${_formatDuration(remaining.isNegative ? Duration.zero : remaining)}',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Color(0xFF3DDBB0),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            '$gregorian  ·  $hijri',
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withValues(alpha: 0.45),
            ),
          ),
        ],
      ),
    );
  }
}

class _PrayerRow extends StatelessWidget {
  const _PrayerRow({
    required this.name,
    required this.arabic,
    required this.time,
    required this.isNext,
    required this.isPast,
  });

  final String name;
  final String arabic;
  final DateTime time;
  final bool isNext;
  final bool isPast;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: isNext ? const Color(0xFF163D34) : const Color(0xFF0E221D),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isNext ? const Color(0xFF3DDBB0) : const Color(0xFF1A3A32),
          width: isNext ? 1.4 : 1,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: isPast && !isNext
                        ? Colors.white.withValues(alpha: 0.4)
                        : Colors.white,
                  ),
                ),
                Text(
                  arabic,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: isPast && !isNext ? 0.3 : 0.55),
                  ),
                ),
              ],
            ),
          ),
          if (isNext)
            Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF3DDBB0).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Suivante',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF3DDBB0),
                ),
              ),
            ),
          Text(
            DateFormat('HH:mm').format(time),
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
              color: isNext
                  ? const Color(0xFFE2C078)
                  : (isPast ? Colors.white.withValues(alpha: 0.35) : Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 40),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1A2420),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF3A4A44)),
      ),
      child: Column(
        children: [
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 14),
          FilledButton(
            onPressed: onRetry,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF3DDBB0),
              foregroundColor: const Color(0xFF071512),
            ),
            child: const Text('Réessayer'),
          ),
        ],
      ),
    );
  }
}

Future<PrayerTimes> fetchPrayerTimes(CityOption city) async {
  final now = DateTime.now();
  final date = DateFormat('dd-MM-yyyy').format(now);
  final uri = Uri.parse(
    'https://api.aladhan.com/v1/timings/$date'
    '?latitude=${city.lat}&longitude=${city.lng}&method=3',
  );

  final response = await http.get(uri).timeout(const Duration(seconds: 12));
  if (response.statusCode != 200) {
    throw Exception('HTTP ${response.statusCode}');
  }

  final json = jsonDecode(response.body) as Map<String, dynamic>;
  final data = json['data'] as Map<String, dynamic>;
  final timings = data['timings'] as Map<String, dynamic>;
  final dateInfo = data['date'] as Map<String, dynamic>;
  final hijri = dateInfo['hijri'] as Map<String, dynamic>;
  final gregorian = dateInfo['gregorian'] as Map<String, dynamic>;

  DateTime parseTime(String raw) {
    final clean = raw.split(' ').first;
    final parts = clean.split(':');
    return DateTime(
      now.year,
      now.month,
      now.day,
      int.parse(parts[0]),
      int.parse(parts[1]),
    );
  }

  return PrayerTimes(
    fajr: parseTime(timings['Fajr'] as String),
    sunrise: parseTime(timings['Sunrise'] as String),
    dhuhr: parseTime(timings['Dhuhr'] as String),
    asr: parseTime(timings['Asr'] as String),
    maghrib: parseTime(timings['Maghrib'] as String),
    isha: parseTime(timings['Isha'] as String),
    hijriDate: '${hijri['day']} ${hijri['month']['en']} ${hijri['year']}',
    gregorianDate: '${gregorian['day']} ${gregorian['month']['en']} ${gregorian['year']}',
  );
}
