import 'package:flutter_test/flutter_test.dart';
import 'package:parksmart_parking/main.dart';

void main() {
  testWidgets('ParkSmart app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const ParkSmartApp());
    expect(find.textContaining('ParkSmart'), findsOneWidget);
  });
}
