import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../utils/auth_navigation.dart';
import 'auth_gate_screen.dart';

/// Page de connexion Flutter — premier écran si non authentifié.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.auth});

  final AuthService auth;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController(text: AuthService.demoEmail);
  final _password = TextEditingController(text: AuthService.demoPassword);
  final _apiUrl = TextEditingController();
  bool _loading = false;
  bool _obscure = true;
  bool _showApi = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _apiUrl.text = ApiConfig.baseUrl;
    _loadLastEmail();
  }

  Future<void> _loadLastEmail() async {
    final saved = await widget.auth.lastEmail();
    if (saved != null && saved.isNotEmpty && mounted) {
      setState(() => _email.text = saved);
    }
  }

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _apiUrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await widget.auth.saveApiUrl(_apiUrl.text.trim());
      await widget.auth.login(_email.text.trim(), _password.text);
      if (!mounted) return;
      navigateAfterAuth(context, widget.auth);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Connexion impossible. Vérifiez l’URL API et le backend (:5002).');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _demoLogin() async {
    setState(() {
      _loading = true;
      _error = null;
      _email.text = AuthService.demoEmail;
      _password.text = AuthService.demoPassword;
    });
    try {
      await widget.auth.saveApiUrl(_apiUrl.text.trim());
      final ok = await widget.auth.tryDemoLogin();
      if (!mounted) return;
      if (ok) {
        navigateAfterAuth(context, widget.auth);
      } else {
        setState(() => _error = 'Compte démo indisponible — démarrez le backend sur :5002.');
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF064E3B), Color(0xFF059669), Color(0xFF0F766E)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 12),
                    const Icon(Icons.pets, size: 56, color: Colors.white),
                    const SizedBox(height: 10),
                    const Text(
                      'PetfoodTN',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: -0.4,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Connexion — IoT & nutrition animale',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white70, fontSize: 14),
                    ),
                    const SizedBox(height: 28),
                    Card(
                      elevation: 0,
                      color: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(20, 22, 20, 18),
                        child: Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const Text(
                                'Se connecter',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF065F46),
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Email démo : client@petfood.tn',
                                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                              ),
                              const SizedBox(height: 18),
                              TextFormField(
                                controller: _email,
                                keyboardType: TextInputType.emailAddress,
                                autofillHints: const [AutofillHints.email],
                                decoration: const InputDecoration(
                                  labelText: 'Email',
                                  border: OutlineInputBorder(),
                                  prefixIcon: Icon(Icons.email_outlined),
                                ),
                                validator: (v) {
                                  if (v == null || v.trim().isEmpty) return 'Email requis';
                                  if (!v.contains('@')) return 'Email invalide';
                                  return null;
                                },
                              ),
                              const SizedBox(height: 12),
                              TextFormField(
                                controller: _password,
                                obscureText: _obscure,
                                autofillHints: const [AutofillHints.password],
                                decoration: InputDecoration(
                                  labelText: 'Mot de passe',
                                  border: const OutlineInputBorder(),
                                  prefixIcon: const Icon(Icons.lock_outline),
                                  suffixIcon: IconButton(
                                    icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                                    onPressed: () => setState(() => _obscure = !_obscure),
                                  ),
                                ),
                                validator: (v) {
                                  if (v == null || v.isEmpty) return 'Mot de passe requis';
                                  return null;
                                },
                                onFieldSubmitted: (_) => _login(),
                              ),
                              const SizedBox(height: 8),
                              Align(
                                alignment: Alignment.centerLeft,
                                child: TextButton.icon(
                                  onPressed: () => setState(() => _showApi = !_showApi),
                                  icon: Icon(_showApi ? Icons.expand_less : Icons.settings_ethernet, size: 18),
                                  label: Text(_showApi ? 'Masquer l’URL API' : 'Configurer l’URL API'),
                                ),
                              ),
                              if (_showApi) ...[
                                TextField(
                                  controller: _apiUrl,
                                  decoration: const InputDecoration(
                                    labelText: 'URL API backend',
                                    hintText: 'http://localhost:5002',
                                    border: OutlineInputBorder(),
                                    prefixIcon: Icon(Icons.link),
                                  ),
                                ),
                                const SizedBox(height: 8),
                              ],
                              if (_error != null) ...[
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFEF2F2),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: const Color(0xFFFECACA)),
                                  ),
                                  child: Text(_error!, style: const TextStyle(color: Color(0xFFB91C1C), fontSize: 13)),
                                ),
                                const SizedBox(height: 12),
                              ],
                              FilledButton.icon(
                                onPressed: _loading ? null : _login,
                                icon: _loading
                                    ? const SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                      )
                                    : const Icon(Icons.login),
                                style: FilledButton.styleFrom(
                                  backgroundColor: const Color(0xFF059669),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                ),
                                label: Text(
                                  _loading ? 'Connexion…' : 'Se connecter',
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(height: 10),
                              OutlinedButton.icon(
                                onPressed: _loading ? null : _demoLogin,
                                icon: const Icon(Icons.bolt),
                                label: const Text('Compte démo client'),
                              ),
                              const SizedBox(height: 6),
                              TextButton(
                                onPressed: _loading
                                    ? null
                                    : () {
                                        Navigator.of(context).push(
                                          MaterialPageRoute(
                                            builder: (_) => AuthGateScreen(auth: widget.auth, initialTab: 1),
                                          ),
                                        );
                                      },
                                child: const Text('Créer un compte'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
