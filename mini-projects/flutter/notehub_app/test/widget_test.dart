import 'package:flutter_test/flutter_test.dart';
import 'package:notehub_app/main.dart';

void main() {
  testWidgets('NoteHub app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const NoteHubApp());
    expect(find.textContaining('NoteHub'), findsOneWidget);
  });
}
