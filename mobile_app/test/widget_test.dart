import 'package:flutter_test/flutter_test.dart';
import 'package:petfoodtn_mobile/main.dart';

void main() {
  testWidgets('App loads', (WidgetTester tester) async {
    await tester.pumpWidget(const PetfoodTnApp());
    await tester.pump();
    expect(find.text('PetfoodTN'), findsOneWidget);
  });
}
