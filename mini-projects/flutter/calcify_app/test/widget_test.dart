import 'package:flutter_test/flutter_test.dart';
import 'package:calcify_app/main.dart';

void main() {
  testWidgets('Calcify app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const CalcifyApp());
    expect(find.textContaining('Calcify'), findsOneWidget);
  });
}
