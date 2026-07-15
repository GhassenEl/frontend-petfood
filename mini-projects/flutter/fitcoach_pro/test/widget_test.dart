import 'package:flutter_test/flutter_test.dart';
import 'package:fitcoach_pro/main.dart';

void main() {
  testWidgets('FitCoach app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const FitCoachApp());
    expect(find.textContaining('FitCoach'), findsOneWidget);
  });
}
