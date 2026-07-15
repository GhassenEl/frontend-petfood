import 'package:flutter/material.dart';
import 'services/auth_service.dart';
import 'services/theme_preferences.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_shell.dart';
import 'screens/client_home_shell.dart';
import 'screens/clients_list_screen.dart';
import 'theme/app_theme.dart';

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
    _init();
  }

  Future<void> _init() async {
    try {
      setState(() => _splashMessage = 'Préparation de l\'espace…');
      await Future.wait([
        _auth.loadSession().timeout(const Duration(seconds: 8)),
        ThemePreferences.instance.load(),
      ]);
    } catch (_) {
      await ThemePreferences.instance.load();
    }
    if (mounted) setState(() => _ready = true);
  }

  Widget _home() {
    if (!_auth.isAuthenticated) {
      return LoginScreen(auth: _auth);
    }
    final role = _auth.userRole ?? 'client';
    if (role == 'admin' || role == 'vendor' || role == 'vet') {
      return ClientsListScreen(auth: _auth);
    }
    if (role == 'client') {
      return ClientHomeShell(auth: _auth);
    }
    return HomeShell(auth: _auth);
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        home: SplashScreen(message: _splashMessage),
      );
    }

    return ListenableBuilder(
      listenable: ThemePreferences.instance,
      builder: (context, _) {
        final mono = ThemePreferences.instance.isMonochrome;
        return MaterialApp(
          title: 'PetfoodTN',
          debugShowCheckedModeBanner: false,
          theme: mono ? AppTheme.monochrome() : AppTheme.light(),
          builder: (context, child) {
            Widget content = child ?? const SizedBox.shrink();
            if (mono) {
              content = ColorFiltered(
                colorFilter: const ColorFilter.matrix(ThemePreferences.grayscaleMatrix),
                child: content,
              );
            }
            return content;
          },
          home: _home(),
        );
      },
    );
  }
}
