import 'package:flutter_test/flutter_test.dart';
import 'package:marathub_app/main.dart';
import 'package:marathub_app/services/app_store.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('MaratHub affiche le titre', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final store = await AppStore.create();
    await tester.pumpWidget(MaratHubApp(store: store));
    await tester.pumpAndSettle();
    expect(find.text('MaratHub'), findsOneWidget);
  });
}
