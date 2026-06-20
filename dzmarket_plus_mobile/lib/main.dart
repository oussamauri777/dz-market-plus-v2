import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:app_links/app_links.dart';
import 'package:go_router/go_router.dart';
import 'core/router/app_router.dart';
import 'core/services/push_notification_service.dart';
import 'core/theme/app_theme.dart';
import 'core/providers/ad_provider.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/chat_provider.dart';
import 'core/providers/notification_provider.dart';
import 'core/providers/theme_provider.dart';
import 'core/config/app_config.dart';
import 'core/localization/app_localizations.dart';
import 'core/localization/locale_provider.dart';

final FlutterLocalNotificationsPlugin notificationsPlugin = FlutterLocalNotificationsPlugin();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp();
  } catch (_) {}

  final apiHost = const String.fromEnvironment('API_HOST');
  if (apiHost.isNotEmpty) {
    AppConfig.setApiHost(apiHost);
  }

  const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
  const iosSettings = DarwinInitializationSettings(
    requestAlertPermission: true,
    requestBadgePermission: true,
    requestSoundPermission: true,
  );
  const initSettings = InitializationSettings(android: androidSettings, iOS: iosSettings);
  await notificationsPlugin.initialize(
    settings: initSettings,
    onDidReceiveNotificationResponse: (response) {
      final payload = response.payload;
      if (payload == null || payload.isEmpty) return;
      try {
        final data = json.decode(payload);
        final convId = data['conversationId'] as String?;
        if (convId != null) navigateToConversation(convId);
      } catch (_) {
        navigateToConversation(payload);
      }
    },
  );

  final launchDetails = await notificationsPlugin.getNotificationAppLaunchDetails();
  if (launchDetails?.didNotificationLaunchApp ?? false) {
    final payload = launchDetails!.notificationResponse?.payload;
    if (payload != null && payload.isNotEmpty) {
      try {
        final data = json.decode(payload);
        final convId = data['conversationId'] as String?;
        if (convId != null) navigateToConversation(convId);
      } catch (_) {
        navigateToConversation(payload);
      }
    }
  }

  final prefs = await SharedPreferences.getInstance();
  onboardingComplete = prefs.getBool('onboarding_complete') ?? (prefs.getString('auth_token') != null);

  timeago.setLocaleMessages('fr', timeago.FrMessages());
  timeago.setLocaleMessages('ar', timeago.ArMessages());
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AdProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) {
          final cp = ChatProvider();
          cp.initNotifications(notificationsPlugin);
          return cp;
        }),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ChangeNotifierProvider(create: (_) => LocaleProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: const DzMarketPlusApp(),
    ),
  );
}

class DzMarketPlusApp extends StatefulWidget {
  const DzMarketPlusApp({super.key});
  @override
  State<DzMarketPlusApp> createState() => _DzMarketPlusAppState();
}

class _DzMarketPlusAppState extends State<DzMarketPlusApp> {
  StreamSubscription<Uri>? _deepLinkSub;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      PushNotificationService.init(notificationsPlugin).catchError((_) {});
      _initDeepLinks();
    });
  }

  @override
  void dispose() {
    _deepLinkSub?.cancel();
    super.dispose();
  }

  Future<void> _initDeepLinks() async {
    final appLinks = AppLinks();

    try {
      final initialUri = await appLinks.getInitialLink();
      if (initialUri != null) {
        _handleDeepLink(initialUri);
      }
    } catch (_) {}

    _deepLinkSub = appLinks.uriLinkStream.listen(_handleDeepLink);
  }

  void _handleDeepLink(Uri uri) {
    if (uri.scheme == 'dzmarketplus' && uri.host == 'reset-password') {
      final token = uri.queryParameters['token'];
      if (token != null && token.isNotEmpty) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          appRouter.go('/reset-password?token=$token');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<LocaleProvider, ThemeProvider>(
      builder: (ctx, localeProvider, themeProvider, _) {
        return MaterialApp.router(
          title: 'DZ Market Plus',
          debugShowCheckedModeBanner: false,
          routerConfig: appRouter,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: themeProvider.isDark ? ThemeMode.dark : ThemeMode.light,
          locale: localeProvider.locale,
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          localeResolutionCallback: (locale, supportedLocales) {
            if (locale != null) {
              for (final supported in supportedLocales) {
                if (supported.languageCode == locale.languageCode) {
                  return supported;
                }
              }
            }
            return AppLocalizations.fallbackLocale;
          },
        );
      },
    );
  }
}