import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:spendwise_budget/main.dart';

void main() {
  testWidgets('SpendWise app loads', (WidgetTester tester) async {
    await initializeDateFormatting('fr_FR');
    await tester.pumpWidget(const SpendWiseApp());
    expect(find.textContaining('SpendWise'), findsOneWidget);
  });
}
