import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class OpenAiService {
  OpenAiService({this.apiKey = ''});

  String apiKey;
  static const _base = 'https://api.openai.com/v1';

  bool get hasKey => apiKey.trim().isNotEmpty;

  Map<String, String> get _headers => {
        'Authorization': 'Bearer $apiKey',
        'Content-Type': 'application/json',
      };

  Future<String> chat(List<Map<String, String>> messages, {String model = 'gpt-4o-mini'}) async {
    if (!hasKey) return _demoChat(messages.last['content'] ?? '');
    final res = await http.post(
      Uri.parse('$_base/chat/completions'),
      headers: _headers,
      body: jsonEncode({
        'model': model,
        'messages': messages,
        'max_tokens': 800,
      }),
    );
    if (res.statusCode != 200) throw Exception(_err(res));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return data['choices'][0]['message']['content'] as String;
  }

  Future<String> transcribe(Uint8List audioBytes, {String filename = 'audio.m4a'}) async {
    if (!hasKey) return 'Transcription démo : « Bonjour, comment puis-je vous aider ? »';
    final req = http.MultipartRequest('POST', Uri.parse('$_base/audio/transcriptions'));
    req.headers['Authorization'] = 'Bearer $apiKey';
    req.fields['model'] = 'whisper-1';
    req.fields['language'] = 'fr';
    req.files.add(http.MultipartFile.fromBytes('file', audioBytes, filename: filename));
    final streamed = await req.send();
    final res = await http.Response.fromStream(streamed);
    if (res.statusCode != 200) throw Exception(_err(res));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return data['text'] as String? ?? '';
  }

  Future<Uint8List> textToSpeech(String text, {String voice = 'nova'}) async {
    if (!hasKey) throw Exception('Clé API requise pour la synthèse vocale.');
    final res = await http.post(
      Uri.parse('$_base/audio/speech'),
      headers: _headers,
      body: jsonEncode({
        'model': 'tts-1',
        'input': text.length > 500 ? '${text.substring(0, 500)}…' : text,
        'voice': voice,
        'response_format': 'mp3',
      }),
    );
    if (res.statusCode != 200) throw Exception(_err(res));
    return res.bodyBytes;
  }

  Future<String> ocrImage(Uint8List imageBytes, {String mime = 'image/jpeg'}) async {
    if (!hasKey) {
      return 'Texte extrait (démo OCR)\n\nFACTURE N° 2026-0847\nDate : 08/07/2026\nClient : Société Lido\nMontant TTC : 1 250,00 TND\n\nAjoutez votre clé OpenAI pour l\'OCR réel (GPT-4o Vision).';
    }
    final b64 = base64Encode(imageBytes);
    final dataUrl = 'data:$mime;base64,$b64';
    final res = await http.post(
      Uri.parse('$_base/chat/completions'),
      headers: _headers,
      body: jsonEncode({
        'model': 'gpt-4o-mini',
        'messages': [
          {
            'role': 'user',
            'content': [
              {'type': 'text', 'text': 'Extrais tout le texte visible de cette image. Conserve la mise en forme si possible. Réponds uniquement avec le texte extrait.'},
              {'type': 'image_url', 'image_url': {'url': dataUrl}},
            ],
          },
        ],
        'max_tokens': 1200,
      }),
    );
    if (res.statusCode != 200) throw Exception(_err(res));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return data['choices'][0]['message']['content'] as String;
  }

  Future<String> generateImage(String prompt, {String size = '1024x1024'}) async {
    if (!hasKey) {
      return 'https://picsum.photos/seed/${Uri.encodeComponent(prompt)}/512/512';
    }
    final res = await http.post(
      Uri.parse('$_base/images/generations'),
      headers: _headers,
      body: jsonEncode({
        'model': 'dall-e-3',
        'prompt': prompt,
        'n': 1,
        'size': size,
      }),
    );
    if (res.statusCode != 200) throw Exception(_err(res));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return data['data'][0]['url'] as String;
  }

  Future<String> translate(String text, String targetLang) async {
    if (!hasKey) return _demoTranslate(text, targetLang);
    return chat([
      {'role': 'system', 'content': 'Tu es un traducteur professionnel. Traduis uniquement le texte, sans commentaire.'},
      {'role': 'user', 'content': 'Traduis en $targetLang :\n$text'},
    ]);
  }

  String _err(http.Response res) {
    try {
      final j = jsonDecode(res.body) as Map<String, dynamic>;
      final err = j['error'];
      if (err is Map) return err['message'] as String? ?? res.body;
    } catch (_) {}
    return 'Erreur ${res.statusCode} : ${res.body}';
  }

  String _demoChat(String q) {
    final lower = q.toLowerCase();
    if (lower.contains('bonjour') || lower.contains('salut')) return 'Bonjour ! Je suis AIHub en mode démo. Ajoutez votre clé OpenAI (icône clé) pour activer GPT-4o.';
    if (lower.contains('whisper') || lower.contains('voix')) return 'Whisper transcrit votre voix en texte. TTS lit les réponses à voix haute. Clé API requise.';
    if (lower.contains('ocr')) return 'L\'onglet OCR extrait le texte des images via GPT-4o Vision.';
    if (lower.contains('image') || lower.contains('dall')) return 'DALL-E 3 génère des images depuis une description textuelle.';
    if (lower.contains('trad')) return 'L\'onglet Traduction supporte FR, EN, AR, ES, DE et plus.';
    return 'Mode démo actif. Posez une question ou configurez votre clé API OpenAI pour GPT-4o, Whisper, TTS et DALL-E.';
  }

  String _demoTranslate(String text, String lang) {
    const samples = {
      'Anglais': 'Hello, this is a demo translation.',
      'Arabe': 'مرحبا، هذه ترجمة تجريبية.',
      'Espagnol': 'Hola, esta es una traducción de demostración.',
      'Allemand': 'Hallo, dies ist eine Demo-Übersetzung.',
    };
    return '${samples[lang] ?? 'Translated text (demo)'}\n\n[Original] $text';
  }
}
