import 'package:flutter/material.dart';
import 'services/auth_service.dart';
import 'screens/splash_screen.dart';
import 'screens/home_shell.dart';
import 'services/theme_preferences.dart';
import 'theme/app_theme.dart';
import 'widgets/global_monochrome_toggle.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const PetfoodTnApp());
}

class PetfoodTnApp extends StatefulWidget {
  const PetfoodTnApp({super.key});

  @override
  State<PetfoodTnApp> createState() => _PetfoodTnAppState();
}

class _PetfoodTnAppState extends State<PetfoodTnApp> {
  final AuthService _auth = AuthService();
  bool _ready = false;
  String _splashMessage = 'Chargement…';

  @override
  void initState() {
    super.initState();
    ThemePreferences.instance.addListener(_onThemeChanged);
    _init();
  }

  @override
  void dispose() {
    ThemePreferences.instance.removeListener(_onThemeChanged);
    super.dispose();
  }

  void _onThemeChanged() => setState(() {});

  Future<void> _init() async {
    try {
      await ThemePreferences.instance.load().timeout(const Duration(seconds: 5));
    } catch (_) {}
    try {
      setState(() => _splashMessage = 'Préparation de l\'espace…');
      await _auth.loadSession().timeout(const Duration(seconds: 8));
    } catch (_) {
      await _auth.enterDemoMode();
    }
    if (mounted) setState(() => _ready = true);
  }

  Widget _wrapMonochrome(Widget child) {
    if (!ThemePreferences.instance.isMonochrome) return child;
    return ColorFiltered(
      colorFilter: const ColorFilter.matrix(ThemePreferences.grayscaleMatrix),
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Stack(
          children: [
            _wrapMonochrome(SplashScreen(message: _splashMessage)),
            const GlobalMonochromeToggle(),
          ],
        ),
      );
    }

    return MaterialApp(
      title: 'PetfoodTN',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: HomeShell(auth: _auth),
      builder: (context, child) {
        return Stack(
          fit: StackFit.passthrough,
          clipBehavior: Clip.none,
          children: [
            _wrapMonochrome(child ?? const SizedBox.shrink()),
            GlobalMonochromeToggle(
              bottomOffset: 88,
            ),
          ],
        );
      },
    );
  }
}
