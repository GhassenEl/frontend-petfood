import 'api_config_platform.dart';

/// URL de base du backend PetfoodTN.
/// - Web : localhost:5002
/// - Émulateur Android : 10.0.2.2:5002
/// - Appareil physique : IP LAN du PC via [setBaseUrl]
class ApiConfig {
  static String? _baseUrl;

  static String defaultBaseUrl() => platformDefaultBaseUrl();

  static String get baseUrl => _baseUrl ??= defaultBaseUrl();
  static String get apiUrl => '$baseUrl/api';

  static void setBaseUrl(String url) {
    _baseUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }
}
