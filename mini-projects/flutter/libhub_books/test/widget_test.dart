import 'package:flutter_test/flutter_test.dart';
import 'package:libhub_books/main.dart';

void main() {
  testWidgets('LibHub app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const LibHubApp());
    expect(find.textContaining('LibHub'), findsOneWidget);
  });
}
