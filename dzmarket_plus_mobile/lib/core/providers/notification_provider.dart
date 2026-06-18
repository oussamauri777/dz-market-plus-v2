import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';
import '../models/notification_model.dart';

class NotificationProvider extends ChangeNotifier {
  List<AppNotification> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;
  bool _hasMore = true;
  int _page = 1;
  Timer? _pollTimer;

  List<AppNotification> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;
  bool get hasMore => _hasMore;

  Future<Map<String, String>> _authHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  void startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 15), (_) => fetchUnreadCount());
  }

  void stopPolling() {
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  Future<void> fetchUnreadCount() async {
    try {
      final headers = await _authHeaders();
      final token = headers['Authorization']?.replaceFirst('Bearer ', '');
      if (token == null) return;

      final response = await http.get(
        Uri.parse('${AppConfig.baseUrl}/notifications/unread-count'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _unreadCount = data['count'] ?? 0;
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> fetchNotifications({bool refresh = false}) async {
    if (_isLoading) return;
    if (!refresh && !_hasMore) return;

    _isLoading = true;
    notifyListeners();

    try {
      final headers = await _authHeaders();
      final token = headers['Authorization']?.replaceFirst('Bearer ', '');
      if (token == null) {
        _isLoading = false;
        notifyListeners();
        return;
      }

      final page = refresh ? 1 : _page;
      final response = await http.get(
        Uri.parse('${AppConfig.baseUrl}/notifications?page=$page&limit=20'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final list = (data['notifications'] as List)
            .map((j) => AppNotification.fromJson(j))
            .toList();

        if (refresh) {
          _notifications = list;
          _page = 2;
        } else {
          _notifications.addAll(list);
          _page++;
        }
        _hasMore = list.length >= 20;
        _unreadCount = data['unreadCount'] ?? 0;
      }
    } catch (_) {} finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAsRead(List<String> ids) async {
    try {
      final headers = await _authHeaders();
      final token = headers['Authorization']?.replaceFirst('Bearer ', '');
      if (token == null) return;

      await http.patch(
        Uri.parse('${AppConfig.baseUrl}/notifications/read'),
        headers: headers,
        body: json.encode({'notificationIds': ids}),
      );

      for (final notification in _notifications) {
        if (ids.contains(notification.id)) {
          final idx = _notifications.indexOf(notification);
          _notifications[idx] = AppNotification(
            id: notification.id,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            data: notification.data,
            read: true,
            createdAt: notification.createdAt,
          );
        }
      }
      _unreadCount = _notifications.where((n) => !n.read).length;
      notifyListeners();
    } catch (_) {}
  }

  Future<void> markAllAsRead() async {
    try {
      final headers = await _authHeaders();
      final token = headers['Authorization']?.replaceFirst('Bearer ', '');
      if (token == null) return;

      await http.patch(
        Uri.parse('${AppConfig.baseUrl}/notifications/read'),
        headers: headers,
        body: json.encode({'all': true}),
      );

      _notifications = _notifications.map((n) => AppNotification(
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        data: n.data,
        read: true,
        createdAt: n.createdAt,
      )).toList();
      _unreadCount = 0;
      notifyListeners();
    } catch (_) {}
  }

  void reset() {
    stopPolling();
    _notifications = [];
    _unreadCount = 0;
    _isLoading = false;
    _hasMore = true;
    _page = 1;
    notifyListeners();
  }
}
