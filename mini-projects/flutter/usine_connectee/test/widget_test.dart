import 'package:flutter_test/flutter_test.dart';
import 'package:usine_connectee/main.dart';

void main() {
  testWidgets('FactoryLink app loads', (tester) async {
    await tester.pumpWidget(const FactoryLinkApp());
    expect(find.text('🏭 FactoryLink'), findsOneWidget);
  });
}
