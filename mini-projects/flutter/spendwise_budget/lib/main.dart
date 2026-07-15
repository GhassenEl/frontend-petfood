import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:spendwise_budget/data/demo_data.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('fr_FR');
  runApp(const SpendWiseApp());
}

class SpendWiseApp extends StatefulWidget {
  const SpendWiseApp({super.key});
  @override
  State<SpendWiseApp> createState() => _SpendWiseAppState();
}

class _SpendWiseAppState extends State<SpendWiseApp> {
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
      title: 'SpendWise — Gestionnaire de dépenses',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: SpendWiseHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class SpendWiseHome extends StatefulWidget {
  const SpendWiseHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<SpendWiseHome> createState() => _SpendWiseHomeState();
}

class _SpendWiseHomeState extends State<SpendWiseHome> {
  int _tab = 0;
  int _txSeq = 209;
  String _listFilter = 'Tous';
  final List<MoneyTx> _txs = List.of(initialTransactions);
  final _money = NumberFormat.currency(locale: 'fr_FR', symbol: 'DT', decimalDigits: 2);
  final _dateFmt = DateFormat('dd MMM yyyy', 'fr_FR');

  double get _income => _txs.where((t) => t.isIncome).fold(0.0, (s, t) => s + t.amount);
  double get _expense => _txs.where((t) => !t.isIncome).fold(0.0, (s, t) => s + t.amount);
  double get _balance => _income - _expense;

  List<MoneyTx> get _sorted => [..._txs]..sort((a, b) => b.date.compareTo(a.date));

  List<MoneyTx> get _filtered {
    return _sorted.where((t) {
      return switch (_listFilter) {
        'Revenus' => t.isIncome,
        'Dépenses' => !t.isIncome,
        _ => true,
      };
    }).toList();
  }

  Map<String, double> get _expenseByCategory {
    final map = <String, double>{};
    for (final t in _txs.where((x) => !x.isIncome)) {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    }
    return map;
  }

  Future<void> _addTx({required bool income}) async {
    final title = TextEditingController();
    final amount = TextEditingController();
    final cats = income ? incomeCategories : expenseCategories;
    var category = cats.first;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: Text(income ? 'Nouveau revenu' : 'Nouvelle dépense'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: title, decoration: const InputDecoration(labelText: 'Libellé', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: amount, decoration: const InputDecoration(labelText: 'Montant DT', border: OutlineInputBorder()), keyboardType: const TextInputType.numberWithOptions(decimal: true)),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: category,
                decoration: const InputDecoration(labelText: 'Catégorie', border: OutlineInputBorder()),
                items: cats.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (v) => setLocal(() => category = v ?? category),
              ),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Ajouter')),
          ],
        ),
      ),
    );
    if (ok == true && title.text.isNotEmpty) {
      final value = double.tryParse(amount.text.replaceAll(',', '.')) ?? 0;
      if (value <= 0) return;
      setState(() {
        _txs.insert(0, MoneyTx(
          id: 'TX-${_txSeq++}',
          title: title.text,
          amount: value,
          type: income ? 'income' : 'expense',
          category: category,
          date: DateTime.now(),
        ));
      });
    }
  }

  Future<void> _exportPdf() async {
    final doc = pw.Document();
    final now = DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now());
    doc.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        build: (ctx) => [
          pw.Header(level: 0, child: pw.Text('SpendWise — Rapport budget', style: pw.TextStyle(fontSize: 22, fontWeight: pw.FontWeight.bold))),
          pw.Text('Généré le $now'),
          pw.SizedBox(height: 16),
          pw.Row(mainAxisAlignment: pw.MainAxisAlignment.spaceBetween, children: [
            pw.Text('Revenus : ${_money.format(_income)}'),
            pw.Text('Dépenses : ${_money.format(_expense)}'),
            pw.Text('Solde : ${_money.format(_balance)}'),
          ]),
          pw.SizedBox(height: 20),
          pw.Text('Répartition dépenses', style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 8),
          ..._expenseByCategory.entries.map((e) => pw.Padding(
                padding: const pw.EdgeInsets.only(bottom: 4),
                child: pw.Text('• ${e.key} : ${_money.format(e.value)}'),
              )),
          pw.SizedBox(height: 20),
          pw.Text('Transactions', style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 8),
          pw.TableHelper.fromTextArray(
            headers: const ['Date', 'Libellé', 'Catégorie', 'Type', 'Montant'],
            data: _sorted.map((t) => [
              DateFormat('dd/MM/yyyy').format(t.date),
              t.title,
              t.category,
              t.isIncome ? 'Revenu' : 'Dépense',
              _money.format(t.amount),
            ]).toList(),
            headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10),
            cellStyle: const pw.TextStyle(fontSize: 9),
            cellAlignment: pw.Alignment.centerLeft,
          ),
        ],
      ),
    );
    await Printing.layoutPdf(onLayout: (_) async => doc.save(), name: 'spendwise-rapport.pdf');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Export PDF prêt')));
    }
  }

  Widget _kpi(String label, String value, {Color? color}) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(label, style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 4),
            Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
          ]),
        ),
      ),
    );
  }

  Widget _dashboardTab() {
    final byCat = _expenseByCategory;
    final pieSections = <PieChartSectionData>[];
    final palette = [Colors.grey.shade800, Colors.grey.shade600, Colors.grey.shade400, Colors.grey.shade200, Colors.blueGrey, Colors.black54, Colors.black38];
    var i = 0;
    byCat.forEach((cat, amount) {
      final pct = _expense == 0 ? 0.0 : amount / _expense * 100;
      pieSections.add(PieChartSectionData(
        value: amount,
        title: pct >= 8 ? '${pct.toStringAsFixed(0)}%' : '',
        color: palette[i % palette.length],
        radius: 54,
        titleStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onPrimary),
      ));
      i++;
    });

    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Revenus', _money.format(_income)),
          _kpi('Dépenses', _money.format(_expense)),
          _kpi('Solde', _money.format(_balance), color: _balance >= 0 ? null : Colors.redAccent),
        ]),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Dépenses par catégorie', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              SizedBox(
                height: 200,
                child: byCat.isEmpty
                    ? const Center(child: Text('Aucune dépense'))
                    : PieChart(PieChartData(sections: pieSections, sectionsSpace: 2, centerSpaceRadius: 36)),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: [
                  for (var j = 0; j < byCat.length; j++)
                    Chip(
                      avatar: CircleAvatar(backgroundColor: palette[j % palette.length], radius: 6),
                      label: Text('${byCat.keys.elementAt(j)} · ${_money.format(byCat.values.elementAt(j))}'),
                      visualDensity: VisualDensity.compact,
                    ),
                ],
              ),
            ]),
          ),
        ),
        const SizedBox(height: 8),
        Card(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Revenus vs dépenses', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 16),
              SizedBox(
                height: 180,
                child: BarChart(
                  BarChartData(
                    alignment: BarChartAlignment.spaceAround,
                    maxY: [_income, _expense, 100].reduce((a, b) => a > b ? a : b) * 1.2,
                    titlesData: FlTitlesData(
                      leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (v, _) => Text(v == 0 ? 'Revenus' : 'Dépenses', style: Theme.of(context).textTheme.bodySmall),
                        ),
                      ),
                    ),
                    borderData: FlBorderData(show: false),
                    gridData: const FlGridData(show: false),
                    barGroups: [
                      BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: _income, width: 36, color: Theme.of(context).colorScheme.primary, borderRadius: BorderRadius.circular(6))]),
                      BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: _expense, width: 36, color: Theme.of(context).colorScheme.secondary, borderRadius: BorderRadius.circular(6))]),
                    ],
                  ),
                ),
              ),
            ]),
          ),
        ),
        const SizedBox(height: 8),
        FilledButton.icon(onPressed: _exportPdf, icon: const Icon(Icons.picture_as_pdf), label: const Text('Exporter PDF')),
      ],
    );
  }

  Widget _transactionsTab() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
          child: Row(children: [
            _kpi('Ops', '${_txs.length}'),
            _kpi('Solde', _money.format(_balance), color: _balance >= 0 ? null : Colors.redAccent),
          ]),
        ),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
          child: Row(children: [
            for (final f in ['Tous', 'Revenus', 'Dépenses'])
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: FilterChip(label: Text(f), selected: _listFilter == f, onSelected: (_) => setState(() => _listFilter = f)),
              ),
          ]),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: _filtered.length,
            itemBuilder: (ctx, i) {
              final t = _filtered[i];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    child: Icon(t.isIncome ? Icons.arrow_downward : Icons.arrow_upward, size: 18),
                  ),
                  title: Text(t.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${t.category} · ${_dateFmt.format(t.date)}'),
                  trailing: Text(
                    '${t.isIncome ? '+' : '−'}${_money.format(t.amount)}',
                    style: TextStyle(fontWeight: FontWeight.bold, color: t.isIncome ? null : Colors.redAccent),
                  ),
                  onLongPress: () => setState(() => _txs.remove(t)),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _exportTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Export PDF', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 8),
        Text('Génère un rapport A4 avec solde, répartition par catégorie et liste des transactions.'),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Aperçu', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Text('Revenus : ${_money.format(_income)}'),
              Text('Dépenses : ${_money.format(_expense)}'),
              Text('Solde : ${_money.format(_balance)}'),
              Text('Transactions : ${_txs.length}'),
            ]),
          ),
        ),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: _exportPdf,
          icon: const Icon(Icons.picture_as_pdf_outlined),
          label: const Text('Générer & imprimer / sauver PDF'),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [_dashboardTab(), _transactionsTab(), _exportTab()];
    return Scaffold(
      appBar: AppBar(
        title: const Text('💸 SpendWise'),
        actions: [
          IconButton(tooltip: 'Export PDF', onPressed: _exportPdf, icon: const Icon(Icons.picture_as_pdf_outlined)),
          IconButton(
            tooltip: widget.isDark ? 'Mode clair' : 'Mode sombre',
            onPressed: widget.onToggleTheme,
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
          ),
        ],
      ),
      body: pages[_tab],
      floatingActionButton: _tab == 1
          ? Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                FloatingActionButton.extended(
                  heroTag: 'income',
                  onPressed: () => _addTx(income: true),
                  icon: const Icon(Icons.add),
                  label: const Text('Revenu'),
                ),
                const SizedBox(height: 8),
                FloatingActionButton.extended(
                  heroTag: 'expense',
                  onPressed: () => _addTx(income: false),
                  icon: const Icon(Icons.remove),
                  label: const Text('Dépense'),
                ),
              ],
            )
          : FloatingActionButton.extended(
              onPressed: _exportPdf,
              icon: const Icon(Icons.picture_as_pdf),
              label: const Text('PDF'),
            ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'Ops'),
          NavigationDestination(icon: Icon(Icons.picture_as_pdf_outlined), selectedIcon: Icon(Icons.picture_as_pdf), label: 'PDF'),
        ],
      ),
    );
  }
}
