import 'package:flutter_test/flutter_test.dart';
import 'package:stylehub_fashion/main.dart';

void main() {
  testWidgets('StyleHub app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const StyleHubApp());
    expect(find.textContaining('StyleHub'), findsOneWidget);
  });
}
