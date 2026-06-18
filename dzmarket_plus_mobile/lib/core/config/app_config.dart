import 'package:flutter/foundation.dart';

class AppConfig {
  static String _customApiHost = '';
  static bool _useHttps = false;

  /// Override the default API host (e.g., '192.168.1.42:3000' or 'https://api.domain.com')
  static void setApiHost(String host) {
    if (host.startsWith('https://')) {
      _useHttps = true;
      _customApiHost = host.replaceFirst('https://', '');
    } else if (host.startsWith('http://')) {
      _customApiHost = host.replaceFirst('http://', '');
    } else {
      _customApiHost = host;
    }
  }

  /// Backend API base URL.
  ///
  /// Resolution order:
  /// 1. `_customApiHost` if set via `--dart-define=API_HOST`
  /// 2. `127.0.0.1:3000` for debug/dev (requires ADB reverse on phone)
  ///
  /// For HTTPS servers, use `--dart-define=API_HOST=https://your-server.com`
  static String get baseUrl {
    if (_customApiHost.isNotEmpty) {
      final protocol = _useHttps ? 'https' : 'http';
      return '$protocol://$_customApiHost/api';
    }
    if (kIsWeb) return 'http://127.0.0.1:3000/api';
    return 'http://127.0.0.1:3000/api';
  }

  static const String pusherKey = 'ace489afc06758740e91';
  static const String pusherCluster = 'eu';

  // Google OAuth Web Client ID (from Google Cloud Console)
  static const String googleClientId =
      '850639876917-c8rn55bl528mi4aa5puv5flo9hn1ldck.apps.googleusercontent.com';
}
