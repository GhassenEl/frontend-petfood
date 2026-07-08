import 'package:flutter_test/flutter_test.dart';
import 'package:wildzoo_animals/main.dart';

void main() {
  testWidgets('WildZoo app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const WildZooApp());
    expect(find.textContaining('WildZoo'), findsOneWidget);
  });
}
