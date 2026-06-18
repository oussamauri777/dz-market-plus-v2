import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timeago/timeago.dart' as timeago;

class LocaleProvider extends ChangeNotifier {
  Locale _locale = const Locale('fr');
  static const _prefsKey = 'app_locale';

  Locale get locale => _locale;
  bool get isRtl => _locale.languageCode == 'ar';

  LocaleProvider() {
    _loadSavedLocale();
  }

  Future<void> _loadSavedLocale() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final langCode = prefs.getString(_prefsKey);
      if (langCode != null && ['fr', 'ar'].contains(langCode)) {
        _locale = Locale(langCode);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> setLocale(Locale locale) async {
    if (!['fr', 'ar'].contains(locale.languageCode)) return;
    _locale = locale;
    if (locale.languageCode == 'ar') {
      timeago.setLocaleMessages('ar', timeago.ArMessages());
    } else {
      timeago.setLocaleMessages('fr', timeago.FrMessages());
    }
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefsKey, locale.languageCode);
    } catch (_) {}
  }

  Future<void> toggleLanguage() async {
    final next = _locale.languageCode == 'fr' ? const Locale('ar') : const Locale('fr');
    await setLocale(next);
  }
}
