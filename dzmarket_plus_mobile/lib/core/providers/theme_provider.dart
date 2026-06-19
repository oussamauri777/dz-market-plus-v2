import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeProvider extends ChangeNotifier {
  bool _isDark = false;
  static const _prefsKey = 'dark_mode';

  bool get isDark => _isDark;

  ThemeProvider() {
    _loadSavedTheme();
  }

  Future<void> _loadSavedTheme() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _isDark = prefs.getBool(_prefsKey) ?? false;
      notifyListeners();
    } catch (_) {}
  }

  Future<void> toggleTheme() async {
    _isDark = !_isDark;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_prefsKey, _isDark);
    } catch (_) {}
  }

  Future<void> setDarkMode(bool value) async {
    _isDark = value;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_prefsKey, value);
    } catch (_) {}
  }
}
