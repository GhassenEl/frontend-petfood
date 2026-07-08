import 'package:flutter_test/flutter_test.dart';
import 'package:actpharma_smart/main.dart';

void main() {
  testWidgets('ActPharma app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const ActPharmaApp());
    expect(find.textContaining('ActPharma'), findsOneWidget);
  });
}
