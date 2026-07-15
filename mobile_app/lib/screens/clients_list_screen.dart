import 'package:flutter/material.dart';
import '../models/client_account.dart';
import '../services/auth_service.dart';
import '../services/client_directory_service.dart';
import 'login_screen.dart';
import 'client_feeding_screen.dart';
import 'home_shell.dart';

class ClientsListScreen extends StatefulWidget {
  const ClientsListScreen({super.key, required this.auth});

  final AuthService auth;

  @override
  State<ClientsListScreen> createState() => _ClientsListScreenState();
}

class _ClientsListScreenState extends State<ClientsListScreen> {
  late final ClientDirectoryService _service = ClientDirectoryService(widget.auth.api);
  List<ClientAccount> _clients = [];
  bool _loading = true;
  String? _error;
  String _search = '';

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
      final clients = await _service.fetchClients(currentUser: widget.auth.user);
      if (mounted) setState(() => _clients = clients);
    } catch (e) {
      if (mounted) setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _logout() async {
    await widget.auth.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => LoginScreen(auth: widget.auth)),
      (_) => false,
    );
  }

  bool _isOwnClient(ClientAccount client) {
    final uid = (widget.auth.user?['id'] ?? widget.auth.user?['_id'] ?? '').toString();
    return uid.isNotEmpty && client.id == uid;
  }

  List<ClientAccount> get _filtered {
    if (_search.trim().isEmpty) return _clients;
    final q = _search.toLowerCase();
    return _clients
        .where((c) =>
            c.name.toLowerCase().contains(q) ||
            c.email.toLowerCase().contains(q) ||
            (c.region?.toLowerCase().contains(q) ?? false))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final role = widget.auth.user?['role']?.toString() ?? 'client';
    final isStaff = role == 'admin' || role == 'vendor' || role == 'vet';

    return Scaffold(
      appBar: AppBar(
        title: Text(isStaff ? 'Clients PetfoodTN' : 'Mon espace client'),
        backgroundColor: const Color(0xFFD1FAE5),
        actions: [
          IconButton(
            icon: const Icon(Icons.dashboard_outlined),
            tooltip: 'Application complète',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => HomeShell(auth: widget.auth)),
            ),
          ),
          IconButton(icon: const Icon(Icons.logout), tooltip: 'Déconnexion', onPressed: _logout),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Rechercher un client…',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
                fillColor: Colors.white,
              ),
              onChanged: (v) => setState(() => _search = v),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                Icon(Icons.info_outline, size: 16, color: Colors.grey.shade600),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    isStaff
                        ? 'Sélectionnez un client pour voir la distribution par animal.'
                        : 'Consultez la distribution de nourriture de vos animaux.',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: _filtered.isEmpty
                            ? ListView(
                                children: const [
                                  SizedBox(height: 80),
                                  Center(child: Text('Aucun client trouvé')),
                                ],
                              )
                            : ListView.builder(
                                padding: const EdgeInsets.all(16),
                                itemCount: _filtered.length,
                                itemBuilder: (context, index) {
                                  final client = _filtered[index];
                                  return _ClientCard(
                                    client: client,
                                    isOwn: _isOwnClient(client),
                                    onTap: () => Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => ClientFeedingScreen(
                                          auth: widget.auth,
                                          client: client,
                                          isOwnAccount: _isOwnClient(client),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                      ),
          ),
        ],
      ),
    );
  }
}

class _ClientCard extends StatelessWidget {
  const _ClientCard({required this.client, required this.isOwn, required this.onTap});

  final ClientAccount client;
  final bool isOwn;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: const Color(0xFFD1FAE5),
                child: Text(
                  client.name.isNotEmpty ? client.name[0].toUpperCase() : '?',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF065F46)),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            client.name,
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                          ),
                        ),
                        if (isOwn)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: const Text('Vous', style: TextStyle(fontSize: 10, color: Color(0xFF059669))),
                          ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(client.email, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
                    if (client.region != null && client.region!.isNotEmpty)
                      Text(client.region!, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
            ],
          ),
        ),
      ),
    );
  }
}
