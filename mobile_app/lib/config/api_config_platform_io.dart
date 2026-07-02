import 'dart:io' show Platform;

/// Android émulateur → 10.0.2.2 ; build prod → --dart-define=API_BASE_URL=https://votre-domaine.tn
const _apiBaseFromEnv = String.fromEnvironment('API_BASE_URL', defaultValue: '');

String platformDefaultBaseUrl() {
  if (_apiBaseFromEnv.isNotEmpty) {
    return _apiBaseFromEnv.endsWith('/')
        ? _apiBaseFromEnv.substring(0, _apiBaseFromEnv.length - 1)
        : _apiBaseFromEnv;
  }
  if (Platform.isAndroid) return 'http://10.0.2.2:5002';
  return 'http://localhost:5002';
}
