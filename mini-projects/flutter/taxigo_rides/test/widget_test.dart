import 'package:flutter_test/flutter_test.dart';
import 'package:taxigo_rides/main.dart';

void main() {
  testWidgets('TaxiGo app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const TaxiGoApp());
    expect(find.textContaining('TaxiGo'), findsOneWidget);
  });
}
