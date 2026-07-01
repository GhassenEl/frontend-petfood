/// Formatage de dates sans dépendance au locale intl (évite LocaleDataException).
class DateFormatUtils {
  static const _frMonths = [
    'janv.',
    'févr.',
    'mars',
    'avr.',
    'mai',
    'juin',
    'juil.',
    'août',
    'sept.',
    'oct.',
    'nov.',
    'déc.',
  ];

  static String formatDateLongFr(DateTime d) {
    final day = d.day.toString().padLeft(2, '0');
    return '$day ${_frMonths[d.month - 1]} ${d.year}';
  }

  static String formatDateTimeShort(DateTime d) {
    final day = d.day.toString().padLeft(2, '0');
    final month = d.month.toString().padLeft(2, '0');
    final hour = d.hour.toString().padLeft(2, '0');
    final min = d.minute.toString().padLeft(2, '0');
    return '$day/$month $hour:$min';
  }
}
