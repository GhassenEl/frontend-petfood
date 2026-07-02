import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import 'api_client.dart';

class AuthService {
  static const _tokenKey = 'jwt_token';
  static const _userKey = 'user_json';
  static const _apiUrlKey = 'api_base_url';

  static const demoUser = {
    'name': 'Client démo',
    'email': 'client@petfood.tn',
    'role': 'client',
  };

  final ApiClient api = ApiClient();
  Map<String, dynamic>? user;
  bool demoMode = false;

  /// Session JWT valide (données live API).
  bool get isAuthenticated => api.token != null && api.token!.isNotEmpty;

  /// Mode démo local (sans login obligatoire au démarrage).
  bool get isDemoMode => demoMode && !isAuthenticated;

  /// Accès à l'app (dashboard, IoT démo, etc.).
  bool get canUseApp => isAuthenticated || demoMode;

  @Deprecated('Use canUseApp or isAuthenticated')
  bool get isLoggedIn => isAuthenticated;

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

    if (isAuthenticated) {
      demoMode = false;
      try {
        final profile = await api.get('/users/profile');
        if (profile is Map<String, dynamic>) {
          user = profile;
        }
      } catch (_) {
        await _clearCredentials(prefs);
        await enterDemoMode();
      }
    } else {
      await enterDemoMode();
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
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final data = await api.post('/auth/login', {
      'email': email,
      'password': password,
    });
    final token = data['token'] as String?;
    final u = data['user'] as Map<String, dynamic>?;
    if (token == null) throw ApiException('Token manquant');

    demoMode = false;
    api.token = token;
    user = u;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    if (u != null) await prefs.setString(_userKey, jsonEncode(u));
    return u ?? {'email': email};
  }

  Future<void> saveApiUrl(String url) async {
    ApiConfig.setBaseUrl(url);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_apiUrlKey, ApiConfig.baseUrl);
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await _clearCredentials(prefs);
    await enterDemoMode();
  }
}
