import 'package:flutter_test/flutter_test.dart';
import 'package:hrhub_platform/main.dart';

void main() {
  testWidgets('HRHub app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const HRHubApp());
    expect(find.textContaining('HRHub'), findsOneWidget);
  });
}
