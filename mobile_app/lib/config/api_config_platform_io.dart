import 'dart:io' show Platform;

/// Android émulateur → 10.0.2.2 ; iOS/desktop → localhost.
String platformDefaultBaseUrl() {
  if (Platform.isAndroid) return 'http://10.0.2.2:5002';
  return 'http://localhost:5002';
}
