import 'package:flutter/material.dart';
import 'services/auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/home_shell.dart';

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
    _init();
  }

  Future<void> _init() async {
    await _auth.loadSession();
    setState(() => _ready = true);
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) {
      return const MaterialApp(
        home: Scaffold(body: Center(child: CircularProgressIndicator())),
      );
    }

    return MaterialApp(
      title: 'PetfoodTN',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF059669)),
        useMaterial3: true,
      ),
      home: _auth.isLoggedIn
          ? HomeShell(auth: _auth)
          : LoginScreen(auth: _auth),
    );
  }
}
