import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:parksmart_parking/data/demo_data.dart';

void main() => runApp(const ParkSmartApp());

class ParkSmartApp extends StatefulWidget {
  const ParkSmartApp({super.key});
  @override
  State<ParkSmartApp> createState() => _ParkSmartAppState();
}

class _ParkSmartAppState extends State<ParkSmartApp> {
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
      title: 'ParkSmart — Smart Parking',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: ParkSmartHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class ParkSmartHome extends StatefulWidget {
  const ParkSmartHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<ParkSmartHome> createState() => _ParkSmartHomeState();
}

class _ParkSmartHomeState extends State<ParkSmartHome> {
  int _tab = 0;
  int _bookSeq = 902;
  String _zoneFilter = 'Tous';
  final _rng = Random();
  final List<ParkingSpot> _spots = buildInitialSpots();
  final List<ParkingBooking> _bookings = List.of(initialBookings);
  ParkingBooking? _selectedQr;
  String _lastScan = 'Jamais';

  int get _free => _spots.where((s) => s.isFree).length;
  int get _occupied => _spots.where((s) => s.status == 'occupe').length;
  int get _reserved => _spots.where((s) => s.status == 'reserve').length;
  int get _activeBookings => _bookings.where((b) => b.status == 'Confirmée' || b.status == 'Active' || b.status == 'En attente').length;
  double get _revenue => _bookings.where((b) => b.paid).fold(0.0, (s, b) => s + b.amount);

  List<ParkingSpot> get _mapSpots {
    if (_zoneFilter == 'Tous') return _spots;
    return _spots.where((s) => s.zone == _zoneFilter).toList();
  }

  Color _spotColor(String status, ColorScheme scheme) {
    return switch (status) {
      'libre' => Colors.green.shade600,
      'occupe' => Colors.red.shade400,
      'reserve' => Colors.amber.shade700,
      _ => scheme.outline,
    };
  }

  void _detectFreeSpots() {
    setState(() {
      for (final s in _spots) {
        if (s.status == 'hors-service' || s.status == 'reserve') continue;
        // IoT simulation: random free/occupied, keep reserved
        s.status = _rng.nextDouble() < 0.55 ? 'libre' : 'occupe';
      }
      // sync reserved spots from active bookings
      for (final b in _bookings.where((x) => x.status == 'Confirmée' || x.status == 'Active' || x.status == 'En attente')) {
        final spot = _spots.where((s) => s.id == b.spotId).firstOrNull;
        if (spot != null && spot.status != 'hors-service') spot.status = 'reserve';
      }
      _lastScan = 'À l\'instant';
    });
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Détection IoT : $_free places libres')));
  }

  Future<void> _reserveSpot([ParkingSpot? preset]) async {
    final free = _spots.where((s) => s.isFree).toList();
    if (free.isEmpty && preset == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Aucune place libre')));
      return;
    }
    final plate = TextEditingController(text: '100 TU 2026');
    final driver = TextEditingController(text: 'Conducteur');
    final hours = TextEditingController(text: '2');
    var spotId = preset?.id ?? free.first.id;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Réserver une place'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              DropdownButtonFormField<String>(
                initialValue: spotId,
                decoration: const InputDecoration(labelText: 'Place', border: OutlineInputBorder()),
                items: [
                  if (preset != null) DropdownMenuItem(value: preset.id, child: Text(preset.id)),
                  ..._spots.where((s) => s.isFree || s.id == spotId).map((s) => DropdownMenuItem(value: s.id, child: Text('${s.id} · ${s.level} · ${s.zone}'))),
                ],
                onChanged: (v) => setLocal(() => spotId = v ?? spotId),
              ),
              const SizedBox(height: 8),
              TextField(controller: plate, decoration: const InputDecoration(labelText: 'Immatriculation', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: driver, decoration: const InputDecoration(labelText: 'Conducteur', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: hours, decoration: const InputDecoration(labelText: 'Heures', border: OutlineInputBorder()), keyboardType: TextInputType.number),
              const SizedBox(height: 8),
              Text('Tarif : $hourlyRate DT / h', style: Theme.of(context).textTheme.bodySmall),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Réserver')),
          ],
        ),
      ),
    );
    if (ok == true) {
      final h = int.tryParse(hours.text) ?? 2;
      final amount = h * hourlyRate;
      final id = 'PK-${_bookSeq++}';
      final booking = ParkingBooking(
        id: id,
        spotId: spotId,
        plate: plate.text.isNotEmpty ? plate.text : 'N/A',
        driver: driver.text.isNotEmpty ? driver.text : 'Conducteur',
        hours: h,
        amount: amount,
        status: 'En attente',
        createdAt: 'À l\'instant',
        qrPayload: 'PARKSMART|$id|$spotId|${plate.text}',
      );
      setState(() {
        _bookings.insert(0, booking);
        final spot = _spots.where((s) => s.id == spotId).firstOrNull;
        if (spot != null) spot.status = 'reserve';
        _selectedQr = booking;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Réservation $id — ${amount.toStringAsFixed(2)} DT')));
      }
    }
  }

  Future<void> _payBooking(ParkingBooking b) async {
    if (b.paid) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Déjà payé')));
      return;
    }
    var method = 'Carte';
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: Text('Payer ${b.id}'),
          content: Column(mainAxisSize: MainAxisSize.min, children: [
            Text('${b.spotId} · ${b.plate}\n${b.hours} h · ${b.amount.toStringAsFixed(2)} DT', textAlign: TextAlign.center),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: method,
              decoration: const InputDecoration(labelText: 'Moyen de paiement', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'Carte', child: Text('Carte bancaire')),
                DropdownMenuItem(value: 'Espèces', child: Text('Espèces')),
                DropdownMenuItem(value: 'Mobile', child: Text('Paiement mobile')),
              ],
              onChanged: (v) => setLocal(() => method = v ?? method),
            ),
          ]),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Payer')),
          ],
        ),
      ),
    );
    if (ok == true) {
      setState(() {
        b.paid = true;
        b.paymentMethod = method;
        if (b.status == 'En attente') b.status = 'Confirmée';
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Paiement OK — $method')));
      }
    }
  }

  void _cycleBooking(ParkingBooking b) {
    final i = bookingStatuses.indexOf(b.status);
    setState(() {
      b.status = bookingStatuses[(i + 1) % bookingStatuses.length];
      final spot = _spots.where((s) => s.id == b.spotId).firstOrNull;
      if (spot == null) return;
      if (b.status == 'Terminée' || b.status == 'Annulée') {
        spot.status = 'libre';
      } else if (b.status == 'Confirmée' || b.status == 'Active' || b.status == 'En attente') {
        spot.status = 'reserve';
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

  Widget _mapTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Libres', '$_free', Icons.local_parking),
          _kpi('Occupées', '$_occupied', Icons.directions_car),
          _kpi('Réservées', '$_reserved', Icons.bookmark_border),
        ]),
        const SizedBox(height: 8),
        Card(
          child: ListTile(
            leading: const Icon(Icons.sensors),
            title: const Text('Détection places libres'),
            subtitle: Text('Dernier scan IoT : $_lastScan'),
            trailing: FilledButton.tonal(onPressed: _detectFreeSpots, child: const Text('Scanner')),
          ),
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(children: [
            for (final z in ['Tous', 'A', 'B', 'C'])
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: FilterChip(label: Text(z == 'Tous' ? 'Toute la carte' : 'Zone $z'), selected: _zoneFilter == z, onSelected: (_) => setState(() => _zoneFilter = z)),
              ),
          ]),
        ),
        const SizedBox(height: 8),
        Wrap(spacing: 8, children: [
          _legend(Colors.green.shade600, 'Libre'),
          _legend(Colors.red.shade400, 'Occupé'),
          _legend(Colors.amber.shade700, 'Réservé'),
          _legend(Theme.of(context).colorScheme.outline, 'Hors service'),
        ]),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Carte parking · ${_zoneFilter == 'Tous' ? 'Toutes zones' : 'Zone $_zoneFilter'}', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              LayoutBuilder(builder: (ctx, constraints) {
                final spots = _mapSpots;
                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: spots.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 4, mainAxisSpacing: 8, crossAxisSpacing: 8, childAspectRatio: 1.1),
                  itemBuilder: (ctx, i) {
                    final s = spots[i];
                    return InkWell(
                      onTap: () {
                        if (s.isFree) {
                          _reserveSpot(s);
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${s.id} — ${s.status}')));
                        }
                      },
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        decoration: BoxDecoration(
                          color: _spotColor(s.status, Theme.of(context).colorScheme).withValues(alpha: 0.85),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Text(s.id, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                          Text(s.level, style: const TextStyle(fontSize: 11, color: Colors.white70)),
                        ]),
                      ),
                    );
                  },
                );
              }),
              const SizedBox(height: 8),
              Text('Touchez une place verte pour réserver.', style: Theme.of(context).textTheme.bodySmall),
            ]),
          ),
        ),
      ],
    );
  }

  Widget _legend(Color c, String label) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Container(width: 12, height: 12, decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(3))),
      const SizedBox(width: 4),
      Text(label, style: Theme.of(context).textTheme.bodySmall),
    ]);
  }

  Widget _bookingsTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('Actives', '$_activeBookings', Icons.event_available),
          _kpi('CA payé', '${_revenue.toStringAsFixed(0)} DT', Icons.payments_outlined),
          _kpi('Places', '${_spots.length}', Icons.grid_view),
        ]),
        const SizedBox(height: 8),
        ..._bookings.map((b) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(child: Text('${b.id} · Place ${b.spotId}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
                Chip(label: Text(b.status), visualDensity: VisualDensity.compact),
              ]),
              Text('${b.driver} · ${b.plate}'),
              Text('${b.hours} h · ${b.amount.toStringAsFixed(2)} DT · ${b.createdAt}'),
              Text(b.paid ? 'Payé (${b.paymentMethod})' : 'Non payé', style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 8),
              Wrap(spacing: 8, children: [
                if (!b.paid) FilledButton.tonal(onPressed: () => _payBooking(b), child: const Text('Payer')),
                OutlinedButton(onPressed: () => setState(() { _selectedQr = b; _tab = 3; }), child: const Text('QR')),
                TextButton(onPressed: () => _cycleBooking(b), child: const Text('Statut →')),
              ]),
            ]),
          ),
        )),
      ],
    );
  }

  Widget _payTab() {
    final unpaid = _bookings.where((b) => !b.paid && b.status != 'Annulée').toList();
    final paid = _bookings.where((b) => b.paid).toList();
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(children: [
          _kpi('À payer', '${unpaid.length}', Icons.pending_actions),
          _kpi('Payés', '${paid.length}', Icons.check_circle_outline),
          _kpi('Total', '${_revenue.toStringAsFixed(0)} DT', Icons.account_balance_wallet_outlined),
        ]),
        const SizedBox(height: 8),
        Text('En attente de paiement', style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 6),
        if (unpaid.isEmpty) const Card(child: ListTile(title: Text('Aucune facture en attente'))),
        ...unpaid.map((b) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: Text('${b.id} · ${b.spotId}'),
            subtitle: Text('${b.plate} · ${b.amount.toStringAsFixed(2)} DT'),
            trailing: FilledButton(onPressed: () => _payBooking(b), child: const Text('Payer')),
          ),
        )),
        const SizedBox(height: 12),
        Text('Historique paiements', style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 6),
        ...paid.map((b) => Card(
          margin: const EdgeInsets.only(bottom: 6),
          child: ListTile(
            leading: const Icon(Icons.receipt_long),
            title: Text('${b.id} · ${b.paymentMethod}'),
            subtitle: Text('${b.spotId} · ${b.plate}'),
            trailing: Text('${b.amount.toStringAsFixed(2)} DT', style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
        )),
      ],
    );
  }

  Widget _qrTab() {
    final b = _selectedQr ?? (_bookings.isNotEmpty ? _bookings.first : null);
    if (b == null) return const Center(child: Text('Aucune réservation pour QR'));
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('QR d\'accès parking', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        DropdownButtonFormField<ParkingBooking>(
          initialValue: b,
          decoration: const InputDecoration(labelText: 'Réservation', border: OutlineInputBorder()),
          items: _bookings.map((x) => DropdownMenuItem(value: x, child: Text('${x.id} · ${x.spotId}'))).toList(),
          onChanged: (v) => setState(() => _selectedQr = v),
        ),
        const SizedBox(height: 20),
        Center(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(children: [
                QrImageView(
                  data: b.qrPayload,
                  version: QrVersions.auto,
                  size: 220,
                  backgroundColor: Colors.white,
                  eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: Colors.black),
                  dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: Colors.black),
                ),
                const SizedBox(height: 12),
                Text('${b.id} · Place ${b.spotId}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text('${b.plate} · ${b.driver}'),
                const SizedBox(height: 8),
                SelectableText(b.qrPayload, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodySmall),
              ]),
            ),
          ),
        ),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: () {
            Clipboard.setData(ClipboardData(text: b.qrPayload));
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payload QR copié')));
          },
          icon: const Icon(Icons.copy),
          label: const Text('Copier QR'),
        ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () {
            setState(() {
              if (b.status == 'Confirmée' || b.status == 'En attente') b.status = 'Active';
              final spot = _spots.where((s) => s.id == b.spotId).firstOrNull;
              if (spot != null) spot.status = 'reserve';
            });
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Scan entrée OK — place ${b.spotId}')));
          },
          icon: const Icon(Icons.qr_code_scanner),
          label: const Text('Simuler scan entrée'),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [_mapTab(), _bookingsTab(), _payTab(), _qrTab()];
    return Scaffold(
      appBar: AppBar(
        title: const Text('🅿️ ParkSmart'),
        actions: [
          IconButton(tooltip: 'Détecter places', onPressed: _detectFreeSpots, icon: const Icon(Icons.radar)),
          IconButton(
            tooltip: widget.isDark ? 'Mode clair' : 'Mode sombre',
            onPressed: widget.onToggleTheme,
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
          ),
        ],
      ),
      body: pages[_tab],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          if (_tab == 0 || _tab == 1) {
            _reserveSpot();
          } else if (_tab == 2) {
            final unpaid = _bookings.where((b) => !b.paid).firstOrNull;
            if (unpaid != null) {
              _payBooking(unpaid);
            } else {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Rien à payer')));
            }
          } else {
            _detectFreeSpots();
          }
        },
        icon: Icon(_tab == 2 ? Icons.payment : _tab == 3 ? Icons.radar : Icons.add),
        label: Text(_tab == 2 ? 'Payer' : _tab == 3 ? 'Scan IoT' : 'Réserver'),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.map_outlined), selectedIcon: Icon(Icons.map), label: 'Carte'),
          NavigationDestination(icon: Icon(Icons.event_seat_outlined), selectedIcon: Icon(Icons.event_seat), label: 'Réserv.'),
          NavigationDestination(icon: Icon(Icons.payment_outlined), selectedIcon: Icon(Icons.payment), label: 'Paiement'),
          NavigationDestination(icon: Icon(Icons.qr_code_2_outlined), selectedIcon: Icon(Icons.qr_code_2), label: 'QR'),
        ],
      ),
    );
  }
}
