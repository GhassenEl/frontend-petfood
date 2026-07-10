import 'package:flutter_test/flutter_test.dart';
import 'package:kidscircle_nursery/main.dart';

void main() {
  testWidgets('KidsCircle app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const KidsCircleApp());
    expect(find.textContaining('KidsCircle'), findsOneWidget);
  });
}
