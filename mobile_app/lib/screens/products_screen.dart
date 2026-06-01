import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/auth_service.dart';
import '../services/repositories.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key, required this.auth});

  final AuthService auth;

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  late final ProductRepository _repo = ProductRepository(widget.auth.api);
  List<Product> _products = [];
  List<Product> _recommendations = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _repo.listProducts(),
        _repo.petRecommendations(),
      ]);
      setState(() {
        _products = results[0];
        _recommendations = results[1];
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Produits'),
        backgroundColor: const Color(0xFFD1FAE5),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (_recommendations.isNotEmpty) ...[
                    const Text('🐾 Recommandé pour vos animaux',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF9A3412))),
                    const SizedBox(height: 12),
                    ..._recommendations.where((p) => p.stock > 0).map(_productTile),
                    const SizedBox(height: 24),
                  ],
                  const Text('Tous les produits',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  ..._products.where((p) => p.stock > 0).map(_productTile),
                ],
              ),
            ),
    );
  }

  Widget _productTile(Product p) => Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: ListTile(
          contentPadding: const EdgeInsets.all(12),
          leading: CircleAvatar(
            backgroundColor: const Color(0xFFECFDF5),
            child: Text(_petEmoji(p.animalType), style: const TextStyle(fontSize: 22)),
          ),
          title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: Text(p.discount > 0 ? '-${p.discount.toInt()}% promo' : 'En stock : ${p.stock}'),
          trailing: Text(
            '${p.finalPrice.toStringAsFixed(2)} DT',
            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF059669), fontSize: 16),
          ),
        ),
      );

  String _petEmoji(String? type) {
    switch (type) {
      case 'dog':
        return '🐕';
      case 'cat':
        return '🐈';
      case 'bird':
        return '🐦';
      case 'fish':
        return '🐟';
      default:
        return '🐾';
    }
  }
}
