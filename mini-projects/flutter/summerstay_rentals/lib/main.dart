import 'package:flutter/material.dart';
import 'package:summerstay_rentals/data/demo_data.dart';

void main() => runApp(const SummerStayApp());

class SummerStayApp extends StatefulWidget {
  const SummerStayApp({super.key});
  @override
  State<SummerStayApp> createState() => _SummerStayAppState();
}

class _SummerStayAppState extends State<SummerStayApp> {
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
      title: 'SummerStay — Location maisons d\'été',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: SummerStayHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class SummerStayHome extends StatefulWidget {
  const SummerStayHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<SummerStayHome> createState() => _SummerStayHomeState();
}

class _SummerStayHomeState extends State<SummerStayHome> {
  int _tab = 0;
  int _bookSeq = 802;
  String _typeFilter = 'Tous';
  String _search = '';
  final List<SummerProperty> _properties = List.of(initialProperties);
  final List<SummerBooking> _bookings = List.of(initialBookings);
  final List<SummerAiMessage> _chat = [
    SummerAiMessage(role: 'ai', text: 'Bonjour ! Je suis SummerBot ☀️\nJe vous aide à trouver villa, bungalow ou maison d\'été.\nEssayez : « villa piscine », « Djerba », « budget 250 », « famille 6 ».'),
  ];
  final TextEditingController _aiInput = TextEditingController();
  final TextEditingController _searchCtrl = TextEditingController();
  final ScrollController _chatScroll = ScrollController();
  bool _aiThinking = false;

  int get _available => _properties.where((p) => p.status == 'Disponible').length;
  int get _activeBookings => _bookings.where((b) => b.status == 'Confirmée' || b.status == 'En cours' || b.status == 'En attente').length;
  int get _revenue => _bookings.where((b) => b.status != 'Annulée').fold(0, (s, b) => s + b.total);
  int get _villas => _properties.where((p) => p.type == 'Villa').length;

  List<SummerProperty> get _filtered {
    return _properties.where((p) {
      final typeOk = _typeFilter == 'Tous' || p.type == _typeFilter;
      final q = _search.toLowerCase();
      final searchOk = q.isEmpty ||
          p.name.toLowerCase().contains(q) ||
          p.city.toLowerCase().contains(q) ||
          p.region.toLowerCase().contains(q) ||
          p.type.toLowerCase().contains(q);
      return typeOk && searchOk;
    }).toList();
  }

  Future<bool?> _dialog(String title, List<Widget> fields) {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: fields)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Valider')),
        ],
      ),
    );
  }

  void _addProperty() async {
    final name = TextEditingController();
    final city = TextEditingController();
    final price = TextEditingController(text: '250');
    String type = 'Villa';
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Nouveau bien'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: type,
                decoration: const InputDecoration(labelText: 'Type', border: OutlineInputBorder()),
                items: propertyTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                onChanged: (v) => setLocal(() => type = v ?? type),
              ),
              const SizedBox(height: 8),
              TextField(controller: city, decoration: const InputDecoration(labelText: 'Ville', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix/nuit DT', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Valider')),
          ],
        ),
      ),
    );
    if (ok == true && name.text.isNotEmpty) {
      final emoji = type == 'Villa' ? '🏡' : type == 'Bungalow' ? '🏝️' : '🏠';
      setState(() => _properties.insert(0, SummerProperty(
        name: name.text,
        type: type,
        city: city.text.isNotEmpty ? city.text : 'Tunisie',
        region: '—',
        pricePerNight: int.tryParse(price.text) ?? 250,
        guests: 4,
        bedrooms: 2,
        emoji: emoji,
        amenities: ['Wi-Fi', 'Clim'],
      )));
    }
  }

  void _addBooking() async {
    final guest = TextEditingController();
    final nights = TextEditingController(text: '3');
    String? property = _properties.where((p) => p.status == 'Disponible').firstOrNull?.name;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Nouvelle réservation'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: guest, decoration: const InputDecoration(labelText: 'Client', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: property,
                decoration: const InputDecoration(labelText: 'Bien', border: OutlineInputBorder()),
                items: _properties.map((p) => DropdownMenuItem(value: p.name, child: Text('${p.emoji} ${p.name}'))).toList(),
                onChanged: (v) => setLocal(() => property = v),
              ),
              const SizedBox(height: 8),
              TextField(controller: nights, decoration: const InputDecoration(labelText: 'Nuits', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Valider')),
          ],
        ),
      ),
    );
    if (ok == true && guest.text.isNotEmpty && property != null) {
      final n = int.tryParse(nights.text) ?? 3;
      final p = _properties.where((x) => x.name == property).firstOrNull;
      final price = p?.pricePerNight ?? 200;
      setState(() {
        _bookings.insert(0, SummerBooking(
          id: 'SS-${_bookSeq++}',
          guest: guest.text,
          property: property!,
          checkIn: 'Bientôt',
          checkOut: '+$n j',
          nights: n,
          total: n * price,
          status: 'En attente',
        ));
        if (p != null) p.status = 'Réservé';
      });
    }
  }

  void _cycleProperty(SummerProperty p) {
    final i = propertyStatuses.indexOf(p.status);
    setState(() => p.status = propertyStatuses[(i + 1) % propertyStatuses.length]);
  }

  void _cycleBooking(SummerBooking b) {
    final i = bookingStatuses.indexOf(b.status);
    setState(() => b.status = bookingStatuses[(i + 1) % bookingStatuses.length]);
  }

  Future<void> _bookProperty(SummerProperty p) async {
    if (p.status != 'Disponible') {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${p.name} n\'est pas disponible')));
      return;
    }
    final guest = TextEditingController(text: 'Voyageur');
    final nights = TextEditingController(text: '4');
    final ok = await _dialog('Réserver ${p.name}', [
      TextField(controller: guest, decoration: const InputDecoration(labelText: 'Client', border: OutlineInputBorder())),
      const SizedBox(height: 8),
      TextField(controller: nights, decoration: const InputDecoration(labelText: 'Nuits', border: OutlineInputBorder()), keyboardType: TextInputType.number),
      const SizedBox(height: 8),
      Text('${p.pricePerNight} DT / nuit · max ${p.guests} pers.', style: Theme.of(context).textTheme.bodySmall),
    ]);
    if (ok == true && mounted) {
      final n = int.tryParse(nights.text) ?? 4;
      setState(() {
        _bookings.insert(0, SummerBooking(
          id: 'SS-${_bookSeq++}',
          guest: guest.text.isNotEmpty ? guest.text : 'Voyageur',
          property: p.name,
          checkIn: 'Bientôt',
          checkOut: '+$n j',
          nights: n,
          total: n * p.pricePerNight,
          status: 'Confirmée',
        ));
        p.status = 'Réservé';
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Réservation confirmée — ${p.name}')));
    }
  }

  String _aiReply(String raw) {
    final q = raw.toLowerCase();
    final avail = _properties.where((p) => p.status == 'Disponible').toList();

    if (q.contains('bonjour') || q.contains('salut') || q.contains('hello')) {
      return '☀️ Bienvenue sur SummerStay !\n$_available biens disponibles · $_villas villas.\nDites-moi : villa, bungalow, maison, ville ou budget.';
    }
    if (q.contains('kpi') || q.contains('stats') || q.contains('chiffre')) {
      return '📊 KPIs SummerStay\n• Biens : ${_properties.length} ($_available dispo)\n• Villas : $_villas\n• Réservations actives : $_activeBookings\n• CA : $_revenue DT';
    }
    if (q.contains('budget') || RegExp(r'\d{2,4}').hasMatch(q)) {
      final m = RegExp(r'(\d{2,4})').firstMatch(q);
      final max = m != null ? int.parse(m.group(1)!) : 250;
      final hits = avail.where((p) => p.pricePerNight <= max).toList();
      if (hits.isEmpty) return 'Aucun bien ≤ $max DT/nuit. Essayez un budget plus large.';
      return '💰 Budget ≤ $max DT/nuit :\n${hits.take(4).map((p) => '• ${p.emoji} ${p.name} — ${p.pricePerNight} DT (${p.city})').join('\n')}';
    }
    if (q.contains('piscine') || q.contains('pool')) {
      final hits = avail.where((p) => p.pool).toList();
      return hits.isEmpty
          ? 'Aucune disponibilité avec piscine pour le moment.'
          : '🏊 Avec piscine :\n${hits.map((p) => '• ${p.emoji} ${p.name} — ${p.pricePerNight} DT/nuit · ${p.city}').join('\n')}';
    }
    if (q.contains('mer') || q.contains('plage') || q.contains('vue')) {
      final hits = avail.where((p) => p.seaView).toList();
      return hits.isEmpty
          ? 'Pas de vue mer dispo actuellement.'
          : '🌊 Vue mer / plage :\n${hits.map((p) => '• ${p.emoji} ${p.name} — ${p.city} · ${p.pricePerNight} DT').join('\n')}';
    }
    if (q.contains('famille') || q.contains('groupe') || RegExp(r'\b([4-9]|1\d)\b').hasMatch(q)) {
      final m = RegExp(r'\b([4-9]|1\d)\b').firstMatch(q);
      final n = m != null ? int.parse(m.group(1)!) : 6;
      final hits = avail.where((p) => p.guests >= n).toList();
      return hits.isEmpty
          ? 'Aucun bien pour ≥ $n personnes disponible.'
          : '👨‍👩‍👧‍👦 Pour $n+ pers. :\n${hits.map((p) => '• ${p.emoji} ${p.name} — ${p.guests} places · ${p.bedrooms} ch. · ${p.pricePerNight} DT').join('\n')}';
    }
    if (q.contains('villa')) {
      final hits = avail.where((p) => p.type == 'Villa').toList();
      return hits.isEmpty
          ? 'Aucune villa disponible.'
          : '🏡 Villas dispos :\n${hits.map((p) => '• ${p.name} — ${p.city} · ${p.pricePerNight} DT · piscine ${p.pool ? 'oui' : 'non'}').join('\n')}';
    }
    if (q.contains('bungalow')) {
      final hits = avail.where((p) => p.type == 'Bungalow').toList();
      return hits.isEmpty
          ? 'Aucun bungalow disponible.'
          : '🏝️ Bungalows :\n${hits.map((p) => '• ${p.name} — ${p.city} · ${p.pricePerNight} DT').join('\n')}';
    }
    if (q.contains('maison')) {
      final hits = avail.where((p) => p.type == 'Maison d\'été').toList();
      return hits.isEmpty
          ? 'Aucune maison d\'été disponible.'
          : '🏠 Maisons d\'été :\n${hits.map((p) => '• ${p.name} — ${p.city} · ${p.pricePerNight} DT').join('\n')}';
    }

    for (final city in ['hammamet', 'djerba', 'tunis', 'sidi bou', 'tabarka', 'monastir', 'tozeur', 'nabeul']) {
      if (q.contains(city)) {
        final hits = avail.where((p) => p.city.toLowerCase().contains(city) || p.region.toLowerCase().contains(city) || p.name.toLowerCase().contains(city)).toList();
        if (hits.isEmpty) return 'Rien de disponible autour de $city pour le moment.';
        return '📍 Près de $city :\n${hits.map((p) => '• ${p.emoji} ${p.name} (${p.type}) — ${p.pricePerNight} DT/nuit').join('\n')}';
      }
    }

    if (q.contains('réserver') || q.contains('booking') || q.contains('réservation')) {
      return '📅 $_activeBookings réservations actives · CA $_revenue DT.\nOuvrez l\'onglet Réservations ou réservez depuis un bien.';
    }
    if (q.contains('aide') || q.contains('help') || q.contains('quoi')) {
      return 'SummerBot peut :\n• Filtrer villa / bungalow / maison\n• Chercher par ville (Djerba, Hammamet…)\n• Budget, piscine, vue mer, famille\n• Afficher KPIs & réservations';
    }

    final top = avail.take(3).toList();
    return 'Voici des idées ☀️\n${top.map((p) => '• ${p.emoji} ${p.name} — ${p.type} · ${p.city} · ${p.pricePerNight} DT').join('\n')}\n\nPrécisez : villa, piscine, ville ou budget.';
  }

  Future<void> _sendAi([String? preset]) async {
    final text = (preset ?? _aiInput.text).trim();
    if (text.isEmpty || _aiThinking) return;
    setState(() {
      _chat.add(SummerAiMessage(role: 'user', text: text));
      _aiInput.clear();
      _aiThinking = true;
    });
    await Future<void>.delayed(const Duration(milliseconds: 450));
    if (!mounted) return;
    setState(() {
      _chat.add(SummerAiMessage(role: 'ai', text: _aiReply(text)));
      _aiThinking = false;
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_chatScroll.hasClients) {
        _chatScroll.animateTo(_chatScroll.position.maxScrollExtent, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  Widget _kpi(String label, String value, IconData icon) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, size: 18),
            const SizedBox(height: 6),
            Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text(label, style: Theme.of(context).textTheme.bodySmall),
          ]),
        ),
      ),
    );
  }

  Widget _propertiesTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Disponibles', '$_available', Icons.villa_outlined),
          _kpi('Villas', '$_villas', Icons.holiday_village_outlined),
          _kpi('CA', '$_revenue DT', Icons.payments_outlined),
        ]),
        const SizedBox(height: 8),
        TextField(
          controller: _searchCtrl,
          decoration: InputDecoration(
            hintText: 'Ville, nom, région…',
            prefixIcon: const Icon(Icons.search),
            border: const OutlineInputBorder(),
            suffixIcon: _search.isEmpty
                ? null
                : IconButton(icon: const Icon(Icons.clear), onPressed: () => setState(() { _search = ''; _searchCtrl.clear(); })),
          ),
          onChanged: (v) => setState(() => _search = v),
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(children: [
            for (final t in ['Tous', ...propertyTypes])
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: FilterChip(
                  label: Text(t),
                  selected: _typeFilter == t,
                  onSelected: (_) => setState(() => _typeFilter = t),
                ),
              ),
          ]),
        ),
        const SizedBox(height: 8),
        ..._filtered.map((p) => Card(
          margin: const EdgeInsets.only(bottom: 10),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Text(p.emoji, style: const TextStyle(fontSize: 28)),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text('${p.type} · ${p.city}, ${p.region}'),
                  ]),
                ),
                Chip(label: Text(p.status), visualDensity: VisualDensity.compact),
              ]),
              const SizedBox(height: 8),
              Wrap(spacing: 6, runSpacing: 4, children: [
                Chip(avatar: const Icon(Icons.bed_outlined, size: 16), label: Text('${p.bedrooms} ch.'), visualDensity: VisualDensity.compact),
                Chip(avatar: const Icon(Icons.people_outline, size: 16), label: Text('${p.guests} pers.'), visualDensity: VisualDensity.compact),
                Chip(label: Text('${p.pricePerNight} DT/nuit'), visualDensity: VisualDensity.compact),
                if (p.pool) const Chip(label: Text('Piscine'), visualDensity: VisualDensity.compact),
                if (p.seaView) const Chip(label: Text('Vue mer'), visualDensity: VisualDensity.compact),
              ]),
              const SizedBox(height: 6),
              Text(p.amenities.join(' · '), style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 8),
              Row(children: [
                TextButton(onPressed: () => _cycleProperty(p), child: const Text('Statut')),
                const Spacer(),
                FilledButton.tonal(onPressed: () => _bookProperty(p), child: const Text('Réserver')),
              ]),
            ]),
          ),
        )),
        if (_filtered.isEmpty) const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('Aucun bien pour ce filtre.'))),
      ],
    );
  }

  Widget _bookingsTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Actives', '$_activeBookings', Icons.event_available),
          _kpi('Total', '${_bookings.length}', Icons.receipt_long),
          _kpi('CA', '$_revenue DT', Icons.account_balance_wallet_outlined),
        ]),
        const SizedBox(height: 8),
        ..._bookings.map((b) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: CircleAvatar(child: Text(b.id.split('-').last)),
            title: Text(b.guest, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('${b.property}\n${b.checkIn} → ${b.checkOut} · ${b.nights} nuits · ${b.total} DT'),
            isThreeLine: true,
            trailing: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Chip(label: Text(b.status), visualDensity: VisualDensity.compact),
              TextButton(onPressed: () => _cycleBooking(b), child: const Text('→')),
            ]),
          ),
        )),
      ],
    );
  }

  Widget _aiTab() {
    final chips = ['Villa piscine', 'Djerba', 'Budget 250', 'Famille 6', 'KPIs', 'Bungalow'];
    return Column(children: [
      Expanded(
        child: ListView.builder(
          controller: _chatScroll,
          padding: const EdgeInsets.all(12),
          itemCount: _chat.length + (_aiThinking ? 1 : 0),
          itemBuilder: (ctx, i) {
            if (_aiThinking && i == _chat.length) {
              return const Align(alignment: Alignment.centerLeft, child: Padding(padding: EdgeInsets.all(8), child: Text('SummerBot réfléchit…')));
            }
            final m = _chat[i];
            final isUser = m.role == 'user';
            return Align(
              alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
                decoration: BoxDecoration(
                  color: isUser ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(m.text, style: TextStyle(color: isUser ? Theme.of(context).colorScheme.onPrimary : null)),
              ),
            );
          },
        ),
      ),
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Row(children: chips.map((c) => Padding(
          padding: const EdgeInsets.only(right: 6),
          child: ActionChip(label: Text(c), onPressed: () => _sendAi(c)),
        )).toList()),
      ),
      Padding(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
        child: Row(children: [
          Expanded(
            child: TextField(
              controller: _aiInput,
              decoration: const InputDecoration(hintText: 'Demandez à SummerBot…', border: OutlineInputBorder()),
              onSubmitted: (_) => _sendAi(),
            ),
          ),
          const SizedBox(width: 8),
          FilledButton(onPressed: _aiThinking ? null : () => _sendAi(), child: const Icon(Icons.send)),
        ]),
      ),
    ]);
  }

  void _fabAction() {
    if (_tab == 0) {
      _addProperty();
    } else if (_tab == 1) {
      _addBooking();
    } else {
      _sendAi('Aide');
    }
  }

  @override
  void dispose() {
    _aiInput.dispose();
    _searchCtrl.dispose();
    _chatScroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pages = [_propertiesTab(), _bookingsTab(), _aiTab()];
    return Scaffold(
      appBar: AppBar(
        title: const Text('☀️ SummerStay'),
        actions: [
          IconButton(
            tooltip: widget.isDark ? 'Mode clair' : 'Mode sombre',
            onPressed: widget.onToggleTheme,
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
          ),
        ],
      ),
      body: pages[_tab],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _fabAction,
        icon: Icon(_tab == 2 ? Icons.auto_awesome : Icons.add),
        label: Text(_tab == 0 ? 'Bien' : _tab == 1 ? 'Réservation' : 'Aide IA'),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.holiday_village_outlined), selectedIcon: Icon(Icons.holiday_village), label: 'Biens'),
          NavigationDestination(icon: Icon(Icons.calendar_month_outlined), selectedIcon: Icon(Icons.calendar_month), label: 'Réservations'),
          NavigationDestination(icon: Icon(Icons.smart_toy_outlined), selectedIcon: Icon(Icons.smart_toy), label: 'IA'),
        ],
      ),
    );
  }
}
