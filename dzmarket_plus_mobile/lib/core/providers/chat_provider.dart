import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pusher_channels_flutter/pusher_channels_flutter.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart' hide Message;
import '../config/app_config.dart';
import '../models/conversation.dart';
import '../models/message.dart';
import '../services/api_service.dart';

class ChatProvider extends ChangeNotifier {
  final PusherChannelsFlutter _pusher = PusherChannelsFlutter.getInstance();
  List<Conversation> _conversations = [];
  final Map<String, List<Message>> _messages = {};
  String? _activeConversationId;
  bool _isLoadingConversations = false;
  bool _pusherConnected = false;
  final Map<String, bool> _typingStatus = {};
  FlutterLocalNotificationsPlugin? _notifications;
  String _currentUserId = '';
  String _currentUserName = '';
  final Set<String> _pendingTempIds = {};
  VoidCallback? onNewNotification;
  Timer? _pollTimer;

  List<Conversation> get conversations => _conversations;
  List<Message> get activeMessages => _activeConversationId != null ? (_messages[_activeConversationId!] ?? []) : [];
  String? get activeConversationId => _activeConversationId;
  bool get isLoadingConversations => _isLoadingConversations;

  int get totalUnreadCount =>
      _conversations.fold(0, (sum, c) => sum + c.unreadCount);

  bool isPartnerTyping(String conversationId) => _typingStatus[conversationId] ?? false;

  void initNotifications(FlutterLocalNotificationsPlugin plugin) {
    _notifications = plugin;
  }

  Future<Map<String, String>> _authHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  void _replaceTempMessage(String conversationId, String tempId, Message realMessage) {
    final idx = _messages[conversationId]?.indexWhere((m) => m.id == tempId);
    if (idx != null && idx != -1) {
      _messages[conversationId]![idx] = realMessage;
    }
    _pendingTempIds.remove(tempId);
    notifyListeners();
  }

  void startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 30), (_) => fetchConversations());
  }

  void stopPolling() {
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  Future<void> init(String userId, {String userName = ''}) async {
    _currentUserId = userId;
    _currentUserName = userName;
    startPolling();
    await fetchConversations();
    if (_pusherConnected) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      await _pusher.init(
        apiKey: AppConfig.pusherKey,
        cluster: AppConfig.pusherCluster,
        useTLS: true,
        onAuthorizer: (channelName, socketId, options) async {
          final p = await SharedPreferences.getInstance();
          final t = p.getString('auth_token');
          final client = http.Client();
          try {
            final response = await client.post(
              Uri.parse('${AppConfig.baseUrl}/pusher/auth'),
              headers: {
                'Authorization': 'Bearer ${t ?? ''}',
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: {
                'socket_id': socketId,
                'channel_name': channelName,
              },
            );
            if (response.statusCode == 200) {
              return json.decode(response.body);
            }
            debugPrint("Pusher auth failed: ${response.statusCode}");
            return null;
          } catch (e) {
            debugPrint("Pusher auth error: $e");
            return null;
          } finally {
            client.close();
          }
        },
        onEvent: _onPusherEvent,
        onError: (message, code, error) {
          debugPrint("Pusher error: $message (code: $code)");
        },
        onConnectionStateChange: (currentState, previousState) {
          if (currentState == 'CONNECTED') {
            _pusherConnected = true;
          } else if (currentState == 'DISCONNECTED') {
            _pusherConnected = false;
          }
        },
      );
      await _pusher.connect();
      await _pusher.subscribe(channelName: 'private-user-$userId');
      _pusherConnected = true;
    } catch (e) {
      debugPrint("Pusher Init Error: $e");
    }
  }

  void _onPusherEvent(PusherEvent event) {
    if (event.eventName == 'receive_message') {
      final data = json.decode(event.data);
      final message = Message.fromJson(data);
      final isActive = message.conversationId == _activeConversationId;
      if (_messages.containsKey(message.conversationId)) {
        String? tempIdToReplace;
        for (final tempId in _pendingTempIds) {
          if (_messages[message.conversationId]!.any((m) => m.id == tempId)) {
            tempIdToReplace = tempId;
            break;
          }
        }
        if (tempIdToReplace != null) {
          _replaceTempMessage(message.conversationId, tempIdToReplace, message);
        } else {
          final exists = _messages[message.conversationId]!.any((m) => m.id == message.id);
          if (!exists) {
            _messages[message.conversationId]!.add(message);
            notifyListeners();
          }
        }
      } else {
        fetchConversations();
      }
      if (!isActive && !_pendingTempIds.any((t) => _messages[message.conversationId]?.any((m) => m.id == t) ?? false)) {
        final idx = _conversations.indexWhere((c) => c.id == message.conversationId);
        if (idx != -1) {
          final old = _conversations[idx];
          _conversations[idx] = Conversation(
            id: old.id,
            participants: old.participants,
            lastMessage: message.content.length > 100 ? '${message.content.substring(0, 100)}...' : message.content,
            lastMessageAt: message.createdAt,
            adId: old.adId,
            adTitle: old.adTitle,
            adImage: old.adImage,
            unreadCount: old.unreadCount + 1,
          );
          notifyListeners();
        }
        onNewNotification?.call();
      }
      if (isActive) {
        markAsRead(message.conversationId);
      }
      _showNotification(message);
    } else if (event.eventName == 'client-typing') {
      final data = json.decode(event.data);
      final conversationId = data['conversationId'] as String?;
      final isTyping = data['isTyping'] as bool? ?? false;
      if (conversationId != null) {
        _typingStatus[conversationId] = isTyping;
        if (_activeConversationId == conversationId) {
          notifyListeners();
        }
      }
    } else if (event.eventName == 'message_deleted') {
      final messageId = json.decode(event.data) as String;
      if (_activeConversationId != null) {
        _messages[_activeConversationId!]?.removeWhere((m) => m.id == messageId);
        notifyListeners();
      }
    } else if (event.eventName == 'messages_read') {
      final data = json.decode(event.data);
      final messageIds = List<String>.from(data['messageIds'] ?? []);
      final conversationId = data['conversationId'] as String?;
      if (conversationId != null && _messages.containsKey(conversationId)) {
        for (final msg in _messages[conversationId]!) {
          if (messageIds.contains(msg.id)) {
            final idx = _messages[conversationId]!.indexOf(msg);
            if (idx != -1) {
              _messages[conversationId]![idx] = Message(
                id: msg.id,
                conversationId: msg.conversationId,
                senderId: msg.senderId,
                senderName: msg.senderName,
                content: msg.content,
                type: msg.type,
                fileUrl: msg.fileUrl,
                fileName: msg.fileName,
                read: true,
                createdAt: msg.createdAt,
              );
            }
          }
        }
        notifyListeners();
      }
    }
  }

  void _showNotification(Message message) {
    if (_notifications == null) return;
    if (message.conversationId == _activeConversationId) return;

    final partnerName = message.senderName;
    final preview = message.type == 'image' ? '📷 Image'
        : message.type == 'audio' ? '🎤 Message vocal'
        : message.content;

    _notifications!.show(
      id: message.conversationId.hashCode,
      title: partnerName,
      body: preview,
      notificationDetails: const NotificationDetails(
        android: AndroidNotificationDetails(
          'messages_channel',
          'Messages',
          channelDescription: 'Notifications des messages',
          importance: Importance.high,
          priority: Priority.high,
          showWhen: true,
        ),
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: message.conversationId,
    );
  }

  Future<void> sendTypingIndicator(String conversationId, bool isTyping) async {
    try {
      await _pusher.trigger(
        PusherEvent(
          eventName: 'client-typing',
          data: json.encode({
            'conversationId': conversationId,
            'isTyping': isTyping,
          }),
          channelName: 'private-$conversationId',
        ),
      );
    } catch (e) {
      debugPrint("Send typing error: $e");
    }
  }

  Future<void> fetchConversations() async {
    _isLoadingConversations = true;
    notifyListeners();

    try {
      final headers = await _authHeaders();
      final token = headers['Authorization']?.replaceFirst('Bearer ', '');
      if (token == null) {
        _isLoadingConversations = false;
        notifyListeners();
        return;
      }

      final response = await http.get(
        Uri.parse('${AppConfig.baseUrl}/conversations'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _conversations = data.map((json) => Conversation.fromJson(json)).toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint("Fetch Conversations Error: $e");
    } finally {
      _isLoadingConversations = false;
      notifyListeners();
    }
  }

  Future<void> fetchMessages(String conversationId) async {
    _activeConversationId = conversationId;
    try {
      final headers = await _authHeaders();

      final response = await http.get(
        Uri.parse('${AppConfig.baseUrl}/messages?conversationId=$conversationId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _messages[conversationId] = data.map((json) => Message.fromJson(json)).toList();

      try {
          await _pusher.subscribe(channelName: 'private-$conversationId');
        } catch (_) {}

        await markAsRead(conversationId);
        notifyListeners();
      }
    } catch (e) {
      debugPrint("Fetch Messages Error: $e");
    }
  }

  String _genTempId() => 'temp_${DateTime.now().millisecondsSinceEpoch}';

  void _removeTemp(String conversationId, String tempId) {
    _messages[conversationId]?.removeWhere((m) => m.id == tempId);
    _pendingTempIds.remove(tempId);
    notifyListeners();
  }

  void _bumpConversation(String conversationId, String lastMessage) {
    final idx = _conversations.indexWhere((c) => c.id == conversationId);
    if (idx != -1) {
      final old = _conversations[idx];
      _conversations[idx] = Conversation(
        id: old.id,
        participants: old.participants,
        lastMessage: lastMessage.length > 100 ? '${lastMessage.substring(0, 100)}...' : lastMessage,
        lastMessageAt: DateTime.now(),
        adId: old.adId,
        adTitle: old.adTitle,
        adImage: old.adImage,
        unreadCount: old.unreadCount,
      );
      final moved = _conversations.removeAt(idx);
      _conversations.insert(0, moved);
      notifyListeners();
    }
  }

  Future<void> sendMessage(String conversationId, String content) async {
    final tempId = _genTempId();
    final optimistic = Message(
      id: tempId,
      conversationId: conversationId,
      senderId: _currentUserId,
      senderName: _currentUserName,
      content: content,
      type: 'text',
      createdAt: DateTime.now(),
    );
    _messages.putIfAbsent(conversationId, () => []);
    _messages[conversationId]!.add(optimistic);
    _pendingTempIds.add(tempId);
    _typingStatus[conversationId] = false;
    _bumpConversation(conversationId, content);
    notifyListeners();

    try {
      final headers = await _authHeaders();
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/messages'),
        headers: headers,
        body: json.encode({
          'conversationId': conversationId,
          'content': content,
          'type': 'text',
        }),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        _replaceTempMessage(conversationId, tempId, Message.fromJson(json.decode(response.body)));
      } else {
        _removeTemp(conversationId, tempId);
      }
    } catch (e) {
      _removeTemp(conversationId, tempId);
      debugPrint("Send Message Error: $e");
    }
  }

  Future<void> sendImageMessage(String conversationId, String imageUrl) async {
    final tempId = _genTempId();
    final optimistic = Message(
      id: tempId,
      conversationId: conversationId,
      senderId: _currentUserId,
      senderName: _currentUserName,
      content: '📷 Image',
      type: 'image',
      fileUrl: imageUrl,
      createdAt: DateTime.now(),
    );
    _messages.putIfAbsent(conversationId, () => []);
    _messages[conversationId]!.add(optimistic);
    _pendingTempIds.add(tempId);
    _bumpConversation(conversationId, '📷 Image');
    notifyListeners();

    try {
      final headers = await _authHeaders();
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/messages'),
        headers: headers,
        body: json.encode({
          'conversationId': conversationId,
          'type': 'image',
          'fileUrl': imageUrl,
        }),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        _replaceTempMessage(conversationId, tempId, Message.fromJson(json.decode(response.body)));
      } else {
        _removeTemp(conversationId, tempId);
      }
    } catch (e) {
      _removeTemp(conversationId, tempId);
      debugPrint("Send Image Message Error: $e");
    }
  }

  Future<void> sendAudioMessage(String conversationId, String audioUrl) async {
    final tempId = _genTempId();
    final optimistic = Message(
      id: tempId,
      conversationId: conversationId,
      senderId: _currentUserId,
      senderName: _currentUserName,
      content: '🎤 Voice Message',
      type: 'audio',
      fileUrl: audioUrl,
      createdAt: DateTime.now(),
    );
    _messages.putIfAbsent(conversationId, () => []);
    _messages[conversationId]!.add(optimistic);
    _pendingTempIds.add(tempId);
    _bumpConversation(conversationId, '🎤 Voice Message');
    notifyListeners();

    try {
      final headers = await _authHeaders();
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/messages'),
        headers: headers,
        body: json.encode({
          'conversationId': conversationId,
          'type': 'audio',
          'fileUrl': audioUrl,
        }),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        _replaceTempMessage(conversationId, tempId, Message.fromJson(json.decode(response.body)));
      } else {
        _removeTemp(conversationId, tempId);
      }
    } catch (e) {
      _removeTemp(conversationId, tempId);
      debugPrint("Send Audio Message Error: $e");
    }
  }

  Future<void> deleteMessage(String messageId) async {
    try {
      await ApiService.deleteMessage(messageId);
      if (_activeConversationId != null) {
        _messages[_activeConversationId!]?.removeWhere((m) => m.id == messageId);
        notifyListeners();
      }
    } catch (e) {
      debugPrint("Delete Message Error: $e");
    }
  }

  Future<String> getOrCreateConversation(String adId, String sellerId) async {
    try {
      final headers = await _authHeaders();

      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/conversations'),
        headers: headers,
        body: json.encode({
          'adId': adId,
          'sellerId': sellerId,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        await fetchConversations();
        return data['_id'];
      } else {
        throw Exception('Failed to create or get conversation: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint("Get/Create Conversation Error: $e");
      rethrow;
    }
  }

  Future<void> markAsRead(String conversationId) async {
    try {
      final headers = await _authHeaders();

      final response = await http.patch(
        Uri.parse('${AppConfig.baseUrl}/messages/mark-read'),
        headers: headers,
        body: json.encode({
          'conversationId': conversationId,
        }),
      );

      if (response.statusCode == 200) {
        final index = _conversations.indexWhere((c) => c.id == conversationId);
        if (index != -1) {
          final old = _conversations[index];
          _conversations[index] = Conversation(
            id: old.id,
            participants: old.participants,
            lastMessage: old.lastMessage,
            lastMessageAt: old.lastMessageAt,
            adId: old.adId,
            adTitle: old.adTitle,
            adImage: old.adImage,
            unreadCount: 0,
          );
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint("Mark as read error: $e");
    }
  }

  void closeActiveConversation() {
    if (_activeConversationId != null) {
      _typingStatus.remove(_activeConversationId);
      _pusher.unsubscribe(channelName: 'private-$_activeConversationId');
      _activeConversationId = null;
      notifyListeners();
    }
  }

  void reset() {
    stopPolling();
    _conversations = [];
    _messages.clear();
    _activeConversationId = null;
    _typingStatus.clear();
    _pusherConnected = false;
    _currentUserId = '';
    _currentUserName = '';
    _pendingTempIds.clear();
    if (_pusher.connectionState == 'CONNECTED') {
      _pusher.disconnect();
    }
    notifyListeners();
  }
}