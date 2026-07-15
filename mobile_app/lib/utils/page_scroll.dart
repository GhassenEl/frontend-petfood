import 'package:flutter/material.dart';

/// Aide au remplissage des listes scrollables (évite les grands espaces vides en bas).
abstract final class PageScroll {
  static const physics = AlwaysScrollableScrollPhysics();

  static EdgeInsets listPadding(
    BuildContext context, {
    bool bottomNav = false,
    double horizontal = 16,
    double top = 16,
    double extra = 8,
  }) {
    final safe = MediaQuery.paddingOf(context).bottom;
    final nav = bottomNav ? kBottomNavigationBarHeight : 0;
    return EdgeInsets.fromLTRB(horizontal, top, horizontal, extra + safe + nav);
  }
}

String formatRelativeTime(DateTime at) {
  final diff = DateTime.now().difference(at);
  if (diff.inMinutes < 1) return 'À l\'instant';
  if (diff.inMinutes < 60) return 'Il y a ${diff.inMinutes} min';
  if (diff.inHours < 24) return 'Il y a ${diff.inHours} h';
  if (diff.inDays < 7) return 'Il y a ${diff.inDays} j';
  return '${at.day.toString().padLeft(2, '0')}/${at.month.toString().padLeft(2, '0')} '
      '${at.hour.toString().padLeft(2, '0')}:${at.minute.toString().padLeft(2, '0')}';
}
