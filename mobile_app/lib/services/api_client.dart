import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiException implements Exception {
  ApiException(this.message, [this.statusCode]);
  final String message;
  final int? statusCode;
  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({this.token});

  String? token;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Uri _uri(String path, [Map<String, String>? query]) {
    final base = ApiConfig.apiUrl;
    final url = path.startsWith('/') ? '$base$path' : '$base/$path';
    return Uri.parse(url).replace(queryParameters: query);
  }

  Future<dynamic> get(String path, {Map<String, String>? query}) async {
    final res = await http.get(_uri(path, query), headers: _headers);
    return _decode(res);
  }

  Future<dynamic> post(String path, [Map<String, dynamic>? body]) async {
    final res = await http.post(
      _uri(path),
      headers: _headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return _decode(res);
  }

  Future<dynamic> delete(String path) async {
    final res = await http.delete(_uri(path), headers: _headers);
    return _decode(res);
  }

  dynamic _decode(http.Response res) {
    dynamic data;
    try {
      data = res.body.isNotEmpty ? jsonDecode(res.body) : null;
    } catch (_) {
      data = res.body;
    }
    if (res.statusCode >= 200 && res.statusCode < 300) return data;
    final msg = data is Map ? (data['error'] ?? data['message'] ?? res.body) : res.body;
    throw ApiException(msg.toString(), res.statusCode);
  }
}
