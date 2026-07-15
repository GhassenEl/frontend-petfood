import 'package:flutter_test/flutter_test.dart';
import 'package:matchup_sports/main.dart';

void main() {
  testWidgets('MatchUp app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const MatchUpApp());
    expect(find.textContaining('MatchUp'), findsOneWidget);
  });
}
