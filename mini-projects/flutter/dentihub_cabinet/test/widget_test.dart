import 'package:flutter_test/flutter_test.dart';
import 'package:dentihub_cabinet/main.dart';

void main() {
  testWidgets('DentiHub app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const DentiHubApp());
    expect(find.textContaining('DentiHub'), findsOneWidget);
  });
}
