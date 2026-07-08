import 'package:flutter/material.dart';
import 'package:streamai_netflix/data/demo_data.dart';

void main() => runApp(const StreamAIApp());

class StreamAIApp extends StatefulWidget {
  const StreamAIApp({super.key});
  @override
  State<StreamAIApp> createState() => _StreamAIAppState();
}

class _StreamAIAppState extends State<StreamAIApp> {
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
      title: 'StreamAI — Netflix + IA',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: StreamAIHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class StreamAIHome extends StatefulWidget {
  const StreamAIHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<StreamAIHome> createState() => _StreamAIHomeState();
}

class _StreamAIHomeState extends State<StreamAIHome> {
  int _tab = 0;
  final List<StreamTitle> _catalog = List.of(initialCatalog);
  final List<AiMessage> _chat = [
    AiMessage(role: 'ai', text: 'Bonjour ! Je suis StreamAI 🤖\nDites-moi votre humeur (action, comédie, détente…) ou tapez « analyse ma liste » pour des recommandations personnalisées.'),
  ];
  final TextEditingController _aiInput = TextEditingController();
  final ScrollController _chatScroll = ScrollController();
  bool _aiThinking = false;

  List<StreamTitle> get _watchlist => _catalog.where((t) => t.inWatchlist).toList();
  int get _avgScore => _catalog.where((t) => t.userScore > 0).isEmpty
      ? 0
      : (_catalog.where((t) => t.userScore > 0).fold(0, (s, t) => s + t.userScore) / _catalog.where((t) => t.userScore > 0).length).round();

  Future<bool?> _dialog(String title, List<Widget> fields) {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Column(mainAxisSize: MainAxisSize.min, children: fields),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Valider')),
        ],
      ),
    );
  }

  void _addTitle() async {
    final name = TextEditingController();
    final genre = TextEditingController(text: 'Action');
    final type = TextEditingController(text: 'Film');
    final ok = await _dialog('Ajouter au catalogue', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Titre')),
      TextField(controller: type, decoration: const InputDecoration(labelText: 'Type (Film/Série)')),
      TextField(controller: genre, decoration: const InputDecoration(labelText: 'Genre')),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _catalog.insert(0, StreamTitle(
        name: name.text,
        type: type.text.isNotEmpty ? type.text : 'Film',
        genre: genre.text.isNotEmpty ? genre.text : 'Action',
        year: 2026,
        rating: 4.0,
        duration: '2h',
        emoji: '🎬',
      )));
    }
  }

  void _toggleWatchlist(StreamTitle t) {
    setState(() => t.inWatchlist = !t.inWatchlist);
  }

  void _rateTitle(StreamTitle t) {
    setState(() => t.userScore = t.userScore >= 5 ? 0 : t.userScore + 1);
  }

  void _showSynopsis(StreamTitle t) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('${t.emoji} ${t.name}'),
        content: Text(aiSynopsis(t).replaceAll('**', '')),
        actions: [FilledButton(onPressed: () => Navigator.pop(ctx), child: const Text('Fermer'))],
      ),
    );
  }

  void _sendAiMessage([String? preset]) {
    final text = (preset ?? _aiInput.text).trim();
    if (text.isEmpty || _aiThinking) return;
    _aiInput.clear();
    setState(() {
      _chat.add(AiMessage(role: 'user', text: text));
      _aiThinking = true;
    });
    Future.delayed(const Duration(milliseconds: 600), () {
      if (!mounted) return;
      setState(() {
        _chat.add(AiMessage(role: 'ai', text: aiChatReply(text, _catalog, _watchlist)));
        _aiThinking = false;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_chatScroll.hasClients) {
          _chatScroll.animateTo(_chatScroll.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
        }
      });
    });
  }

  void _aiQuickPick() {
    final picks = aiRecommend(_catalog, 'soirée', watchlist: _watchlist);
    setState(() {
      for (final p in picks) {
        p.inWatchlist = true;
      }
      _chat.add(AiMessage(role: 'user', text: 'Génère une playlist IA'));
      _chat.add(AiMessage(role: 'ai', text: 'Playlist générée et ajoutée à votre liste :\n${picks.map((t) => '• ${t.emoji} ${t.name}').join('\n')}'));
    });
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 1:
        return _addTitle;
      case 2:
        return _aiQuickPick;
      case 3:
        return () => _sendAiMessage('analyse ma liste');
      default:
        return null;
    }
  }

  @override
  void dispose() {
    _aiInput.dispose();
    _chatScroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final aiPicks = aiRecommend(_catalog, 'tendance', watchlist: _watchlist);

    return Scaffold(
      appBar: AppBar(
        title: const Text('🎬 StreamAI'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: FloatingActionButton(onPressed: _fabAction, child: Icon(_tab == 3 ? Icons.auto_awesome : Icons.add)),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.all(16), children: [
            Text('Accueil', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Titres catalogue', value: '${_catalog.length}'),
                _Kpi(label: 'Ma liste', value: '${_watchlist.length}'),
                _Kpi(label: 'Note moyenne', value: _avgScore > 0 ? '$_avgScore/5' : '—'),
                _Kpi(label: 'Picks IA', value: '${aiPicks.length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('🤖 Recommandations IA', style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            SizedBox(
              height: 140,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: aiPicks.length,
                separatorBuilder: (context, index) => const SizedBox(width: 10),
                itemBuilder: (_, i) {
                  final t = aiPicks[i];
                  return _PosterCard(title: t, onTap: () => _showSynopsis(t));
                },
              ),
            ),
            const SizedBox(height: 16),
            const Text('Tendances', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._catalog.take(3).map((t) => Card(
              child: ListTile(
                leading: Text(t.emoji, style: const TextStyle(fontSize: 28)),
                title: Text(t.name),
                subtitle: Text('${t.type} · ${t.genre} · ${t.year}'),
                trailing: Text('${t.rating}', style: const TextStyle(fontWeight: FontWeight.w800)),
                onTap: () => _showSynopsis(t),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _catalog.map((t) => Card(
            child: ListTile(
              leading: Text(t.emoji, style: const TextStyle(fontSize: 32)),
              title: Text(t.name),
              subtitle: Text('${t.type} · ${t.genre} · ${t.duration}'),
              onTap: () => _showSynopsis(t),
              onLongPress: () => _rateTitle(t),
              trailing: IconButton(
                icon: Icon(t.inWatchlist ? Icons.bookmark : Icons.bookmark_border),
                onPressed: () => _toggleWatchlist(t),
              ),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: [
            if (_watchlist.isEmpty)
              const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('Liste vide — ajoutez des titres depuis le catalogue ou utilisez le + pour une playlist IA.')))
            else
              ..._watchlist.map((t) => Card(
                color: Theme.of(context).colorScheme.surface,
                child: ListTile(
                  leading: Text(t.emoji, style: const TextStyle(fontSize: 32)),
                  title: Text(t.name),
                  subtitle: Text(aiSynopsis(t).replaceAll('**', '').split('—').last.trim()),
                  trailing: IconButton(icon: const Icon(Icons.close), onPressed: () => _toggleWatchlist(t)),
                ),
              )),
          ]),
          Column(children: [
            Expanded(
              child: ListView.builder(
                controller: _chatScroll,
                padding: const EdgeInsets.all(16),
                itemCount: _chat.length + (_aiThinking ? 1 : 0),
                itemBuilder: (_, i) {
                  if (_aiThinking && i == _chat.length) {
                    return const Align(alignment: Alignment.centerLeft, child: Padding(padding: EdgeInsets.all(8), child: Text('StreamAI réfléchit…')));
                  }
                  final m = _chat[i];
                  final isAi = m.role == 'ai';
                  return Align(
                    alignment: isAi ? Alignment.centerLeft : Alignment.centerRight,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      constraints: const BoxConstraints(maxWidth: 320),
                      decoration: BoxDecoration(
                        color: isAi ? Theme.of(context).colorScheme.surface : Theme.of(context).colorScheme.primary,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.3)),
                      ),
                      child: Text(m.text, style: TextStyle(color: isAi ? Theme.of(context).colorScheme.onSurface : Theme.of(context).colorScheme.onPrimary)),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
              child: Wrap(spacing: 6, runSpacing: 6, children: [
                ActionChip(label: const Text('Action'), onPressed: () => _sendAiMessage('Je veux de l\'action')),
                ActionChip(label: const Text('Comédie'), onPressed: () => _sendAiMessage('Une comédie détente')),
                ActionChip(label: const Text('Top'), onPressed: () => _sendAiMessage('top tendances')),
                ActionChip(label: const Text('Ma liste'), onPressed: () => _sendAiMessage('analyse ma liste')),
              ]),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: Row(children: [
                Expanded(child: TextField(
                  controller: _aiInput,
                  decoration: const InputDecoration(hintText: 'Demandez à StreamAI…', border: OutlineInputBorder()),
                  onSubmitted: (_) => _sendAiMessage(),
                )),
                const SizedBox(width: 8),
                FilledButton(onPressed: () => _sendAiMessage(), child: const Icon(Icons.send)),
              ]),
            ),
          ]),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Accueil'),
          NavigationDestination(icon: Icon(Icons.movie_outlined), label: 'Catalogue'),
          NavigationDestination(icon: Icon(Icons.bookmark_outline), label: 'Ma liste'),
          NavigationDestination(icon: Icon(Icons.smart_toy_outlined), label: 'IA'),
        ],
      ),
    );
  }
}

class _Kpi extends StatelessWidget {
  const _Kpi({required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) {
    return Card(child: Padding(padding: const EdgeInsets.all(14), child: Column(
      crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(label, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
        const SizedBox(height: 6),
        Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
      ],
    )));
  }
}

class _PosterCard extends StatelessWidget {
  const _PosterCard({required this.title, required this.onTap});
  final StreamTitle title;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 110,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.3)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title.emoji, style: const TextStyle(fontSize: 28)),
          const Spacer(),
          Text(title.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
          Text('${title.rating}/5', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.secondary)),
        ]),
      ),
    );
  }
}
