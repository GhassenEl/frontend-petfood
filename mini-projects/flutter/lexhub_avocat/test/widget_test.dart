import 'package:flutter_test/flutter_test.dart';
import 'package:lexhub_avocat/main.dart';

void main() {
  testWidgets('LexHub app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const LexHubApp());
    expect(find.textContaining('LexHub'), findsOneWidget);
  });
}
