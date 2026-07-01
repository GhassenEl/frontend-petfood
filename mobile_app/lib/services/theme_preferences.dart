import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Préférences thème global — mode noir & blanc persisté.
class ThemePreferences extends ChangeNotifier {
  ThemePreferences._();
  static final ThemePreferences instance = ThemePreferences._();

  static const _key = 'petfoodtn_theme_monochrome';

  bool _monochrome = false;
  bool _loaded = false;

  bool get isMonochrome => _monochrome;
  bool get isLoaded => _loaded;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    _monochrome = prefs.getBool(_key) ?? false;
    _loaded = true;
    notifyListeners();
  }

  Future<void> toggle() async {
    _monochrome = !_monochrome;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_key, _monochrome);
    notifyListeners();
  }

  static const List<double> grayscaleMatrix = <double>[
    0.2126, 0.7152, 0.0722, 0, 0,
    0.2126, 0.7152, 0.0722, 0, 0,
    0.2126, 0.7152, 0.0722, 0, 0,
    0, 0, 0, 1, 0,
  ];
}
