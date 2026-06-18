import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:dzmarket_plus_mobile/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const DzMarketPlusApp());
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
