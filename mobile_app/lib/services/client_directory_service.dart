import '../models/client_account.dart';
import 'api_client.dart';

class ClientDirectoryService {
  ClientDirectoryService(this.api);

  final ApiClient api;

  Future<List<ClientAccount>> fetchClients({Map<String, dynamic>? currentUser}) async {
    final role = currentUser?['role']?.toString() ?? 'client';
    final userId = (currentUser?['id'] ?? currentUser?['_id'] ?? '').toString();

    if (role == 'client' && userId.isNotEmpty) {
      return [
        ClientAccount(
          id: userId,
          name: currentUser?['name']?.toString() ?? 'Mon compte',
          email: currentUser?['email']?.toString() ?? '',
          phone: currentUser?['phone']?.toString(),
          region: currentUser?['region']?.toString(),
          petType: currentUser?['petType']?.toString(),
        ),
      ];
    }

    if (!api.hasAuth) return _demoClients();

    try {
      final data = await api.get('/users', query: {'limit': '100'});
      final list = _extractList(data);
      final clients = <ClientAccount>[];
      for (final raw in list) {
        if (raw is! Map) continue;
        final map = Map<String, dynamic>.from(raw);
        if (map['role']?.toString() != 'client') continue;
        final account = ClientAccount.fromJson(map);
        if (account.id.isNotEmpty && account.email.isNotEmpty) {
          clients.add(account);
        }
      }
      if (clients.isNotEmpty) return clients;
    } catch (_) {}

    return _demoClients();
  }

  List<dynamic> _extractList(dynamic data) {
    if (data is List) return data;
    if (data is Map) {
      final inner = data['users'] ?? data['value'] ?? data['data'];
      if (inner is List) return inner;
    }
    return [];
  }

  List<ClientAccount> _demoClients() => [
        ClientAccount(id: 'demo-client-1', name: 'Sami Ben Ali', email: 'client@petfood.tn', region: 'La Marsa'),
        ClientAccount(id: 'demo-client-2', name: 'Ines Trabelsi', email: 'ines.trabelsi@email.tn', region: 'Ariana'),
        ClientAccount(id: 'demo-client-3', name: 'Nadia Khalfallah', email: 'nadia.k@email.tn', region: 'Carthage'),
      ];
}
