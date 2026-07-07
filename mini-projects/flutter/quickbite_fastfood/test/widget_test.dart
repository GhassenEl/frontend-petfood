import 'package:flutter_test/flutter_test.dart';
import 'package:quickbite_fastfood/main.dart';

void main() {
  testWidgets('QuickBite app loads', (tester) async {
    await tester.pumpWidget(const QuickBiteApp());
    expect(find.textContaining('QuickBite'), findsOneWidget);
  });
}
