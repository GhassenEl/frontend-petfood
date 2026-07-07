import 'package:flutter_test/flutter_test.dart';
import 'package:fitclub_gym/main.dart';

void main() {
  testWidgets('FitClub app loads', (tester) async {
    await tester.pumpWidget(const FitClubApp());
    expect(find.text('FitClub'), findsOneWidget);
  });
}
