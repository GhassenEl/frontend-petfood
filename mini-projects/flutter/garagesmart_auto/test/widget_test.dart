import 'package:flutter_test/flutter_test.dart';
import 'package:garagesmart_auto/main.dart';

void main() {
  testWidgets('GarageSmart app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const GarageSmartApp());
    expect(find.textContaining('GarageSmart'), findsOneWidget);
  });
}
