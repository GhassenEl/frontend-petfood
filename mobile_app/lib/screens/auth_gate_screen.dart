import 'package:flutter/material.dart';

import '../config/api_config.dart';

import '../services/api_client.dart';

import '../services/auth_service.dart';

import '../utils/auth_navigation.dart';

/// Connexion / inscription — puis accès à l'espace client ou staff.

class AuthGateScreen extends StatefulWidget {

  const AuthGateScreen({super.key, required this.auth, this.initialTab = 0});

  final AuthService auth;
  final int initialTab;



  @override

  State<AuthGateScreen> createState() => _AuthGateScreenState();

}



class _AuthGateScreenState extends State<AuthGateScreen> with SingleTickerProviderStateMixin {

  late final TabController _tabs;



  final _apiUrl = TextEditingController();

  final _email = TextEditingController(text: AuthService.demoEmail);

  final _password = TextEditingController(text: AuthService.demoPassword);

  final _name = TextEditingController();

  final _region = TextEditingController();

  final _confirmPassword = TextEditingController();



  bool _loading = false;

  bool _obscureLogin = true;

  bool _obscureRegister = true;

  String? _error;



  @override

  void initState() {

    super.initState();

    _tabs = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTab.clamp(0, 1),
    );
    _tabs.addListener(() {
      if (!_tabs.indexIsChanging) setState(() {});
    });

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

    _tabs.dispose();

    _apiUrl.dispose();

    _email.dispose();

    _password.dispose();

    _name.dispose();

    _region.dispose();

    _confirmPassword.dispose();

    super.dispose();

  }



  Future<void> _saveApiUrl() => widget.auth.saveApiUrl(_apiUrl.text.trim());



  Future<void> _login() async {

    setState(() {

      _loading = true;

      _error = null;

    });

    try {

      await _saveApiUrl();

      await widget.auth.login(_email.text.trim(), _password.text);

      if (!mounted) return;

      navigateAfterAuth(context, widget.auth);

    } on ApiException catch (e) {

      setState(() => _error = e.message);

    } catch (_) {

      setState(() => _error = 'Connexion impossible. Vérifiez l\'URL API et le backend.');

    } finally {

      if (mounted) setState(() => _loading = false);

    }

  }



  Future<void> _register() async {

    final name = _name.text.trim();

    final email = _email.text.trim().toLowerCase();

    final password = _password.text;

    final confirm = _confirmPassword.text;



    if (name.length < 2) {

      setState(() => _error = 'Nom trop court (2 caractères minimum).');

      return;

    }

    if (!email.contains('@')) {

      setState(() => _error = 'Email invalide.');

      return;

    }

    if (password.length < 8) {

      setState(() => _error = 'Mot de passe : 8 caractères minimum.');

      return;

    }

    if (password != confirm) {

      setState(() => _error = 'Les mots de passe ne correspondent pas.');

      return;

    }



    setState(() {

      _loading = true;

      _error = null;

    });

    try {

      await _saveApiUrl();

      await widget.auth.register(

        name: name,

        email: email,

        password: password,

        region: _region.text.trim().isEmpty ? null : _region.text.trim(),

      );

      if (!mounted) return;

      navigateAfterAuth(context, widget.auth);

    } on ApiException catch (e) {

      setState(() => _error = e.message);

    } catch (_) {

      setState(() => _error = 'Inscription impossible. Vérifiez l\'URL API et le backend.');

    } finally {

      if (mounted) setState(() => _loading = false);

    }

  }



  void _fillDemo(String email, String password, {String? name}) {

    setState(() {

      _email.text = email;

      _password.text = password;

      if (name != null) _name.text = name;

      _error = null;

    });

  }



  @override

  Widget build(BuildContext context) {

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
      ),
      body: Container(

        decoration: const BoxDecoration(

          gradient: LinearGradient(

            begin: Alignment.topLeft,

            end: Alignment.bottomRight,

            colors: [Color(0xFF065F46), Color(0xFF059669), Color(0xFF0D9488)],

          ),

        ),

        child: SafeArea(

          child: Center(

            child: SingleChildScrollView(

              padding: const EdgeInsets.all(24),

              child: ConstrainedBox(

                constraints: const BoxConstraints(maxWidth: 440),

                child: Card(

                  elevation: 12,

                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),

                  child: Padding(

                    padding: const EdgeInsets.all(24),

                    child: Column(

                      crossAxisAlignment: CrossAxisAlignment.stretch,

                      children: [

                        const Text('🐾', textAlign: TextAlign.center, style: TextStyle(fontSize: 48)),

                        const Text(

                          'PetfoodTN',

                          textAlign: TextAlign.center,

                          style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: Color(0xFF065F46)),

                        ),

                        const SizedBox(height: 6),

                        const Text(

                          'Suivez la nourriture de votre animal',

                          textAlign: TextAlign.center,

                          style: TextStyle(color: Color(0xFF64748B), fontSize: 14),

                        ),

                        const SizedBox(height: 20),

                        TextField(

                          controller: _apiUrl,

                          decoration: const InputDecoration(

                            labelText: 'URL API',

                            hintText: 'http://localhost:5002',

                            border: OutlineInputBorder(),

                            prefixIcon: Icon(Icons.link),

                          ),

                        ),

                        const SizedBox(height: 16),

                        TabBar(

                          controller: _tabs,

                          labelColor: const Color(0xFF059669),

                          unselectedLabelColor: const Color(0xFF94A3B8),

                          indicatorColor: const Color(0xFF059669),

                          tabs: const [

                            Tab(text: 'Connexion'),

                            Tab(text: 'Inscription'),

                          ],

                        ),

                        const SizedBox(height: 16),

                        SizedBox(

                          height: _tabs.index == 0 ? 200 : 340,

                          child: TabBarView(

                            controller: _tabs,

                            children: [

                              _loginForm(),

                              _registerForm(),

                            ],

                          ),

                        ),

                        if (_error != null) ...[

                          const SizedBox(height: 8),

                          Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 13)),

                        ],

                        const SizedBox(height: 12),

                        FilledButton(

                          onPressed: _loading

                              ? null

                              : () {

                                  if (_tabs.index == 0) {

                                    _login();

                                  } else {

                                    _register();

                                  }

                                },

                          style: FilledButton.styleFrom(

                            backgroundColor: const Color(0xFF059669),

                            padding: const EdgeInsets.symmetric(vertical: 16),

                          ),

                          child: _loading

                              ? const SizedBox(

                                  height: 22,

                                  width: 22,

                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),

                                )

                              : Text(

                                  _tabs.index == 0 ? 'Se connecter' : 'Créer mon compte',

                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),

                                ),

                        ),

                        const SizedBox(height: 14),

                        const Text('Comptes démo', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),

                        const SizedBox(height: 8),

                        Wrap(

                          spacing: 8,

                          runSpacing: 8,

                          children: [

                            ActionChip(

                              avatar: const Text('🐾'),

                              label: const Text('Client'),

                              onPressed: _loading

                                  ? null

                                  : () => _fillDemo(AuthService.demoEmail, AuthService.demoPassword, name: 'Client démo'),

                            ),

                            ActionChip(

                              avatar: const Text('⚙️'),

                              label: const Text('Admin'),

                              onPressed: _loading

                                  ? null

                                  : () => _fillDemo('admin@petfood.tn', 'PetfoodTN2024!', name: 'Admin'),

                            ),

                          ],

                        ),

                      ],

                    ),

                  ),

                ),

              ),

            ),

          ),

        ),

      ),

    );

  }



  Widget _loginForm() => Column(

        children: [

          TextField(

            controller: _email,

            keyboardType: TextInputType.emailAddress,

            decoration: const InputDecoration(

              labelText: 'Email',

              border: OutlineInputBorder(),

              prefixIcon: Icon(Icons.email_outlined),

            ),

          ),

          const SizedBox(height: 12),

          TextField(

            controller: _password,

            obscureText: _obscureLogin,

            decoration: InputDecoration(

              labelText: 'Mot de passe',

              border: const OutlineInputBorder(),

              prefixIcon: const Icon(Icons.lock_outline),

              suffixIcon: IconButton(

                icon: Icon(_obscureLogin ? Icons.visibility : Icons.visibility_off),

                onPressed: () => setState(() => _obscureLogin = !_obscureLogin),

              ),

            ),

          ),

        ],

      );



  Widget _registerForm() => Column(

        children: [

          TextField(

            controller: _name,

            textCapitalization: TextCapitalization.words,

            decoration: const InputDecoration(

              labelText: 'Nom complet',

              border: OutlineInputBorder(),

              prefixIcon: Icon(Icons.person_outline),

            ),

          ),

          const SizedBox(height: 10),

          TextField(

            controller: _email,

            keyboardType: TextInputType.emailAddress,

            decoration: const InputDecoration(

              labelText: 'Email',

              border: OutlineInputBorder(),

              prefixIcon: Icon(Icons.email_outlined),

            ),

          ),

          const SizedBox(height: 10),

          TextField(

            controller: _region,

            decoration: const InputDecoration(

              labelText: 'Région (optionnel)',

              border: OutlineInputBorder(),

              prefixIcon: Icon(Icons.location_on_outlined),

            ),

          ),

          const SizedBox(height: 10),

          TextField(

            controller: _password,

            obscureText: _obscureRegister,

            decoration: InputDecoration(

              labelText: 'Mot de passe',

              border: const OutlineInputBorder(),

              prefixIcon: const Icon(Icons.lock_outline),

              suffixIcon: IconButton(

                icon: Icon(_obscureRegister ? Icons.visibility : Icons.visibility_off),

                onPressed: () => setState(() => _obscureRegister = !_obscureRegister),

              ),

            ),

          ),

          const SizedBox(height: 10),

          TextField(

            controller: _confirmPassword,

            obscureText: _obscureRegister,

            decoration: const InputDecoration(

              labelText: 'Confirmer le mot de passe',

              border: OutlineInputBorder(),

              prefixIcon: Icon(Icons.lock_outline),

            ),

          ),

        ],

      );

}

