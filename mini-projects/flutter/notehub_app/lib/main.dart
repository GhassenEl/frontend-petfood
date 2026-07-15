import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:notehub_app/data/note.dart';
import 'package:notehub_app/data/note_database.dart';

void main() => runApp(const NoteHubApp());

class NoteHubApp extends StatefulWidget {
  const NoteHubApp({super.key});
  @override
  State<NoteHubApp> createState() => _NoteHubAppState();
}

class _NoteHubAppState extends State<NoteHubApp> {
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
      title: 'NoteHub — Prise de notes',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: NoteHubHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class NoteHubHome extends StatefulWidget {
  const NoteHubHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<NoteHubHome> createState() => _NoteHubHomeState();
}

class _NoteHubHomeState extends State<NoteHubHome> {
  final _db = NoteDatabase.instance;
  final _searchCtrl = TextEditingController();
  final _dateFmt = DateFormat('dd MMM yyyy · HH:mm');
  List<Note> _notes = [];
  bool _loading = true;
  String? _error;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final notes = await _db.getNotes(query: _query);
      if (!mounted) return;
      setState(() {
        _notes = notes;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _openEditor({Note? note}) async {
    final title = TextEditingController(text: note?.title ?? '');
    final content = TextEditingController(text: note?.content ?? '');
    final saved = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (ctx) => NoteEditorPage(
          isNew: note == null,
          titleCtrl: title,
          contentCtrl: content,
        ),
      ),
    );
    if (saved != true) return;

    final now = DateTime.now();
    if (note == null) {
      await _db.insert(Note(
        title: title.text.trim().isEmpty ? 'Sans titre' : title.text.trim(),
        content: content.text.trim(),
        createdAt: now,
        updatedAt: now,
      ));
    } else {
      await _db.update(note.copyWith(
        title: title.text.trim().isEmpty ? 'Sans titre' : title.text.trim(),
        content: content.text.trim(),
        updatedAt: now,
      ));
    }
    await _load();
  }

  Future<void> _delete(Note note) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer la note ?'),
        content: Text('« ${note.title} » sera supprimée définitivement.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Supprimer')),
        ],
      ),
    );
    if (ok == true && note.id != null) {
      await _db.delete(note.id!);
      await _load();
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('📝 NoteHub'),
        actions: [
          IconButton(
            tooltip: widget.isDark ? 'Mode clair' : 'Mode sombre',
            onPressed: widget.onToggleTheme,
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'Rechercher dans les notes…',
                prefixIcon: const Icon(Icons.search),
                border: const OutlineInputBorder(),
                suffixIcon: _query.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() => _query = '');
                          _load();
                        },
                      ),
              ),
              onChanged: (v) {
                _query = v;
                _load();
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Row(children: [
              Text('${_notes.length} note(s)', style: Theme.of(context).textTheme.bodySmall),
              const Spacer(),
              Text('SQLite local', style: Theme.of(context).textTheme.bodySmall),
            ]),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text('Erreur SQLite :\n$_error', textAlign: TextAlign.center)))
                    : _notes.isEmpty
                        ? Center(child: Text(_query.isEmpty ? 'Aucune note.\nAppuyez sur + pour en créer.' : 'Aucun résultat pour « $_query ».', textAlign: TextAlign.center))
                        : ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _notes.length,
                            itemBuilder: (ctx, i) {
                              final n = _notes[i];
                              return Card(
                                margin: const EdgeInsets.only(bottom: 8),
                                child: ListTile(
                                  title: Text(n.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                                  subtitle: Text(
                                    '${n.content.isEmpty ? '(vide)' : n.content}\n${_dateFmt.format(n.updatedAt)}',
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  isThreeLine: true,
                                  onTap: () => _openEditor(note: n),
                                  trailing: IconButton(
                                    tooltip: 'Supprimer',
                                    onPressed: () => _delete(n),
                                    icon: const Icon(Icons.delete_outline),
                                  ),
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openEditor(),
        icon: const Icon(Icons.add),
        label: const Text('Note'),
      ),
    );
  }
}

class NoteEditorPage extends StatefulWidget {
  const NoteEditorPage({
    super.key,
    required this.isNew,
    required this.titleCtrl,
    required this.contentCtrl,
  });

  final bool isNew;
  final TextEditingController titleCtrl;
  final TextEditingController contentCtrl;

  @override
  State<NoteEditorPage> createState() => _NoteEditorPageState();
}

class _NoteEditorPageState extends State<NoteEditorPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isNew ? 'Nouvelle note' : 'Modifier la note'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Enregistrer'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: widget.titleCtrl,
            decoration: const InputDecoration(labelText: 'Titre', border: OutlineInputBorder()),
            textCapitalization: TextCapitalization.sentences,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: widget.contentCtrl,
            decoration: const InputDecoration(
              labelText: 'Contenu',
              alignLabelWithHint: true,
              border: OutlineInputBorder(),
            ),
            minLines: 12,
            maxLines: 24,
            textCapitalization: TextCapitalization.sentences,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pop(context, true),
        child: const Icon(Icons.check),
      ),
    );
  }
}
