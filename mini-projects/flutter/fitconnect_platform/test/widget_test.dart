import 'package:flutter_test/flutter_test.dart';
import 'package:fitconnect_platform/main.dart';

void main() {
  testWidgets('FitConnect app loads', (tester) async {
    await tester.pumpWidget(const FitConnectApp());
    expect(find.textContaining('Fit'), findsWidgets);
  });
}
