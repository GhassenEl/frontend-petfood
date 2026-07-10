import 'package:flutter/material.dart';
import 'package:libhub_books/data/demo_data.dart';

void main() => runApp(const LibHubApp());

class LibHubApp extends StatefulWidget {
  const LibHubApp({super.key});
  @override
  State<LibHubApp> createState() => _LibHubAppState();
}

class _LibHubAppState extends State<LibHubApp> {
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
      title: 'LibHub — Bibliothèque en ligne',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: LibHubHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class LibHubHome extends StatefulWidget {
  const LibHubHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<LibHubHome> createState() => _LibHubHomeState();
}

class _LibHubHomeState extends State<LibHubHome> {
  int _tab = 0;
  int _loanSeq = 202;
  final List<LibraryItem> _books = List.of(initialBooks);
  final List<LibraryItem> _journals = List.of(initialJournals);
  final List<LibraryItem> _spiritual = List.of(initialSpiritual);
  final List<LibraryLoan> _loans = List.of(initialLoans);

  List<LibraryItem> get _catalog => allCatalog(_books, _journals, _spiritual);
  int get _totalItems => _catalog.length;
  int get _available => _catalog.fold(0, (s, i) => s + i.copies);
  int get _activeLoans => _loans.where((l) => l.status == 'En cours').length;
  int get _onShelf => _catalog.where((i) => i.borrowed).length;

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

  void _addItem(String category, List<LibraryItem> list) async {
    final title = TextEditingController();
    final author = TextEditingController();
    final format = TextEditingController(text: 'PDF');
    final ok = await _dialog('Ajouter — $category', [
      TextField(controller: title, decoration: const InputDecoration(labelText: 'Titre')),
      TextField(controller: author, decoration: const InputDecoration(labelText: 'Auteur / Éditeur')),
      TextField(controller: format, decoration: const InputDecoration(labelText: 'Format')),
    ]);
    if (ok == true && title.text.isNotEmpty) {
      setState(() => list.insert(0, LibraryItem(
        title: title.text,
        author: author.text.isNotEmpty ? author.text : 'Anonyme',
        category: category,
        year: DateTime.now().year,
        format: format.text,
        copies: 3,
        emoji: category == 'Coran' || category == 'Hadith' ? '📿' : category == 'Journal' ? '📰' : '📚',
      )));
    }
  }

  void _addLoan() async {
    final member = TextEditingController();
    final title = TextEditingController();
    final due = TextEditingController();
    final ok = await _dialog('Nouvel emprunt', [
      TextField(controller: member, decoration: const InputDecoration(labelText: 'Membre')),
      TextField(controller: title, decoration: const InputDecoration(labelText: 'Titre')),
      TextField(controller: due, decoration: const InputDecoration(labelText: 'Retour prévu')),
    ]);
    if (ok == true && member.text.isNotEmpty) {
      setState(() => _loans.insert(0, LibraryLoan(
        id: 'EMP-${_loanSeq++}',
        member: member.text,
        title: title.text,
        dueDate: due.text,
        status: 'En cours',
      )));
    }
  }

  void _borrowItem(LibraryItem item) {
    if (item.copies > 0) {
      setState(() {
        item.copies--;
        item.borrowed = true;
        _loans.insert(0, LibraryLoan(
          id: 'EMP-${_loanSeq++}',
          member: 'Visiteur',
          title: item.title,
          dueDate: 'Dans 14j',
          status: 'En cours',
        ));
      });
    }
  }

  void _returnItem(LibraryItem item) {
    setState(() {
      item.copies++;
      item.borrowed = false;
    });
  }

  void _cycleLoan(LibraryLoan l) {
    final i = loanStatuses.indexOf(l.status);
    setState(() => l.status = loanStatuses[(i + 1) % loanStatuses.length]);
  }

  Widget _itemList(List<LibraryItem> items) {
    return ListView(padding: const EdgeInsets.all(16), children: items.map((item) => Card(
      child: ListTile(
        leading: Text(item.emoji, style: const TextStyle(fontSize: 32)),
        title: Text(item.title),
        subtitle: Text('${item.author} · ${item.year > 0 ? item.year : "—"} · ${item.format}'),
        onTap: () => _borrowItem(item),
        onLongPress: () => _returnItem(item),
        trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text('${item.copies} ex.', style: const TextStyle(fontWeight: FontWeight.w700)),
          Text(item.borrowed ? 'Emprunté' : 'Dispo', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
        ]),
      ),
    )).toList());
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 4:
        return _addLoan;
      case 1:
        return () => _addItem('Livre', _books);
      case 2:
        return () => _addItem('Journal', _journals);
      case 3:
        return () => _addItem('Coran', _spiritual);
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('📚 LibHub'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: FloatingActionButton(onPressed: _fabAction, child: const Icon(Icons.add)),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.all(16), children: [
            Text('Bibliothèque en ligne', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Ouvrages', value: '$_totalItems'),
                _Kpi(label: 'Exemplaires', value: '$_available'),
                _Kpi(label: 'Emprunts actifs', value: '$_activeLoans'),
                _Kpi(label: 'Sur étagère', value: '$_onShelf'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Collections', style: TextStyle(fontWeight: FontWeight.w700)),
            Row(children: [
              _CollectionChip(emoji: '📕', label: 'Livres', count: _books.length),
              const SizedBox(width: 8),
              _CollectionChip(emoji: '📰', label: 'Journaux', count: _journals.length),
              const SizedBox(width: 8),
              _CollectionChip(emoji: '📿', label: 'Coran', count: _spiritual.where((i) => i.category == 'Coran' || i.category == 'Hadith' || i.category == 'Tafsir').length),
            ]),
            const SizedBox(height: 16),
            const Text('Emprunts en cours', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._loans.where((l) => l.status == 'En cours').map((l) => Card(
              child: ListTile(
                leading: const Icon(Icons.book_outlined),
                title: Text(l.title),
                subtitle: Text('${l.member} · retour ${l.dueDate}'),
              ),
            )),
          ]),
          _itemList(_books),
          _itemList(_journals),
          _itemList(_spiritual),
          ListView(padding: const EdgeInsets.all(16), children: _loans.map((l) => Card(
            child: ListTile(
              leading: const Icon(Icons.library_books_outlined),
              title: Text('${l.id} — ${l.title}'),
              subtitle: Text('${l.member} · Retour : ${l.dueDate}'),
              onTap: () => _cycleLoan(l),
              trailing: Text(l.status, style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.secondary)),
            ),
          )).toList()),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Accueil'),
          NavigationDestination(icon: Icon(Icons.menu_book_outlined), label: 'Livres'),
          NavigationDestination(icon: Icon(Icons.newspaper_outlined), label: 'Journaux'),
          NavigationDestination(icon: Icon(Icons.auto_stories_outlined), label: 'Coran'),
          NavigationDestination(icon: Icon(Icons.swap_horiz_outlined), label: 'Emprunts'),
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

class _CollectionChip extends StatelessWidget {
  const _CollectionChip({required this.emoji, required this.label, required this.count});
  final String emoji;
  final String label;
  final int count;
  @override
  Widget build(BuildContext context) {
    return Expanded(child: Card(
      child: Padding(padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8), child: Column(children: [
        Text(emoji, style: const TextStyle(fontSize: 24)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
        Text('$count', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.secondary)),
      ])),
    ));
  }
}
