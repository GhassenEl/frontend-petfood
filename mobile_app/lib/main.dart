import 'package:flutter/material.dart';
import 'services/auth_service.dart';
import 'screens/login_screen.dart';
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
      await _auth.loadSession().timeout(const Duration(seconds: 5));
    } catch (_) {}
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
        home: Scaffold(
          body: Stack(
            children: [
              _wrapMonochrome(const Center(child: CircularProgressIndicator())),
              const GlobalMonochromeToggle(),
            ],
          ),
        ),
      );
    }

    final home = _auth.isLoggedIn
        ? HomeShell(auth: _auth)
        : LoginScreen(auth: _auth);

    return MaterialApp(
      title: 'PetfoodTN',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: home,
      builder: (context, child) {
        return Stack(
          fit: StackFit.passthrough,
          clipBehavior: Clip.none,
          children: [
            _wrapMonochrome(child ?? const SizedBox.shrink()),
            GlobalMonochromeToggle(
              bottomOffset: _auth.isLoggedIn ? 88 : 16,
            ),
          ],
        );
      },
    );
  }
}
