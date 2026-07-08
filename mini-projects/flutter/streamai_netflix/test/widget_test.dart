import 'package:flutter_test/flutter_test.dart';
import 'package:streamai_netflix/main.dart';

void main() {
  testWidgets('StreamAI app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const StreamAIApp());
    expect(find.textContaining('StreamAI'), findsOneWidget);
  });
}
