import 'package:flutter_test/flutter_test.dart';
import 'package:salattime_app/main.dart';

void main() {
  testWidgets('SalatTime affiche le titre', (tester) async {
    await tester.pumpWidget(const SalatTimeApp());
    expect(find.text('SalatTime'), findsOneWidget);
    expect(find.text('Horaires de prière'), findsOneWidget);
  });
}
