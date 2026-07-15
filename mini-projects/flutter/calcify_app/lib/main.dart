import 'dart:math' as math;

import 'package:flutter/material.dart';

void main() => runApp(const CalcifyApp());

class CalcifyApp extends StatefulWidget {
  const CalcifyApp({super.key});
  @override
  State<CalcifyApp> createState() => _CalcifyAppState();
}

class _CalcifyAppState extends State<CalcifyApp> {
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
      title: 'Calcify — Calculatrice',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: CalcifyHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class HistoryEntry {
  HistoryEntry({required this.expression, required this.result});
  final String expression;
  final String result;
}

class CalcifyHome extends StatefulWidget {
  const CalcifyHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<CalcifyHome> createState() => _CalcifyHomeState();
}

class _CalcifyHomeState extends State<CalcifyHome> {
  int _tab = 0;
  String _display = '0';
  String _expression = '';
  double? _acc;
  String? _op;
  bool _resetOnNext = false;
  final List<HistoryEntry> _history = [];

  void _inputDigit(String d) {
    setState(() {
      if (_resetOnNext) {
        _display = d == '.' ? '0.' : d;
        _resetOnNext = false;
      } else if (d == '.') {
        if (!_display.contains('.')) _display += '.';
      } else {
        _display = _display == '0' ? d : '$_display$d';
      }
    });
  }

  void _setOp(String op) {
    setState(() {
      final value = double.tryParse(_display) ?? 0;
      if (_acc != null && _op != null && !_resetOnNext) {
        _acc = _compute(_acc!, value, _op!);
        _display = _format(_acc!);
      } else {
        _acc = value;
      }
      _op = op;
      _expression = '${_format(_acc!)} $op';
      _resetOnNext = true;
    });
  }

  double _compute(double a, double b, String op) {
    return switch (op) {
      '+' => a + b,
      '−' => a - b,
      '×' => a * b,
      '÷' => b == 0 ? double.nan : a / b,
      _ => b,
    };
  }

  String _format(double v) {
    if (v.isNaN || v.isInfinite) return 'Erreur';
    if (v == v.roundToDouble()) return v.round().toString();
    var s = v.toStringAsFixed(8);
    s = s.replaceFirst(RegExp(r'0+$'), '');
    s = s.replaceFirst(RegExp(r'\.$'), '');
    return s;
  }

  void _equals() {
    if (_op == null || _acc == null) return;
    setState(() {
      final value = double.tryParse(_display) ?? 0;
      final result = _compute(_acc!, value, _op!);
      final expr = '${_format(_acc!)} $_op ${_format(value)}';
      final formatted = _format(result);
      _history.insert(0, HistoryEntry(expression: expr, result: formatted));
      _display = formatted;
      _expression = '$expr =';
      _acc = null;
      _op = null;
      _resetOnNext = true;
    });
  }

  void _clear() {
    setState(() {
      _display = '0';
      _expression = '';
      _acc = null;
      _op = null;
      _resetOnNext = false;
    });
  }

  void _backspace() {
    setState(() {
      if (_resetOnNext || _display.length <= 1) {
        _display = '0';
        _resetOnNext = false;
      } else {
        _display = _display.substring(0, _display.length - 1);
      }
    });
  }

  void _toggleSign() {
    setState(() {
      if (_display == '0' || _display == 'Erreur') return;
      _display = _display.startsWith('-') ? _display.substring(1) : '-$_display';
    });
  }

  void _percent() {
    setState(() {
      final v = double.tryParse(_display) ?? 0;
      _display = _format(v / 100);
      _resetOnNext = true;
    });
  }

  void _squareRoot() {
    setState(() {
      final v = double.tryParse(_display) ?? 0;
      if (v < 0) {
        _display = 'Erreur';
      } else {
        _display = _format(math.sqrt(v));
        _history.insert(0, HistoryEntry(expression: '√$v', result: _display));
      }
      _resetOnNext = true;
    });
  }

  void _square() {
    setState(() {
      final v = double.tryParse(_display) ?? 0;
      _display = _format(v * v);
      _history.insert(0, HistoryEntry(expression: '$v²', result: _display));
      _resetOnNext = true;
    });
  }

  void _reuseHistory(HistoryEntry e) {
    setState(() {
      _display = e.result == 'Erreur' ? '0' : e.result;
      _expression = e.expression;
      _acc = null;
      _op = null;
      _resetOnNext = true;
      _tab = 0;
    });
  }

  Widget _btn(String label, {VoidCallback? onTap, bool accent = false, bool wide = false}) {
    final scheme = Theme.of(context).colorScheme;
    return Expanded(
      flex: wide ? 2 : 1,
      child: Padding(
        padding: const EdgeInsets.all(4),
        child: FilledButton(
          style: FilledButton.styleFrom(
            backgroundColor: accent ? scheme.primary : scheme.surfaceContainerHighest,
            foregroundColor: accent ? scheme.onPrimary : scheme.onSurface,
            padding: const EdgeInsets.symmetric(vertical: 18),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          onPressed: onTap,
          child: Text(label, style: TextStyle(fontSize: wide ? 22 : 20, fontWeight: FontWeight.w600)),
        ),
      ),
    );
  }

  Widget _calcTab() {
    return Column(
      children: [
        Expanded(
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
            alignment: Alignment.bottomRight,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(_expression, style: Theme.of(context).textTheme.titleMedium?.copyWith(color: Theme.of(context).colorScheme.secondary)),
                const SizedBox(height: 6),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerRight,
                  child: Text(_display, style: const TextStyle(fontSize: 52, fontWeight: FontWeight.bold, height: 1.1)),
                ),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(8, 0, 8, 12),
          child: Column(children: [
            Row(children: [
              _btn('C', onTap: _clear, accent: true),
              _btn('⌫', onTap: _backspace),
              _btn('%', onTap: _percent),
              _btn('÷', onTap: () => _setOp('÷'), accent: true),
            ]),
            Row(children: [
              _btn('√', onTap: _squareRoot),
              _btn('x²', onTap: _square),
              _btn('±', onTap: _toggleSign),
              _btn('×', onTap: () => _setOp('×'), accent: true),
            ]),
            Row(children: [
              _btn('7', onTap: () => _inputDigit('7')),
              _btn('8', onTap: () => _inputDigit('8')),
              _btn('9', onTap: () => _inputDigit('9')),
              _btn('−', onTap: () => _setOp('−'), accent: true),
            ]),
            Row(children: [
              _btn('4', onTap: () => _inputDigit('4')),
              _btn('5', onTap: () => _inputDigit('5')),
              _btn('6', onTap: () => _inputDigit('6')),
              _btn('+', onTap: () => _setOp('+'), accent: true),
            ]),
            Row(children: [
              _btn('1', onTap: () => _inputDigit('1')),
              _btn('2', onTap: () => _inputDigit('2')),
              _btn('3', onTap: () => _inputDigit('3')),
              _btn('=', onTap: _equals, accent: true),
            ]),
            Row(children: [
              _btn('0', onTap: () => _inputDigit('0'), wide: true),
              _btn('.', onTap: () => _inputDigit('.')),
              _btn('AC', onTap: _clear),
            ]),
          ]),
        ),
      ],
    );
  }

  Widget _historyTab() {
    if (_history.isEmpty) {
      return const Center(child: Text('Aucun calcul pour le moment.'));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _history.length,
      itemBuilder: (ctx, i) {
        final e = _history[i];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: Text(e.expression),
            subtitle: Text('= ${e.result}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            trailing: const Icon(Icons.replay),
            onTap: () => _reuseHistory(e),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🧮 Calcify'),
        actions: [
          if (_history.isNotEmpty && _tab == 1)
            IconButton(
              tooltip: 'Effacer historique',
              onPressed: () => setState(() => _history.clear()),
              icon: const Icon(Icons.delete_outline),
            ),
          IconButton(
            tooltip: widget.isDark ? 'Mode clair' : 'Mode sombre',
            onPressed: widget.onToggleTheme,
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
          ),
        ],
      ),
      body: _tab == 0 ? _calcTab() : _historyTab(),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: [
          const NavigationDestination(icon: Icon(Icons.calculate_outlined), selectedIcon: Icon(Icons.calculate), label: 'Calculatrice'),
          NavigationDestination(
            icon: Badge(isLabelVisible: _history.isNotEmpty, label: Text('${_history.length}'), child: const Icon(Icons.history)),
            selectedIcon: const Icon(Icons.history),
            label: 'Histororique',
          ),
        ],
      ),
    );
  }
}
