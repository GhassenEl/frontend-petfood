import 'package:flutter_test/flutter_test.dart';
import 'package:bankflow_app/main.dart';

void main() {
  testWidgets('BankFlow app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const BankFlowApp());
    expect(find.textContaining('BankFlow'), findsOneWidget);
  });
}
