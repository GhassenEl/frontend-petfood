import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:stylehub_fashion/data/demo_data.dart';

void main() => runApp(const StyleHubApp());

class StyleHubApp extends StatefulWidget {
  const StyleHubApp({super.key});
  @override
  State<StyleHubApp> createState() => _StyleHubAppState();
}

class _StyleHubAppState extends State<StyleHubApp> {
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
      title: 'StyleHub — Boutique vêtements',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: StyleHubHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class StyleHubHome extends StatefulWidget {
  const StyleHubHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<StyleHubHome> createState() => _StyleHubHomeState();
}

class _StyleHubHomeState extends State<StyleHubHome> {
  int _tab = 0;
  int _orderSeq = 6103;
  String _category = 'Tous';
  String _query = '';
  FashionPromo? _appliedPromo;
  final TextEditingController _searchCtrl = TextEditingController();
  final List<FashionProduct> _products = List.of(initialProducts);
  final List<FashionOrder> _orders = List.of(initialOrders);
  final List<FashionPromo> _promos = List.of(initialPromos);
  final List<CartItem> _cart = [];

  int get _revenue => _orders.where((o) => o.status != 'Annulée').fold(0, (s, o) => s + o.total);
  int get _activeOrders => _orders.where((o) => o.status != 'Livrée' && o.status != 'Annulée').length;
  int get _totalStock => _products.fold(0, (s, p) => s + p.stock);
  int get _lowStock => _products.where((p) => p.stock > 0 && p.stock <= 5).length;
  int get _cartCount => _cart.fold(0, (s, c) => s + c.qty);
  int get _cartSubtotal => _cart.fold(0, (s, c) => s + c.lineTotal);
  int get _discountAmount {
    final d = _appliedPromo?.discount ?? 0;
    if (d <= 0) return 0;
    return (_cartSubtotal * d / 100).round();
  }
  int get _cartTotal => (_cartSubtotal - _discountAmount).clamp(0, 1 << 30);

  List<FashionProduct> get _filtered {
    return _products.where((p) {
      final catOk = _category == 'Tous' || p.category == _category;
      final q = _query.trim().toLowerCase();
      final qOk = q.isEmpty || p.name.toLowerCase().contains(q) || p.brand.toLowerCase().contains(q) || p.category.toLowerCase().contains(q);
      return catOk && qOk;
    }).toList();
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'Livrée':
        return Colors.green;
      case 'Expédiée':
        return Colors.blue;
      case 'En préparation':
        return Colors.orange;
      case 'Annulée':
        return Colors.redAccent;
      default:
        return Theme.of(context).colorScheme.secondary;
    }
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

  void _toast(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg), behavior: SnackBarBehavior.floating, duration: const Duration(seconds: 2)));
  }

  void _addProduct() async {
    final name = TextEditingController();
    final category = TextEditingController(text: 'Unisexe');
    final price = TextEditingController(text: '99');
    final stock = TextEditingController(text: '10');
    final ok = await _dialog('Nouvel article', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom', border: OutlineInputBorder())),
      const SizedBox(height: 10),
      TextField(controller: category, decoration: const InputDecoration(labelText: 'Catégorie', border: OutlineInputBorder())),
      const SizedBox(height: 10),
      TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix DT', border: OutlineInputBorder()), keyboardType: TextInputType.number),
      const SizedBox(height: 10),
      TextField(controller: stock, decoration: const InputDecoration(labelText: 'Stock', border: OutlineInputBorder()), keyboardType: TextInputType.number),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _products.insert(0, FashionProduct(
        name: name.text,
        category: category.text,
        size: 'S–L',
        price: int.tryParse(price.text) ?? 99,
        stock: int.tryParse(stock.text) ?? 10,
        emoji: '🛍️',
      )));
      _toast('Article ajouté au catalogue');
    }
  }

  void _addToCart(FashionProduct p) {
    if (p.stock <= 0) {
      _toast('Rupture de stock');
      return;
    }
    setState(() {
      final existing = _cart.where((c) => identical(c.product, p)).firstOrNull;
      if (existing != null) {
        if (existing.qty < p.stock) {
          existing.qty++;
        } else {
          _toast('Stock insuffisant');
          return;
        }
      } else {
        _cart.add(CartItem(product: p));
      }
    });
    HapticFeedback.selectionClick();
    _toast('${p.name} ajouté au panier');
  }

  void _changeQty(CartItem item, int delta) {
    setState(() {
      final next = item.qty + delta;
      if (next <= 0) {
        _cart.remove(item);
      } else if (next <= item.product.stock) {
        item.qty = next;
      } else {
        _toast('Stock max atteint');
      }
    });
  }

  void _checkout() async {
    if (_cart.isEmpty) {
      _toast('Panier vide');
      return;
    }
    final client = TextEditingController(text: 'Client boutique');
    final ok = await _dialog('Valider la commande', [
      Text('Sous-total : $_cartSubtotal DT'),
      if (_discountAmount > 0) Text('Remise : -$_discountAmount DT (${_appliedPromo!.code})'),
      Text('Total : $_cartTotal DT', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
      const SizedBox(height: 12),
      TextField(controller: client, decoration: const InputDecoration(labelText: 'Nom client', border: OutlineInputBorder())),
    ]);
    if (ok == true) {
      for (final c in _cart) {
        if (c.qty > c.product.stock) {
          _toast('Stock modifié — vérifiez le panier');
          return;
        }
      }
      setState(() {
        for (final c in _cart) {
          c.product.stock -= c.qty;
        }
        final labels = _cart.map((c) => '${c.product.name} x${c.qty}').join(', ');
        _orders.insert(0, FashionOrder(
          id: 'ST-${_orderSeq++}',
          client: client.text.isNotEmpty ? client.text : 'Client',
          items: labels,
          total: _cartTotal,
          status: 'En attente',
        ));
        _cart.clear();
        _appliedPromo = null;
      });
      _toast('Commande confirmée');
      setState(() => _tab = 2);
    }
  }

  void _applyPromo(FashionPromo p) {
    setState(() => _appliedPromo = p);
    _toast(p.discount > 0 ? 'Code ${p.code} appliqué (-${p.discount} %)' : 'Code ${p.code} appliqué');
    setState(() => _tab = 3);
  }

  void _cycleOrder(FashionOrder o) {
    final i = orderStatuses.indexOf(o.status);
    setState(() => o.status = orderStatuses[(i + 1) % orderStatuses.length]);
  }

  void _addPromo() async {
    final title = TextEditingController();
    final code = TextEditingController();
    final discount = TextEditingController(text: '15');
    final ok = await _dialog('Nouvelle promo', [
      TextField(controller: title, decoration: const InputDecoration(labelText: 'Titre', border: OutlineInputBorder())),
      const SizedBox(height: 10),
      TextField(controller: code, decoration: const InputDecoration(labelText: 'Code', border: OutlineInputBorder())),
      const SizedBox(height: 10),
      TextField(controller: discount, decoration: const InputDecoration(labelText: 'Remise %', border: OutlineInputBorder()), keyboardType: TextInputType.number),
    ]);
    if (ok == true && title.text.isNotEmpty) {
      setState(() => _promos.insert(0, FashionPromo(
        title: title.text,
        description: 'Offre spéciale boutique',
        code: code.text.isNotEmpty ? code.text.toUpperCase() : 'PROMO',
        discount: int.tryParse(discount.text) ?? 15,
      )));
    }
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
        return _checkout;
      case 1:
        return _addProduct;
      case 2:
        return () => setState(() => _tab = 1);
      case 3:
        return _addPromo;
      case 4:
        return _checkout;
      default:
        return null;
    }
  }

  IconData get _fabIcon {
    if (_tab == 0 || _tab == 4) return Icons.payment;
    if (_tab == 2) return Icons.add_shopping_cart;
    return Icons.add;
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final secondary = Theme.of(context).colorScheme.secondary;

    return Scaffold(
      appBar: AppBar(
        title: const Text('🛍️ StyleHub'),
        actions: [
          Stack(alignment: Alignment.topRight, children: [
            IconButton(
              onPressed: () => setState(() => _tab = 4),
              icon: const Icon(Icons.shopping_cart_outlined),
              tooltip: 'Panier',
            ),
            if (_cartCount > 0)
              Positioned(
                right: 6,
                top: 6,
                child: CircleAvatar(
                  radius: 9,
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  child: Text('$_cartCount', style: TextStyle(fontSize: 10, color: Theme.of(context).colorScheme.onPrimary, fontWeight: FontWeight.w800)),
                ),
              ),
          ]),
          IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined)),
        ],
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: FloatingActionButton(onPressed: _fabAction, child: Icon(_fabIcon)),
      ),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: [
            Text('StyleHub Fashion', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text('Boutique vêtements · stock dynamique · panier', style: TextStyle(color: secondary)),
            const SizedBox(height: 14),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.45,
              children: [
                _Kpi(label: 'Commandes actives', value: '$_activeOrders'),
                _Kpi(label: 'CA total', value: '$_revenue DT'),
                _Kpi(label: 'Stock total', value: '$_totalStock'),
                _Kpi(label: 'Stock bas', value: '$_lowStock', alert: _lowStock > 0),
              ],
            ),
            if (_cartCount > 0) ...[
              const SizedBox(height: 14),
              Card(
                child: ListTile(
                  leading: const Icon(Icons.shopping_cart_checkout),
                  title: Text('Panier · $_cartCount article(s)'),
                  subtitle: Text(_discountAmount > 0 ? '$_cartSubtotal − $_discountAmount = $_cartTotal DT' : '$_cartTotal DT'),
                  trailing: FilledButton(onPressed: _checkout, child: const Text('Payer')),
                  onTap: () => setState(() => _tab = 4),
                ),
              ),
            ],
            const SizedBox(height: 16),
            const Text('Meilleures ventes', style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            SizedBox(
              height: 150,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _products.take(5).length,
                separatorBuilder: (context, index) => const SizedBox(width: 10),
                itemBuilder: (context, i) {
                  final p = _products[i];
                  return _ProductMini(product: p, onAdd: () => _addToCart(p));
                },
              ),
            ),
            const SizedBox(height: 16),
            const Text('Commandes récentes', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._orders.take(4).map((o) => Card(
              child: ListTile(
                title: Text('${o.id} — ${o.client}'),
                subtitle: Text(o.items),
                trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                  Text('${o.total} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                  Text(o.status, style: TextStyle(fontSize: 12, color: _statusColor(o.status))),
                ]),
              ),
            )),
          ]),
          Column(children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: TextField(
                controller: _searchCtrl,
                onChanged: (v) => setState(() => _query = v),
                decoration: InputDecoration(
                  hintText: 'Rechercher un vêtement, marque…',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _query.isEmpty ? null : IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchCtrl.clear(); setState(() => _query = ''); }),
                  border: const OutlineInputBorder(),
                  isDense: true,
                ),
              ),
            ),
            SizedBox(
              height: 52,
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
                scrollDirection: Axis.horizontal,
                itemCount: fashionCategories.length,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final c = fashionCategories[i];
                  final selected = _category == c;
                  return FilterChip(
                    label: Text(c),
                    selected: selected,
                    onSelected: (value) => setState(() => _category = c),
                  );
                },
              ),
            ),
            Expanded(
              child: _filtered.isEmpty
                  ? Center(child: Text('Aucun article trouvé', style: TextStyle(color: secondary)))
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 88),
                      itemCount: _filtered.length,
                      itemBuilder: (context, i) {
                        final p = _filtered[i];
                        final low = p.stock > 0 && p.stock <= 5;
                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Row(children: [
                              Container(
                                width: 64,
                                height: 64,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: Theme.of(context).colorScheme.surface,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: secondary.withValues(alpha: 0.25)),
                                ),
                                child: Text(p.emoji, style: const TextStyle(fontSize: 30)),
                              ),
                              const SizedBox(width: 12),
                              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text(p.name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                                Text('${p.brand} · ${p.category} · ${p.size}', style: TextStyle(fontSize: 12, color: secondary)),
                                const SizedBox(height: 4),
                                Row(children: [
                                  Text('${p.price} DT', style: const TextStyle(fontWeight: FontWeight.w800)),
                                  const SizedBox(width: 10),
                                  Text(
                                    p.stock == 0 ? 'Rupture' : low ? 'Stock bas (${p.stock})' : 'Stock ${p.stock}',
                                    style: TextStyle(fontSize: 12, color: p.stock == 0 ? Colors.redAccent : low ? Colors.orange : secondary),
                                  ),
                                ]),
                              ])),
                              IconButton.filledTonal(
                                onPressed: p.stock == 0 ? null : () => _addToCart(p),
                                icon: const Icon(Icons.add_shopping_cart),
                              ),
                            ]),
                          ),
                        );
                      },
                    ),
            ),
          ]),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: [
            Text('Commandes', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text('Touchez une commande pour faire avancer le statut', style: TextStyle(color: secondary, fontSize: 13)),
            const SizedBox(height: 12),
            ..._orders.map((o) => Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: _statusColor(o.status).withValues(alpha: 0.15),
                  child: Icon(Icons.local_shipping_outlined, color: _statusColor(o.status)),
                ),
                title: Text('${o.id} — ${o.client}'),
                subtitle: Text(o.items),
                onTap: () => _cycleOrder(o),
                trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                  Text('${o.total} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                  Text(o.status, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _statusColor(o.status))),
                ]),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: [
            Text('Promotions', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text('Appliquez un code sur le panier', style: TextStyle(color: secondary, fontSize: 13)),
            const SizedBox(height: 12),
            if (_appliedPromo != null)
              Card(
                color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.08),
                child: ListTile(
                  leading: const Icon(Icons.check_circle_outline),
                  title: Text('Actif : ${_appliedPromo!.code}'),
                  subtitle: Text(_appliedPromo!.title),
                  trailing: TextButton(onPressed: () => setState(() => _appliedPromo = null), child: const Text('Retirer')),
                ),
              ),
            ..._promos.map((p) => Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Expanded(child: Text(p.title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800))),
                    if (p.discount > 0)
                      Chip(label: Text('-${p.discount}%'), visualDensity: VisualDensity.compact),
                  ]),
                  const SizedBox(height: 6),
                  Text(p.description),
                  const SizedBox(height: 10),
                  Row(children: [
                    Expanded(child: Text('Code : ${p.code}', style: const TextStyle(fontWeight: FontWeight.w700))),
                    FilledButton.tonal(onPressed: () => _applyPromo(p), child: const Text('Appliquer')),
                  ]),
                ]),
              ),
            )),
          ]),
          _cart.isEmpty
              ? Center(child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Icon(Icons.shopping_cart_outlined, size: 56, color: secondary),
                    const SizedBox(height: 12),
                    const Text('Votre panier est vide', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
                    const SizedBox(height: 8),
                    Text('Ajoutez des articles depuis le catalogue', style: TextStyle(color: secondary)),
                    const SizedBox(height: 16),
                    FilledButton(onPressed: () => setState(() => _tab = 1), child: const Text('Voir le catalogue')),
                  ]),
                ))
              : ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 120), children: [
                  Text('Panier ($_cartCount)', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 12),
                  ..._cart.map((c) => Card(
                    child: ListTile(
                      leading: Text(c.product.emoji, style: const TextStyle(fontSize: 28)),
                      title: Text(c.product.name),
                      subtitle: Text('${c.product.price} DT · stock ${c.product.stock}'),
                      trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                        IconButton(onPressed: () => _changeQty(c, -1), icon: const Icon(Icons.remove_circle_outline)),
                        Text('${c.qty}', style: const TextStyle(fontWeight: FontWeight.w800)),
                        IconButton(onPressed: () => _changeQty(c, 1), icon: const Icon(Icons.add_circle_outline)),
                      ]),
                    ),
                  )),
                  const SizedBox(height: 8),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                        _PriceRow(label: 'Sous-total', value: '$_cartSubtotal DT'),
                        if (_discountAmount > 0) _PriceRow(label: 'Remise ${_appliedPromo!.code}', value: '-$_discountAmount DT'),
                        const Divider(),
                        _PriceRow(label: 'Total', value: '$_cartTotal DT', bold: true),
                        const SizedBox(height: 12),
                        FilledButton.icon(onPressed: _checkout, icon: const Icon(Icons.payment), label: const Text('Passer commande')),
                        if (_appliedPromo == null)
                          TextButton(onPressed: () => setState(() => _tab = 3), child: const Text('Ajouter un code promo')),
                      ]),
                    ),
                  ),
                ]),
        ],
      ),
      bottomNavigationBar: Material(
        elevation: 12,
        color: Theme.of(context).colorScheme.surface,
        child: SafeArea(
          top: false,
          child: BottomNavigationBar(
            currentIndex: _tab > 3 ? 4 : _tab,
            onTap: (i) => setState(() => _tab = i),
            type: BottomNavigationBarType.fixed,
            selectedItemColor: Theme.of(context).colorScheme.primary,
            unselectedItemColor: secondary,
            showUnselectedLabels: true,
            items: [
              const BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Boutique'),
              const BottomNavigationBarItem(icon: Icon(Icons.checkroom_outlined), label: 'Catalogue'),
              const BottomNavigationBarItem(icon: Icon(Icons.receipt_long_outlined), label: 'Commandes'),
              const BottomNavigationBarItem(icon: Icon(Icons.local_offer_outlined), label: 'Promos'),
              BottomNavigationBarItem(
                icon: Badge(
                  isLabelVisible: _cartCount > 0,
                  label: Text('$_cartCount'),
                  child: const Icon(Icons.shopping_cart_outlined),
                ),
                label: 'Panier',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Kpi extends StatelessWidget {
  const _Kpi({required this.label, required this.value, this.alert = false});
  final String label;
  final String value;
  final bool alert;
  @override
  Widget build(BuildContext context) {
    return Card(child: Padding(padding: const EdgeInsets.all(14), child: Column(
      crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(label, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
        const SizedBox(height: 6),
        Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: alert ? Colors.orange : null)),
      ],
    )));
  }
}

class _ProductMini extends StatelessWidget {
  const _ProductMini({required this.product, required this.onAdd});
  final FashionProduct product;
  final VoidCallback onAdd;
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 130,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.25)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(product.emoji, style: const TextStyle(fontSize: 28)),
        const Spacer(),
        Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
        Text('${product.price} DT', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
        Align(
          alignment: Alignment.centerRight,
          child: IconButton(visualDensity: VisualDensity.compact, onPressed: onAdd, icon: const Icon(Icons.add_circle_outline, size: 20)),
        ),
      ]),
    );
  }
}

class _PriceRow extends StatelessWidget {
  const _PriceRow({required this.label, required this.value, this.bold = false});
  final String label;
  final String value;
  final bool bold;
  @override
  Widget build(BuildContext context) {
    final style = TextStyle(fontWeight: bold ? FontWeight.w800 : FontWeight.w500, fontSize: bold ? 18 : 14);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: style),
        Text(value, style: style),
      ]),
    );
  }
}
