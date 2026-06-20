import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../services/api_service.dart';

class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._();
  factory PushNotificationService() => _instance;
  PushNotificationService._();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  FlutterLocalNotificationsPlugin? _localNotifs;

  static Future<void> init(FlutterLocalNotificationsPlugin plugin) async {
    _instance._localNotifs = plugin;
    await _instance._setup();
  }

  Future<void> _setup() async {
    final notiSettings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (notiSettings.authorizationStatus == AuthorizationStatus.denied) {
      return;
    }

    // Create notification channels
    const androidChannel = AndroidNotificationChannel(
      'messages_channel',
      'Messages',
      description: 'New message notifications',
      importance: Importance.high,
      playSound: true,
    );
    const notifChannel = AndroidNotificationChannel(
      'notifications_channel',
      'Notifications',
      description: 'General notifications',
      importance: Importance.high,
      playSound: true,
    );
    await _localNotifs
        ?.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidChannel);
    await _localNotifs
        ?.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(notifChannel);

    // Get FCM token
    final token = await _messaging.getToken();
    if (token != null) {
      await _registerToken(token);
    }

    // Listen for token refresh
    _messaging.onTokenRefresh.listen(_registerToken);

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle background messages (app opened from background)
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      _handleNotificationTap(json.encode(message.data));
    });

    // Handle terminated state (app opened from killed)
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(json.encode(initialMessage.data));
    }
  }

  Future<void> _registerToken(String token) async {
    try {
      final headers = await ApiService.getAuthHeaders();
      await http.post(
        Uri.parse('${AppConfig.baseUrl}/users/device-tokens'),
        headers: {...headers, 'Content-Type': 'application/json'},
        body: json.encode({'token': token}),
      );
    } catch (e) {
      // Silently fail – will retry on next app launch
    }
  }

  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    final title = message.notification?.title ?? '';
    final body = message.notification?.body ?? '';
    final data = message.data;

    final androidDetails = AndroidNotificationDetails(
      data['type'] == 'new_message' ? 'messages_channel' : 'notifications_channel',
      data['type'] == 'new_message' ? 'Messages' : 'Notifications',
      importance: Importance.high,
      priority: Priority.high,
      playSound: true,
    );
    final details = NotificationDetails(
      android: androidDetails,
      iOS: const DarwinNotificationDetails(),
    );

    await _localNotifs?.show(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: title,
      body: body,
      notificationDetails: details,
      payload: json.encode(data),
    );
  }

  static void _handleNotificationTap(String? payload) {
    // Navigation handled by the callback registered in main.dart
  }
}
