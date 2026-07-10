import 'package:flutter_test/flutter_test.dart';
import 'package:carthage_land/main.dart';

void main() {
  testWidgets('Carthage Land app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const CarthageLandApp());
    expect(find.textContaining('Carthage Land'), findsOneWidget);
  });
}
