class ClientAccount {
  ClientAccount({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.region,
    this.petType,
    this.isActive = true,
  });

  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? region;
  final String? petType;
  final bool isActive;

  factory ClientAccount.fromJson(Map<String, dynamic> json) => ClientAccount(
        id: (json['id'] ?? json['_id'] ?? '').toString(),
        name: json['name']?.toString() ?? 'Client',
        email: json['email']?.toString() ?? '',
        phone: json['phone']?.toString(),
        region: json['region']?.toString(),
        petType: json['petType']?.toString(),
        isActive: json['isActive'] != false,
      );

  factory ClientAccount.fromUser(Map<String, dynamic> user) => ClientAccount(
        id: (user['id'] ?? user['_id'] ?? '').toString(),
        name: user['name']?.toString() ?? 'Client',
        email: user['email']?.toString() ?? '',
        phone: user['phone']?.toString(),
        region: user['region']?.toString(),
        petType: user['petType']?.toString(),
        isActive: user['isActive'] != false,
      );
}
