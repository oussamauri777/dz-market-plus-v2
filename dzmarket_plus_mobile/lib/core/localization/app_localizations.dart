import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppLocalizations {
  final Locale locale;
  Map<String, dynamic>? _data;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  static const List<Locale> supportedLocales = [
    Locale('fr'),
    Locale('ar'),
  ];

  static const Locale fallbackLocale = Locale('fr');

  Future<bool> load() async {
    final langCode = locale.languageCode;
    try {
      final jsonStr = await rootBundle.loadString('assets/translations/$langCode.json');
      _data = json.decode(jsonStr) as Map<String, dynamic>;
      return true;
    } catch (_) {
      _data = {};
      return false;
    }
  }

  String t(String key, {List<String>? params}) {
    final keys = key.split('.');
    dynamic value = _data;
    for (final k in keys) {
      if (value is Map) {
        value = value[k];
      } else {
        value = null;
        break;
      }
    }
    if (value is String) {
      if (params != null) {
        for (int i = 0; i < params.length; i++) {
          value = value.replaceAll('{$i}', params[i]);
        }
      }
      return value;
    }
    return key;
  }

  bool get isRtl => locale.languageCode == 'ar';
}

extension AppLocalizationsX on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this);
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['fr', 'ar'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async {
    final localizations = AppLocalizations(locale);
    await localizations.load();
    return localizations;
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
