import 'package:flutter_test/flutter_test.dart';
import 'package:autopilot_ecole/main.dart';

void main() {
  testWidgets('AutoPilot app loads', (tester) async {
    await tester.pumpWidget(const AutoPilotApp());
    expect(find.textContaining('AutoPilot'), findsOneWidget);
  });
}
