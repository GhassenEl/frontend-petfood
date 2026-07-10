import 'package:flutter_test/flutter_test.dart';
import 'package:aihub_assistant/main.dart';

void main() {
  testWidgets('AIHub app loads', (tester) async {
    await tester.pumpWidget(const AiHubApp());
    expect(find.text('🤖 AIHub'), findsOneWidget);
  });
}
