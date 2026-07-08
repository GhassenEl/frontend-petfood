import 'package:flutter_test/flutter_test.dart';
import 'package:greenleaf_plants/main.dart';

void main() {
  testWidgets('GreenLeaf app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const GreenLeafApp());
    expect(find.textContaining('GreenLeaf'), findsOneWidget);
  });
}
