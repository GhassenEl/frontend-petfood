import 'package:flutter_test/flutter_test.dart';
import 'package:stayhub_hotels/main.dart';

void main() {
  testWidgets('StayHub app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const StayHubApp());
    expect(find.textContaining('StayHub'), findsOneWidget);
  });
}
