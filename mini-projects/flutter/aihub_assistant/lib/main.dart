import 'package:aihub_assistant/services/file_reader.dart';
import 'package:aihub_assistant/services/openai_service.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

void main() => runApp(const AiHubApp());

class AiHubApp extends StatefulWidget {
  const AiHubApp({super.key});
  @override
  State<AiHubApp> createState() => _AiHubAppState();
}

class _AiHubAppState extends State<AiHubApp> {
  ThemeMode _mode = ThemeMode.dark;

  static final _light = ThemeData(
    brightness: Brightness.light,
    useMaterial3: true,
    colorScheme: const ColorScheme.light(primary: Colors.black, onPrimary: Colors.white, secondary: Color(0xFF525252), surface: Colors.white, onSurface: Colors.black),
    scaffoldBackgroundColor: const Color(0xFFFAFAFA),
  );

  static final _dark = ThemeData(
    brightness: Brightness.dark,
    useMaterial3: true,
    colorScheme: const ColorScheme.dark(primary: Colors.white, onPrimary: Colors.black, secondary: Color(0xFFB0B0B0), surface: Color(0xFF141414), onSurface: Colors.white),
    scaffoldBackgroundColor: Colors.black,
  );

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AIHub — Assistant IA',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: AiHubHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class ChatMsg {
  ChatMsg({required this.role, required this.text});
  final String role;
  final String text;
}

class AiHubHome extends StatefulWidget {
  const AiHubHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<AiHubHome> createState() => _AiHubHomeState();
}

class _AiHubHomeState extends State<AiHubHome> {
  int _tab = 0;
  final _openAi = OpenAiService();
  final _audioRecorder = AudioRecorder();
  final _audioPlayer = AudioPlayer();

  // Chat
  final _chatCtrl = TextEditingController();
  final _chatScroll = ScrollController();
  final List<ChatMsg> _chat = [
    ChatMsg(role: 'ai', text: 'Bonjour ! Je suis AIHub 🤖\nChat GPT-4o, Whisper (voix), OCR, DALL-E et traduction.\nConfigurez votre clé API OpenAI via l\'icône 🔑.'),
  ];
  bool _chatBusy = false;

  // Vocal
  bool _recording = false;
  String _transcript = '';
  bool _voiceBusy = false;

  // OCR
  Uint8List? _ocrImage;
  String? _ocrMime;
  String _ocrResult = '';
  bool _ocrBusy = false;

  // Images
  final _imgPrompt = TextEditingController(text: 'Usine connectée futuriste, style minimaliste noir et blanc');
  String? _imgUrl;
  bool _imgBusy = false;

  // Traduction
  final _transSrc = TextEditingController(text: 'Bienvenue sur AIHub, votre assistant intelligent.');
  String _transTarget = 'Anglais';
  String _transResult = '';
  bool _transBusy = false;

  static const _langs = ['Anglais', 'Arabe', 'Espagnol', 'Allemand', 'Italien', 'Français'];

  Future<void> _showApiKeyDialog() async {
    final ctrl = TextEditingController(text: _openAi.apiKey);
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Clé API OpenAI'),
        content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Votre clé reste en mémoire locale (non envoyée ailleurs).', style: TextStyle(fontSize: 12)),
          const SizedBox(height: 12),
          TextField(
            controller: ctrl,
            decoration: const InputDecoration(labelText: 'sk-…', border: OutlineInputBorder()),
            obscureText: true,
            autofocus: true,
          ),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Enregistrer')),
        ],
      ),
    );
    if (ok == true) setState(() => _openAi.apiKey = ctrl.text.trim());
  }

  Future<void> _sendChat([String? preset]) async {
    final text = (preset ?? _chatCtrl.text).trim();
    if (text.isEmpty || _chatBusy) return;
    setState(() {
      _chat.add(ChatMsg(role: 'user', text: text));
      _chatCtrl.clear();
      _chatBusy = true;
    });
    _scrollChat();
    try {
      final history = _chat.map((m) => {'role': m.role == 'ai' ? 'assistant' : 'user', 'content': m.text}).toList();
      final reply = await _openAi.chat(history);
      if (!mounted) return;
      setState(() => _chat.add(ChatMsg(role: 'ai', text: reply)));
    } catch (e) {
      if (!mounted) return;
      setState(() => _chat.add(ChatMsg(role: 'ai', text: 'Erreur : $e')));
    } finally {
      if (mounted) setState(() => _chatBusy = false);
      _scrollChat();
    }
  }

  void _scrollChat() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_chatScroll.hasClients) _chatScroll.jumpTo(_chatScroll.position.maxScrollExtent);
    });
  }

  Future<void> _toggleRecord() async {
    if (_recording) {
      final path = await _audioRecorder.stop();
      setState(() { _recording = false; _voiceBusy = true; });
      try {
        Uint8List? bytes;
        if (path != null) bytes = await _readPathBytes(path);
        if (bytes == null || bytes.isEmpty) {
          setState(() => _transcript = 'Aucun audio capturé. Importez un fichier audio ou réessayez.');
          return;
        }
        final text = await _openAi.transcribe(bytes);
        if (!mounted) return;
        setState(() => _transcript = text);
      } catch (e) {
        if (!mounted) return;
        setState(() => _transcript = 'Erreur Whisper : $e');
      } finally {
        if (mounted) setState(() => _voiceBusy = false);
      }
      return;
    }

    if (!await _audioRecorder.hasPermission()) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Permission micro refusée')));
      return;
    }
    final dir = kIsWeb ? null : await getTemporaryDirectory();
    final path = kIsWeb ? 'aihub_rec.m4a' : '${dir!.path}/aihub_rec.m4a';
    await _audioRecorder.start(const RecordConfig(encoder: AudioEncoder.aacLc, bitRate: 128000, sampleRate: 44100), path: path);
    setState(() => _recording = true);
  }

  Future<Uint8List?> _readPathBytes(String path) => readPathBytes(path);

  Future<void> _importAudio() async {
    final result = await FilePicker.platform.pickFiles(type: FileType.audio, withData: true);
    if (result == null || result.files.isEmpty || result.files.first.bytes == null) return;
    setState(() => _voiceBusy = true);
    try {
      final text = await _openAi.transcribe(result.files.first.bytes!, filename: result.files.first.name);
      if (!mounted) return;
      setState(() => _transcript = text);
    } catch (e) {
      if (!mounted) return;
      setState(() => _transcript = 'Erreur Whisper : $e');
    } finally {
      if (mounted) setState(() => _voiceBusy = false);
    }
  }

  Future<void> _speakTts() async {
    final text = _transcript.isNotEmpty ? _transcript : (_chat.isNotEmpty ? _chat.last.text : '');
    if (text.isEmpty) return;
    setState(() => _voiceBusy = true);
    try {
      final bytes = await _openAi.textToSpeech(text);
      await _audioPlayer.play(BytesSource(bytes));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('TTS : $e')));
    } finally {
      if (mounted) setState(() => _voiceBusy = false);
    }
  }

  Future<void> _pickOcrImage() async {
    final result = await FilePicker.platform.pickFiles(type: FileType.image, withData: true);
    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;
    if (file.bytes == null) return;
    setState(() {
      _ocrImage = file.bytes;
      _ocrMime = _mimeFromExt(file.extension);
      _ocrResult = '';
    });
  }

  String _mimeFromExt(String? ext) => switch (ext?.toLowerCase()) {
        'png' => 'image/png',
        'webp' => 'image/webp',
        'gif' => 'image/gif',
        _ => 'image/jpeg',
      };

  Future<void> _runOcr() async {
    if (_ocrImage == null) return;
    setState(() => _ocrBusy = true);
    try {
      final text = await _openAi.ocrImage(_ocrImage!, mime: _ocrMime ?? 'image/jpeg');
      if (!mounted) return;
      setState(() => _ocrResult = text);
    } catch (e) {
      if (!mounted) return;
      setState(() => _ocrResult = 'Erreur OCR : $e');
    } finally {
      if (mounted) setState(() => _ocrBusy = false);
    }
  }

  Future<void> _generateImage() async {
    final prompt = _imgPrompt.text.trim();
    if (prompt.isEmpty) return;
    setState(() { _imgBusy = true; _imgUrl = null; });
    try {
      final url = await _openAi.generateImage(prompt);
      if (!mounted) return;
      setState(() => _imgUrl = url);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('DALL-E : $e')));
    } finally {
      if (mounted) setState(() => _imgBusy = false);
    }
  }

  Future<void> _runTranslate() async {
    final text = _transSrc.text.trim();
    if (text.isEmpty || _transBusy) return;
    setState(() => _transBusy = true);
    try {
      final result = await _openAi.translate(text, _transTarget);
      if (!mounted) return;
      setState(() => _transResult = result);
    } catch (e) {
      if (!mounted) return;
      setState(() => _transResult = 'Erreur : $e');
    } finally {
      if (mounted) setState(() => _transBusy = false);
    }
  }

  Widget _chatTab() {
    return Column(children: [
      Expanded(
        child: ListView.builder(
          controller: _chatScroll,
          padding: const EdgeInsets.all(12),
          itemCount: _chat.length + (_chatBusy ? 1 : 0),
          itemBuilder: (ctx, i) {
            if (_chatBusy && i == _chat.length) {
              return const Align(alignment: Alignment.centerLeft, child: Padding(padding: EdgeInsets.all(8), child: Chip(label: Text('GPT-4o réfléchit…'))));
            }
            final msg = _chat[i];
            final isAi = msg.role == 'ai';
            return Align(
              alignment: isAi ? Alignment.centerLeft : Alignment.centerRight,
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.85),
                decoration: BoxDecoration(
                  color: isAi ? Theme.of(context).colorScheme.surfaceContainerHighest : Theme.of(context).colorScheme.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(msg.text, style: TextStyle(color: isAi ? null : Theme.of(context).colorScheme.onPrimary)),
              ),
            );
          },
        ),
      ),
      Padding(
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
        child: Wrap(spacing: 6, runSpacing: 6, children: [
          ActionChip(label: const Text('Capacités'), onPressed: () => _sendChat('Quelles sont tes capacités ?')),
          ActionChip(label: const Text('Whisper'), onPressed: () => _sendChat('Comment fonctionne Whisper ?')),
          ActionChip(label: const Text('OCR'), onPressed: () => _sendChat('Explique l\'OCR')),
        ]),
      ),
      Padding(
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
        child: Row(children: [
          Expanded(child: TextField(controller: _chatCtrl, decoration: const InputDecoration(hintText: 'Message…', border: OutlineInputBorder()), onSubmitted: (_) => _sendChat())),
          const SizedBox(width: 8),
          FilledButton(onPressed: _chatBusy ? null : () => _sendChat(), child: const Icon(Icons.send)),
        ]),
      ),
    ]);
  }

  Widget _voiceTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Reconnaissance vocale · Whisper', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(children: [
              Icon(_recording ? Icons.mic : Icons.mic_none, size: 64, color: _recording ? Colors.redAccent : null),
              const SizedBox(height: 12),
              Text(_recording ? 'Enregistrement… Appuyez pour arrêter' : 'Appuyez pour parler', textAlign: TextAlign.center),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: _voiceBusy ? null : _toggleRecord,
                icon: Icon(_recording ? Icons.stop : Icons.mic),
                label: Text(_recording ? 'Arrêter' : 'Enregistrer'),
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(onPressed: _voiceBusy ? null : _importAudio, icon: const Icon(Icons.upload_file), label: const Text('Importer audio (Whisper)')),
            ]),
          ),
        ),
        if (_voiceBusy) const LinearProgressIndicator(),
        const SizedBox(height: 12),
        Text('Transcription', style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 6),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: SelectableText(_transcript.isEmpty ? 'La transcription apparaîtra ici…' : _transcript),
          ),
        ),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(
            child: OutlinedButton(
              onPressed: _transcript.isEmpty || _voiceBusy ? null : () => _sendChat(_transcript),
              child: const Row(mainAxisAlignment: MainAxisAlignment.center, mainAxisSize: MainAxisSize.min, children: [Icon(Icons.chat, size: 18), SizedBox(width: 6), Text('Chat')]),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: FilledButton.tonal(
              onPressed: _voiceBusy ? null : _speakTts,
              child: const Row(mainAxisAlignment: MainAxisAlignment.center, mainAxisSize: MainAxisSize.min, children: [Icon(Icons.volume_up, size: 18), SizedBox(width: 6), Text('TTS')]),
            ),
          ),
        ]),
        const SizedBox(height: 16),
        const ListTile(
          leading: Icon(Icons.info_outline),
          title: Text('Whisper + TTS'),
          subtitle: Text('Whisper transcrit l\'audio en texte. TTS (tts-1) lit la réponse à voix haute. Clé API OpenAI requise pour le mode réel.'),
        ),
      ],
    );
  }

  Widget _ocrTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('OCR — extraction de texte', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        OutlinedButton.icon(onPressed: _pickOcrImage, icon: const Icon(Icons.image), label: const Text('Choisir une image')),
        if (_ocrImage != null) ...[
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.memory(_ocrImage!, height: 180, width: double.infinity, fit: BoxFit.cover),
          ),
        ],
        const SizedBox(height: 12),
        FilledButton.icon(onPressed: _ocrImage == null || _ocrBusy ? null : _runOcr, icon: const Icon(Icons.document_scanner), label: Text(_ocrBusy ? 'Analyse…' : 'Extraire le texte (GPT-4o Vision)')),
        if (_ocrBusy) const Padding(padding: EdgeInsets.only(top: 8), child: LinearProgressIndicator()),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                const Text('Résultat', style: TextStyle(fontWeight: FontWeight.bold)),
                const Spacer(),
                if (_ocrResult.isNotEmpty)
                  IconButton(tooltip: 'Copier', onPressed: () { Clipboard.setData(ClipboardData(text: _ocrResult)); }, icon: const Icon(Icons.copy, size: 20)),
              ]),
              const SizedBox(height: 8),
              SelectableText(_ocrResult.isEmpty ? 'Le texte extrait s\'affichera ici…' : _ocrResult),
            ]),
          ),
        ),
      ],
    );
  }

  Widget _imageTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Génération d\'images — DALL-E 3', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        TextField(controller: _imgPrompt, maxLines: 3, decoration: const InputDecoration(labelText: 'Description de l\'image', border: OutlineInputBorder())),
        const SizedBox(height: 12),
        FilledButton.icon(onPressed: _imgBusy ? null : _generateImage, icon: const Icon(Icons.auto_awesome), label: Text(_imgBusy ? 'Génération…' : 'Générer')),
        if (_imgBusy) const Padding(padding: EdgeInsets.only(top: 8), child: LinearProgressIndicator()),
        if (_imgUrl != null) ...[
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(_imgUrl!, fit: BoxFit.cover, errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image, size: 80)),
          ),
          const SizedBox(height: 8),
          SelectableText(_imgUrl!, style: Theme.of(context).textTheme.bodySmall),
        ],
        const SizedBox(height: 16),
        Wrap(spacing: 8, runSpacing: 8, children: [
          ActionChip(label: const Text('Usine IoT'), onPressed: () { _imgPrompt.text = 'Usine connectée futuriste, capteurs IoT, noir et blanc'; _generateImage(); }),
          ActionChip(label: const Text('Logo minimal'), onPressed: () { _imgPrompt.text = 'Logo AIHub minimaliste, noir sur blanc, icône robot'; _generateImage(); }),
        ]),
      ],
    );
  }

  Widget _translateTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Traduction multilingue', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: _transTarget,
          decoration: const InputDecoration(labelText: 'Langue cible', border: OutlineInputBorder()),
          items: _langs.map((l) => DropdownMenuItem(value: l, child: Text(l))).toList(),
          onChanged: (v) => setState(() => _transTarget = v ?? _transTarget),
        ),
        const SizedBox(height: 12),
        TextField(controller: _transSrc, maxLines: 5, decoration: const InputDecoration(labelText: 'Texte source', border: OutlineInputBorder())),
        const SizedBox(height: 12),
        FilledButton.icon(onPressed: _transBusy ? null : _runTranslate, icon: const Icon(Icons.translate), label: Text(_transBusy ? 'Traduction…' : 'Traduire')),
        if (_transBusy) const Padding(padding: EdgeInsets.only(top: 8), child: LinearProgressIndicator()),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Résultat ($_transTarget)', style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              SelectableText(_transResult.isEmpty ? 'La traduction apparaîtra ici…' : _transResult),
            ]),
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _chatCtrl.dispose();
    _chatScroll.dispose();
    _imgPrompt.dispose();
    _transSrc.dispose();
    _audioRecorder.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pages = [_chatTab(), _voiceTab(), _ocrTab(), _imageTab(), _translateTab()];
    final labels = ['Message', 'Micro', 'Scanner', 'Générer', 'Traduire'];
    return Scaffold(
      appBar: AppBar(
        title: const Text('🤖 AIHub'),
        actions: [
          IconButton(
            tooltip: _openAi.hasKey ? 'Clé API configurée' : 'Configurer clé API',
            onPressed: _showApiKeyDialog,
            icon: Icon(_openAi.hasKey ? Icons.vpn_key : Icons.vpn_key_off),
          ),
          IconButton(
            tooltip: widget.isDark ? 'Mode clair' : 'Mode sombre',
            onPressed: widget.onToggleTheme,
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
          ),
        ],
      ),
      body: pages[_tab],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          switch (_tab) {
            case 0:
              _sendChat();
            case 1:
              _toggleRecord();
            case 2:
              _runOcr();
            case 3:
              _generateImage();
            case 4:
              _runTranslate();
          }
        },
        icon: Icon([Icons.send, Icons.mic, Icons.document_scanner, Icons.auto_awesome, Icons.translate][_tab]),
        label: Text(labels[_tab]),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.chat_outlined), selectedIcon: Icon(Icons.chat), label: 'Chat'),
          NavigationDestination(icon: Icon(Icons.mic_outlined), selectedIcon: Icon(Icons.mic), label: 'Vocal'),
          NavigationDestination(icon: Icon(Icons.document_scanner_outlined), selectedIcon: Icon(Icons.document_scanner), label: 'OCR'),
          NavigationDestination(icon: Icon(Icons.image_outlined), selectedIcon: Icon(Icons.image), label: 'Images'),
          NavigationDestination(icon: Icon(Icons.translate_outlined), selectedIcon: Icon(Icons.translate), label: 'Trad.'),
        ],
      ),
    );
  }
}
