import 'package:flutter_test/flutter_test.dart';
import 'package:unicampus_edu/main.dart';

void main() {
  testWidgets('UniCampus app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const UniCampusApp());
    expect(find.textContaining('UniCampus'), findsOneWidget);
  });
}
