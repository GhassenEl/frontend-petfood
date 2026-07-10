import 'package:flutter/material.dart';
import 'package:bankflow_app/data/demo_data.dart';

void main() => runApp(const BankFlowApp());

class BankFlowApp extends StatefulWidget {
  const BankFlowApp({super.key});
  @override
  State<BankFlowApp> createState() => _BankFlowAppState();
}

class _BankFlowAppState extends State<BankFlowApp> {
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
      title: 'BankFlow — Application bancaire',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: BankFlowHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class BankFlowHome extends StatefulWidget {
  const BankFlowHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<BankFlowHome> createState() => _BankFlowHomeState();
}

class _BankFlowHomeState extends State<BankFlowHome> {
  int _tab = 0;
  int _txSeq = 5502;
  final List<BankAccount> _accounts = List.of(initialAccounts);
  final List<BankTransaction> _transactions = List.of(initialTransactions);
  final List<BankCard> _cards = List.of(initialCards);

  int get _totalBalance => _accounts.fold(0, (s, a) => s + a.balance);
  int get _monthIncome => _transactions.where((t) => t.amount > 0 && t.status == 'Validé').fold(0, (s, t) => s + t.amount);
  int get _monthExpenses => _transactions.where((t) => t.amount < 0 && t.status == 'Validé').fold(0, (s, t) => s + t.amount.abs());
  int get _activeCards => _cards.where((c) => c.status == 'Active').length;

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

  void _addAccount() async {
    final name = TextEditingController();
    final type = TextEditingController(text: 'Courant');
    final balance = TextEditingController(text: '0');
    final ok = await _dialog('Nouveau compte', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom du compte')),
      TextField(controller: type, decoration: const InputDecoration(labelText: 'Type')),
      TextField(controller: balance, decoration: const InputDecoration(labelText: 'Solde initial DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _accounts.add(BankAccount(
        name: name.text,
        type: type.text,
        iban: 'TN59 ${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        balance: int.tryParse(balance.text) ?? 0,
        currency: 'DT',
      )));
    }
  }

  void _addTransaction() async {
    final label = TextEditingController();
    final amount = TextEditingController();
    final type = TextEditingController(text: 'Virement');
    final ok = await _dialog('Nouvelle opération', [
      TextField(controller: label, decoration: const InputDecoration(labelText: 'Libellé')),
      TextField(controller: amount, decoration: const InputDecoration(labelText: 'Montant DT (- débit)'), keyboardType: TextInputType.number),
      TextField(controller: type, decoration: const InputDecoration(labelText: 'Type')),
    ]);
    if (ok == true && label.text.isNotEmpty) {
      final amt = int.tryParse(amount.text) ?? 0;
      setState(() {
        _transactions.insert(0, BankTransaction(
          id: 'TX-${_txSeq++}',
          label: label.text,
          amount: amt,
          type: type.text,
          date: 'Aujourd\'hui',
          status: 'En attente',
        ));
        if (_accounts.isNotEmpty && amt != 0) {
          _accounts.first.balance += amt;
        }
      });
    }
  }

  void _addCard() async {
    final type = TextEditingController(text: 'Visa Débit');
    final limit = TextEditingController(text: '3000');
    final ok = await _dialog('Nouvelle carte', [
      TextField(controller: type, decoration: const InputDecoration(labelText: 'Type de carte')),
      TextField(controller: limit, decoration: const InputDecoration(labelText: 'Plafond DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true) {
      setState(() => _cards.add(BankCard(
        holder: 'Amira B.',
        number: '**** **** **** ${1000 + _cards.length}',
        expiry: '06/29',
        type: type.text,
        limit: int.tryParse(limit.text) ?? 3000,
        status: 'Active',
      )));
    }
  }

  void _cycleTx(BankTransaction t) {
    final i = txStatuses.indexOf(t.status);
    setState(() => t.status = txStatuses[(i + 1) % txStatuses.length]);
  }

  void _cycleCard(BankCard c) {
    final i = cardStatuses.indexOf(c.status);
    setState(() => c.status = cardStatuses[(i + 1) % cardStatuses.length]);
  }

  void _transferQuick() async {
    final to = TextEditingController();
    final amount = TextEditingController();
    final ok = await _dialog('Virement rapide', [
      TextField(controller: to, decoration: const InputDecoration(labelText: 'Bénéficiaire')),
      TextField(controller: amount, decoration: const InputDecoration(labelText: 'Montant DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && to.text.isNotEmpty) {
      final amt = int.tryParse(amount.text) ?? 0;
      if (amt > 0 && _accounts.isNotEmpty && _accounts.first.balance >= amt) {
        setState(() {
          _accounts.first.balance -= amt;
          _transactions.insert(0, BankTransaction(
            id: 'TX-${_txSeq++}',
            label: 'Virement ${to.text}',
            amount: -amt,
            type: 'Virement',
            date: 'Aujourd\'hui',
            status: 'Validé',
          ));
        });
      }
    }
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 2:
        return _addTransaction;
      case 1:
        return _addAccount;
      case 3:
        return _addCard;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🏦 BankFlow'),
        actions: [
          if (_tab == 0)
            IconButton(onPressed: _transferQuick, icon: const Icon(Icons.send_outlined), tooltip: 'Virement rapide'),
          IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined)),
        ],
      ),
      floatingActionButton: FloatingActionButton(onPressed: _fabAction, child: const Icon(Icons.add)),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.all(16), children: [
            Text('Mon espace bancaire', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Solde total', style: TextStyle(color: Theme.of(context).colorScheme.secondary)),
                  const SizedBox(height: 6),
                  Text('$_totalBalance DT', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800)),
                ]),
              ),
            ),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Revenus', value: '+$_monthIncome DT'),
                _Kpi(label: 'Dépenses', value: '-$_monthExpenses DT'),
                _Kpi(label: 'Comptes', value: '${_accounts.length}'),
                _Kpi(label: 'Cartes actives', value: '$_activeCards'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Dernières opérations', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._transactions.take(4).map((t) => Card(
              child: ListTile(
                leading: Icon(t.amount >= 0 ? Icons.arrow_downward : Icons.arrow_upward),
                title: Text(t.label),
                subtitle: Text('${t.date} · ${t.type}'),
                trailing: Text(
                  '${t.amount >= 0 ? '+' : ''}${t.amount} DT',
                  style: TextStyle(fontWeight: FontWeight.w700, color: t.amount >= 0 ? Colors.green.shade700 : null),
                ),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _accounts.map((a) => Card(
            child: ListTile(
              leading: const Icon(Icons.account_balance_wallet_outlined),
              title: Text(a.name),
              subtitle: Text('${a.type}\n${a.iban}'),
              isThreeLine: true,
              trailing: Text('${a.balance} ${a.currency}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _transactions.map((t) => Card(
            child: ListTile(
              leading: Icon(_txIcon(t.type)),
              title: Text('${t.id} — ${t.label}'),
              subtitle: Text('${t.date} · ${t.type}'),
              onTap: () => _cycleTx(t),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${t.amount >= 0 ? '+' : ''}${t.amount} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(t.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _cards.map((c) => Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text(c.type, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                  GestureDetector(
                    onTap: () => _cycleCard(c),
                    child: Text(c.status, style: TextStyle(color: Theme.of(context).colorScheme.secondary)),
                  ),
                ]),
                const SizedBox(height: 12),
                Text(c.number, style: const TextStyle(fontSize: 18, letterSpacing: 2)),
                const SizedBox(height: 8),
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text(c.holder),
                  Text('Exp. ${c.expiry}'),
                ]),
                const SizedBox(height: 8),
                Text('Plafond : ${c.limit} DT', style: const TextStyle(fontWeight: FontWeight.w600)),
              ]),
            ),
          )).toList()),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Accueil'),
          NavigationDestination(icon: Icon(Icons.account_balance_outlined), label: 'Comptes'),
          NavigationDestination(icon: Icon(Icons.swap_horiz_outlined), label: 'Opérations'),
          NavigationDestination(icon: Icon(Icons.credit_card_outlined), label: 'Cartes'),
        ],
      ),
    );
  }

  IconData _txIcon(String type) {
    switch (type) {
      case 'Virement':
        return Icons.send_outlined;
      case 'Retrait':
        return Icons.atm_outlined;
      case 'Crédit':
        return Icons.savings_outlined;
      default:
        return Icons.receipt_long_outlined;
    }
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
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
      ],
    )));
  }
}
