import 'package:flutter/material.dart';
import 'services/auth_service.dart';
import 'screens/splash_screen.dart';
import 'screens/home_shell.dart';
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
      await _auth.loadSession().timeout(const Duration(seconds: 8));
    } catch (_) {
      await _auth.enterDemoMode();
    }
    if (mounted) setState(() => _ready = true);
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        home: SplashScreen(message: _splashMessage),
      );
    }

    return MaterialApp(
      title: 'PetfoodTN',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: HomeShell(auth: _auth),
    );
  }
}
