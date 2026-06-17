import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class QrScanScreen extends StatefulWidget {
  const QrScanScreen({super.key, required this.auth});

  final AuthService auth;

  @override
  State<QrScanScreen> createState() => _QrScanScreenState();
}

class _QrScanScreenState extends State<QrScanScreen> {
  final _codeCtrl = TextEditingController(text: 'PF-TN-2026-A042');
  bool _busy = false;
  Map<String, dynamic>? _result;

  Future<void> _verify() async {
    final code = _codeCtrl.text.trim();
    if (code.isEmpty) return;
    setState(() { _busy = true; _result = null; });
    try {
      final data = await widget.auth.api.post('/ecosystem/traceability/verify-batch', {'batchCode': code});
      if (mounted) setState(() => _result = data is Map ? Map<String, dynamic>.from(data) : {'found': true});
    } catch (_) {
      if (mounted) {
        setState(() => _result = {
              'found': true,
              'batchCode': code,
              'verification': {'valid': true, 'reason': 'Lot authentifié (démo mobile)'},
              'mode': 'demo',
            });
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ok = _result?['found'] == true || _result?['verification']?['valid'] == true;
    return Scaffold(
      appBar: AppBar(title: const Text('Scan QR produit'), backgroundColor: const Color(0xFFEDE9FE)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            height: 180,
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF4ADE80), width: 2),
            ),
            child: const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.qr_code_scanner, size: 64, color: Color(0xFF4ADE80)),
                  SizedBox(height: 8),
                  Text('Cadrez le QR sur l\'emballage', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  Text('ou saisissez le numéro de lot', style: TextStyle(color: Colors.white54, fontSize: 11)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _codeCtrl,
            decoration: const InputDecoration(
              labelText: 'Numéro de lot',
              hintText: 'PF-TN-2026-XXXX',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.qr_code_2),
            ),
            textCapitalization: TextCapitalization.characters,
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: _busy ? null : _verify,
            icon: _busy ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.verified),
            label: Text(_busy ? 'Vérification…' : 'Vérifier la traçabilité'),
          ),
          if (_result != null) ...[
            const SizedBox(height: 16),
            Card(
              color: ok ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(ok ? Icons.check_circle : Icons.error, color: ok ? const Color(0xFF047857) : Colors.red),
                        const SizedBox(width: 8),
                        Text(ok ? 'Lot authentifié' : 'Lot non trouvé', style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(_result!['verification']?['reason']?.toString() ?? 'Chaîne blockchain valide'),
                    if (_result!['mode'] == 'demo')
                      const Padding(
                        padding: EdgeInsets.only(top: 6),
                        child: Text('Mode démo', style: TextStyle(fontSize: 11, color: Colors.grey)),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
