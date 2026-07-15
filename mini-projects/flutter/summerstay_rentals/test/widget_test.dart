import 'package:flutter_test/flutter_test.dart';
import 'package:summerstay_rentals/main.dart';

void main() {
  testWidgets('SummerStay app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const SummerStayApp());
    expect(find.textContaining('SummerStay'), findsOneWidget);
  });
}
