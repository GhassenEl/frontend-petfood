import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import 'api_client.dart';

class AuthService {
  static const _tokenKey = 'jwt_token';
  static const _userKey = 'user_json';
  static const _apiUrlKey = 'api_base_url';

  final ApiClient api = ApiClient();
  Map<String, dynamic>? user;

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
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final data = await api.post('/auth/login', {
      'email': email,
      'password': password,
    });
    final token = data['token'] as String?;
    final u = data['user'] as Map<String, dynamic>?;
    if (token == null) throw ApiException('Token manquant');

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
    api.token = null;
    user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  bool get isLoggedIn => api.token != null && api.token!.isNotEmpty;
}
