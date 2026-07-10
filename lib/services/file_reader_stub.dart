import 'dart:typed_data';

import 'package:http/http.dart' as http;

Future<Uint8List?> readPathBytes(String path) async {
  final res = await http.get(Uri.parse(path));
  return res.bodyBytes;
}

Future<Uint8List?> readWebBlob(String path) => readPathBytes(path);
