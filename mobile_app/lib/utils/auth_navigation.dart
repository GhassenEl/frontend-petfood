import 'package:flutter/material.dart';
import '../screens/client_home_shell.dart';
import '../screens/clients_list_screen.dart';
import '../services/auth_service.dart';

void navigateAfterAuth(BuildContext context, AuthService auth) {
  final role = auth.userRole ?? 'client';
  final isStaff = role == 'admin' || role == 'vendor' || role == 'vet';
  final destination = isStaff
      ? ClientsListScreen(auth: auth)
      : role == 'client'
          ? ClientHomeShell(auth: auth)
          : ClientHomeShell(auth: auth);

  Navigator.of(context).pushAndRemoveUntil(
    MaterialPageRoute(builder: (_) => destination),
    (_) => false,
  );
}
