import 'package:flutter_test/flutter_test.dart';
import 'package:trailhub_excursions/main.dart';

void main() {
  testWidgets('TrailHub app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const TrailHubApp());
    expect(find.textContaining('TrailHub'), findsOneWidget);
  });
}
