import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import 'api_client.dart';

class AuthService {
  static const _tokenKey = 'jwt_token';
  static const _userKey = 'user_json';
  static const _apiUrlKey = 'api_base_url';
  static const _lastEmailKey = 'last_email';

  static const demoEmail = 'client@petfood.tn';
  static const demoPassword = 'MonChat123!';

  static const demoUser = {
    'name': 'Client démo',
    'email': demoEmail,
    'role': 'client',
  };

  final ApiClient api = ApiClient();
  Map<String, dynamic>? user;
  bool demoMode = false;

  /// Session JWT valide (données live API).
  bool get isAuthenticated => api.token != null && api.token!.isNotEmpty;

  /// Mode démo local (sans JWT).
  bool get isDemoMode => demoMode && !isAuthenticated;

  /// Accès à l'app après login (ou démo explicite).
  bool get canUseApp => isAuthenticated || demoMode;

  String get role => (user?['role'] ?? 'client').toString();
  String? get userRole => user?['role']?.toString();

  @Deprecated('Use canUseApp or isAuthenticated')
  bool get isLoggedIn => isAuthenticated;

  /// Charge une session JWT déjà sauvegardée — sans auto-login démo.
  Future<void> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUrl = prefs.getString(_apiUrlKey);
    if (savedUrl != null && savedUrl.isNotEmpty) {
      ApiConfig.setBaseUrl(savedUrl);
    }
    api.token = prefs.getString(_tokenKey);
    final raw = prefs.getString(_userKey);
    if (raw != null) {
      try {
        user = Map<String, dynamic>.from(jsonDecode(raw) as Map);
      } catch (_) {}
    }

    if (!isAuthenticated) {
      user = null;
      demoMode = false;
      return;
    }

    demoMode = false;
    try {
      final profile = await api.get('/users/profile');
      if (profile is Map) {
        user = Map<String, dynamic>.from(profile);
        await prefs.setString(_userKey, jsonEncode(user));
      }
    } catch (_) {
      await _clearCredentials(prefs);
    }
  }

  Future<String?> lastEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_lastEmailKey);
  }

  /// Connexion silencieuse au compte client démo (bouton dédié uniquement).
  Future<bool> tryDemoLogin() async {
    try {
      await login(demoEmail, demoPassword);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> enterDemoMode() async {
    demoMode = true;
    user = Map<String, dynamic>.from(demoUser);
    api.token = null;
  }

  Future<void> _clearCredentials(SharedPreferences prefs) async {
    api.token = null;
    user = null;
    demoMode = false;
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final data = await api.post('/auth/login', {
      'email': email,
      'password': password,
    });
    final token = data['token'] as String?;
    final u = data['user'] as Map?;
    if (token == null) throw ApiException('Token manquant');

    demoMode = false;
    api.token = token;
    user = u != null ? Map<String, dynamic>.from(u) : Map<String, dynamic>.from(demoUser);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user));
    await prefs.setString(_lastEmailKey, email.trim().toLowerCase());
    return user!;
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String? region,
  }) async {
    final body = <String, dynamic>{
      'name': name,
      'email': email,
      'password': password,
      'role': 'client',
    };
    if (region != null && region.isNotEmpty) body['region'] = region;

    final data = await api.post('/auth/register', body);
    final token = data['token'] as String?;
    final u = data['user'] as Map?;

    if (token != null) {
      demoMode = false;
      api.token = token;
      user = u != null ? Map<String, dynamic>.from(u) : {
        'name': name,
        'email': email,
        'role': 'client',
      };
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, token);
      await prefs.setString(_userKey, jsonEncode(user));
      await prefs.setString(_lastEmailKey, email.trim().toLowerCase());
      return user!;
    }

    // Certains backends renvoient seulement le user → login ensuite
    return login(email, password);
  }

  Future<void> saveApiUrl(String url) async {
    ApiConfig.setBaseUrl(url);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_apiUrlKey, ApiConfig.baseUrl);
  }

  /// Déconnexion complète → retour écran login (pas de ré-auto-login).
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await _clearCredentials(prefs);
  }
}
