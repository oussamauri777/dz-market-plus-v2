import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:image_picker/image_picker.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:http/http.dart' as http;
import 'package:emoji_picker_flutter/emoji_picker_flutter.dart' as emoji_picker;
import 'package:record/record.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:path_provider/path_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/providers/chat_provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/app_badge.dart';

class MessagesScreen extends StatefulWidget {
  final String? initialChatPartner;
  final String? initialConversationId;

  const MessagesScreen({
    super.key,
    this.initialChatPartner,
    this.initialConversationId,
  });

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  String? _openChatId;
  String? _openChatName;
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _openChatId = widget.initialConversationId;
    _openChatName = widget.initialChatPartner;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final chat = Provider.of<ChatProvider>(context, listen: false);
      if (auth.currentUser != null) {
        chat.init(auth.currentUser!.id, userName: auth.currentUser!.name).then((_) {
          if (widget.initialConversationId != null) {
            chat.fetchMessages(widget.initialConversationId!);
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_openChatId != null) {
      return _ChatRoom(
        conversationId: _openChatId!,
        partnerName: _openChatName ?? context.l10n.t('Profile.unknownUser'),
        onBack: () {
          Provider.of<ChatProvider>(context, listen: false).closeActiveConversation();
          setState(() {
            _openChatId = null;
            _openChatName = null;
          });
        },
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            decoration: InputDecoration(
                hintText: context.l10n.t('Messages.searchHint'),
                prefixIcon: Icon(Icons.search, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                filled: true,
                fillColor: Theme.of(context).cardColor,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  borderSide: BorderSide(color: Theme.of(context).dividerColor),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  borderSide: BorderSide(color: Theme.of(context).dividerColor),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  borderSide: const BorderSide(color: AppTheme.primaryColor),
                ),
                hintStyle: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
              ),
              style: const TextStyle(fontSize: 14),
              onChanged: (val) => setState(() => _searchQuery = val),
            ),
          ),
          Expanded(
            child: Consumer<ChatProvider>(
              builder: (ctx, chatProvider, _) {
                final conversations = chatProvider.conversations.where((c) {
                  final auth = Provider.of<AuthProvider>(context, listen: false);
                  final partner = c.participants.firstWhere(
                    (p) => p['_id'] != auth.currentUser?.id,
                    orElse: () => {'name': context.l10n.t('Profile.unknownUser')},
                  );
                  final partnerName = (partner['name'] ?? context.l10n.t('Profile.unknownUser')).toString().toLowerCase();
                  final adTitle = (c.adTitle ?? '').toLowerCase();
                  final query = _searchQuery.toLowerCase();
                  return partnerName.contains(query) || adTitle.contains(query);
                }).toList();

                if (conversations.isEmpty) {
                  return EmptyState(
                    icon: Icons.chat_bubble_outline_rounded,
                    title: context.l10n.t('Messages.noMessages'),
                    subtitle: context.l10n.t('Messages.noMessagesDesc'),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => chatProvider.fetchConversations(),
                  child: ListView.separated(
                    itemCount: conversations.length,
                    separatorBuilder: (_, __) => const Divider(height: 1, indent: 72),
                    itemBuilder: (ctx, i) {
                      final c = conversations[i];
                      final auth = Provider.of<AuthProvider>(context, listen: false);
                      final partner = c.participants.firstWhere(
                        (p) => p['_id'] != auth.currentUser?.id,
                        orElse: () => {'name': context.l10n.t('Profile.unknownUser')},
                      );
                      final partnerName = partner['name'] ?? context.l10n.t('Profile.unknownUser');
                      final partnerImage = partner['image'] ?? 'https://ui-avatars.com/api/?name=${Uri.encodeComponent(partnerName)}&background=008069&color=fff';

                      return ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                        leading: CircleAvatar(
                          radius: 26,
                          backgroundImage: NetworkImage(partnerImage),
                          backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                        ),
                        title: Row(
                          children: [
                            Expanded(
                              child: Text(
                                partnerName,
                                style: TextStyle(
                                  fontWeight: c.unreadCount > 0 ? FontWeight.w700 : FontWeight.w600,
                                  fontSize: 15,
                                  color: Theme.of(context).colorScheme.onSurface,
                                ),
                              ),
                            ),
                            Text(
                              c.lastMessageAt != null ? timeago.format(c.lastMessageAt!, locale: context.l10n.locale.languageCode) : '',
                              style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                            ),
                          ],
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (c.adTitle != null && c.adTitle!.isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 4),
                                  child: AppBadge(
                                    label: c.adTitle!,
                                    variant: AppBadgeVariant.primary,
                                    fontSize: 10,
                                  ),
                                ),
                              Text(
                                c.lastMessage ?? context.l10n.t('Messages.newMessage'),
                                style: TextStyle(
                                  fontSize: 13,
                                  color: c.unreadCount > 0 ? Theme.of(context).colorScheme.onSurface : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55),
                                  fontWeight: c.unreadCount > 0 ? FontWeight.w500 : FontWeight.normal,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        trailing: c.unreadCount > 0
                            ? Container(
                                width: 22,
                                height: 22,
                                decoration: const BoxDecoration(
                                  color: AppTheme.redColor,
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Text(
                                    '${c.unreadCount}',
                                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              )
                            : null,
                        onTap: () {
                          chatProvider.fetchMessages(c.id);
                          setState(() {
                            _openChatId = c.id;
                            _openChatName = partnerName;
                          });
                        },
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────
//  Chat Room — WhatsApp-style
// ─────────────────────────────────────────
class _ChatRoom extends StatefulWidget {
  final String conversationId;
  final String partnerName;
  final VoidCallback onBack;

  const _ChatRoom({
    required this.conversationId,
    required this.partnerName,
    required this.onBack,
  });

  @override
  State<_ChatRoom> createState() => _ChatRoomState();
}

class _ChatRoomState extends State<_ChatRoom> with WidgetsBindingObserver {
  final _msgCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _focusNode = FocusNode();
  bool _showEmoji = false;
  bool _isRecording = false;
  final _audioRecorder = AudioRecorder();
  final Map<String, AudioPlayer> _audioPlayers = {};
  Timer? _typingTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    _focusNode.dispose();
    _typingTimer?.cancel();
    for (final p in _audioPlayers.values) {
      p.dispose();
    }
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      final chat = Provider.of<ChatProvider>(context, listen: false);
      if (chat.activeConversationId != null) {
        chat.markAsRead(chat.activeConversationId!);
      }
    }
  }

  void _onTextChanged(String text) {
    setState(() {});
    final chat = Provider.of<ChatProvider>(context, listen: false);
    chat.sendTypingIndicator(widget.conversationId, text.isNotEmpty);
    _typingTimer?.cancel();
    if (text.isNotEmpty) {
      _typingTimer = Timer(const Duration(seconds: 2), () {
        chat.sendTypingIndicator(widget.conversationId, false);
      });
    }
  }

  void _send() {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;

    final chat = Provider.of<ChatProvider>(context, listen: false);
    chat.sendMessage(widget.conversationId, text);
    _msgCtrl.clear();
    _typingTimer?.cancel();
    chat.sendTypingIndicator(widget.conversationId, false);

    Future.delayed(const Duration(milliseconds: 300), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _toggleEmoji() {
    setState(() {
      _showEmoji = !_showEmoji;
      if (_showEmoji) _focusNode.unfocus();
    });
  }

  void _onEmojiSelected(emoji_picker.Emoji emoji) {
    final text = _msgCtrl.text;
    final sel = _msgCtrl.selection;
    final start = sel.start;
    final end = sel.end;
    _msgCtrl.value = TextEditingValue(
      text: '${text.substring(0, start)}${emoji.emoji}${text.substring(end)}',
      selection: TextSelection.collapsed(offset: start + emoji.emoji.length),
    );
    _onTextChanged(_msgCtrl.text);
  }

  Future<void> _startRecording() async {
    final hasPermission = await _audioRecorder.hasPermission();
    if (!hasPermission) return;
    final dir = await getTemporaryDirectory();
    final path = '${dir.path}/voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
    await _audioRecorder.start(const RecordConfig(encoder: AudioEncoder.aacLc), path: path);
    setState(() {
      _isRecording = true;
    });
  }

  Future<void> _stopRecordingAndSend() async {
    if (!_isRecording) return;
    final path = await _audioRecorder.stop();
    setState(() => _isRecording = false);
    if (path == null || path.isEmpty) return;
    if (!mounted) return;
    showDialog(context: context, barrierDismissible: false, builder: (ctx) => const Center(child: CircularProgressIndicator()));
    try {
      final audioUrl = await _uploadAudio(path);
      if (audioUrl != null && mounted) {
        final chat = Provider.of<ChatProvider>(context, listen: false);
        await chat.sendAudioMessage(widget.conversationId, audioUrl);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${context.l10n.t('Common.error')}: $e')));
      }
    } finally {
      if (mounted) Navigator.pop(context);
    }
  }

  Future<String?> _uploadAudio(String filePath) async {
    try {
      final url = Uri.parse('https://api.cloudinary.com/v1_1/duwk2v3ej/video/upload');
      final request = http.MultipartRequest('POST', url);
      request.fields['upload_preset'] = 'unsigned_upload';
      request.fields['resource_type'] = 'video';
      request.files.add(await http.MultipartFile.fromPath('file', filePath));
      final response = await request.send();
      if (response.statusCode == 200) {
        final responseData = await response.stream.toBytes();
        final responseString = String.fromCharCodes(responseData);
        return json.decode(responseString)['secure_url'] as String;
      }
    } catch (e) {
      debugPrint("Cloudinary Audio Upload error: $e");
    }
    return null;
  }

  Future<void> _pickAndSendImage() async {
    final picker = ImagePicker();
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppTheme.radius2xl)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Theme.of(context).dividerColor, borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: AppTheme.primaryColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.photo_library, color: AppTheme.primaryColor),
                ),
                title: Text(context.l10n.t('Ads.gallery'), style: const TextStyle(fontWeight: FontWeight.w600)),
                onTap: () => Navigator.pop(ctx, ImageSource.gallery),
              ),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: AppTheme.primaryColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.camera_alt, color: AppTheme.primaryColor),
                ),
                title: Text(context.l10n.t('Ads.camera'), style: const TextStyle(fontWeight: FontWeight.w600)),
                onTap: () => Navigator.pop(ctx, ImageSource.camera),
              ),
            ],
          ),
        ),
      ),
    );

    if (source == null) return;
    final image = await picker.pickImage(source: source, imageQuality: 70);
    if (image == null) return;

    if (!mounted) return;
    showDialog(context: context, barrierDismissible: false, builder: (ctx) => const Center(child: CircularProgressIndicator()));

    try {
      final imageUrl = await _uploadToCloudinary(image);
      if (imageUrl != null) {
        final chat = Provider.of<ChatProvider>(context, listen: false);
        await chat.sendImageMessage(widget.conversationId, imageUrl);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.l10n.t('Messages.sendError', params: ['$e']))));
    } finally {
      if (mounted) Navigator.pop(context);
    }
  }

  Future<String?> _uploadToCloudinary(XFile file) async {
    try {
      final url = Uri.parse('https://api.cloudinary.com/v1_1/duwk2v3ej/image/upload');
      final request = http.MultipartRequest('POST', url);
      request.fields['upload_preset'] = 'unsigned_upload';
      request.files.add(await http.MultipartFile.fromPath('file', file.path));
      final response = await request.send();
      if (response.statusCode == 200) {
        final responseData = await response.stream.toBytes();
        final responseString = String.fromCharCodes(responseData);
        return json.decode(responseString)['secure_url'] as String;
      }
    } catch (e) {
      debugPrint("Cloudinary Upload error: $e");
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final chat = Provider.of<ChatProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.chatBgColor,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back_rounded), onPressed: widget.onBack),
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundImage: NetworkImage('https://ui-avatars.com/api/?name=${Uri.encodeComponent(widget.partnerName)}&background=008069&color=fff'),
              backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.partnerName,
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface),
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (chat.isPartnerTyping(widget.conversationId))
                    Text(
                      context.l10n.t('Messages.typing'),
                      style: TextStyle(fontSize: 11, color: AppTheme.primaryColor, fontStyle: FontStyle.italic),
                    ),
                ],
              ),
            ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: Theme.of(context).dividerColor),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: Consumer<ChatProvider>(
              builder: (ctx, chatProvider, _) {
                final messages = chatProvider.activeMessages;

                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (_scrollCtrl.hasClients && messages.isNotEmpty) {
                    _scrollCtrl.jumpTo(_scrollCtrl.position.maxScrollExtent);
                  }
                });

                if (messages.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.chat_bubble_outline_rounded, size: 48, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55).withValues(alpha: 0.5)),
                        const SizedBox(height: 12),
                        Text(context.l10n.t('Messages.noMessages'), style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  controller: _scrollCtrl,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  itemCount: messages.length,
                  itemBuilder: (ctx, i) {
                    final m = messages[i];
                    final isMe = m.senderId == auth.currentUser?.id;
                    final isImage = m.type == 'image' && m.fileUrl != null;
                    final isAudio = m.type == 'audio' && m.fileUrl != null;

                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(ctx).size.width * 0.75),
                        margin: const EdgeInsets.only(bottom: 4),
                        padding: isImage
                            ? const EdgeInsets.all(3)
                            : isAudio
                                ? const EdgeInsets.symmetric(horizontal: 4, vertical: 6)
                                : const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: isMe ? AppTheme.chatSentColor : AppTheme.chatReceivedColor,
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(AppTheme.radiusLg),
                            topRight: const Radius.circular(AppTheme.radiusLg),
                            bottomLeft: Radius.circular(isMe ? AppTheme.radiusLg : 4),
                            bottomRight: Radius.circular(isMe ? 4 : AppTheme.radiusLg),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 2,
                              offset: const Offset(0, 1),
                            ),
                          ],
                          border: isMe ? null : Border.all(color: Theme.of(context).dividerColor),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            if (isImage) ...[
                              _buildImageContent(m),
                            ] else if (isAudio) ...[
                              _buildAudioContent(m, isMe),
                            ] else ...[
                              Text(
                                m.content,
                                style: TextStyle(
                                  color: isMe ? Colors.white : Theme.of(context).colorScheme.onSurface,
                                  fontSize: 15,
                                  height: 1.3,
                                ),
                              ),
                            ],
                            const SizedBox(height: 2),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  timeago.format(m.createdAt, locale: context.l10n.locale.languageCode),
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: isMe ? Colors.white70 : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55),
                                  ),
                                ),
                                if (isMe) ...[
                                  const SizedBox(width: 4),
                                  Icon(
                                    Icons.done_all_rounded,
                                    size: 14,
                                    color: m.read ? AppTheme.blueColor : Colors.white70,
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          // Typing indicator dots
          Consumer<ChatProvider>(
            builder: (ctx, chatProvider, _) {
              if (!chatProvider.isPartnerTyping(widget.conversationId)) return const SizedBox.shrink();
              return Container(
                padding: const EdgeInsets.only(left: 16, bottom: 4),
                alignment: Alignment.centerLeft,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _TypingDot(delay: const Duration(milliseconds: 0)),
                    const SizedBox(width: 4),
                    _TypingDot(delay: const Duration(milliseconds: 200)),
                    const SizedBox(width: 4),
                    _TypingDot(delay: const Duration(milliseconds: 400)),
                  ],
                ),
              );
            },
          ),
          // Input bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              border: Border(top: BorderSide(color: Theme.of(context).dividerColor)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    IconButton(
                      icon: Icon(_showEmoji ? Icons.keyboard_rounded : Icons.emoji_emotions_outlined,
                          color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                      onPressed: _toggleEmoji,
                    ),
                    IconButton(
                      icon: Icon(Icons.image_rounded, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                      onPressed: _pickAndSendImage,
                    ),
                    Expanded(
                      child: TextField(
                        controller: _msgCtrl,
                        focusNode: _focusNode,
                        decoration: InputDecoration(
                          hintText: context.l10n.t('Messages.writeMessage'),
                          filled: true,
                          fillColor: Theme.of(context).scaffoldBackgroundColor,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppTheme.radius2xl),
                            borderSide: BorderSide.none,
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          hintStyle: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                        ),
                        style: const TextStyle(fontSize: 14),
                        maxLines: 4,
                        minLines: 1,
                        onChanged: _onTextChanged,
                        onSubmitted: (_) => _send(),
                      ),
                    ),
                    const SizedBox(width: 4),
                    _isRecording
                        ? GestureDetector(
                            onTap: _stopRecordingAndSend,
                            child: Container(
                              width: 44, height: 44,
                              decoration: const BoxDecoration(
                                color: AppTheme.redColor,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.stop_rounded, color: Colors.white, size: 20),
                            ),
                          )
                        : Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (_msgCtrl.text.trim().isEmpty)
                                GestureDetector(
                                  onTap: _startRecording,
                                  child: Container(
                                    width: 44, height: 44,
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryColor.withValues(alpha: 0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.mic_rounded, color: AppTheme.primaryColor, size: 20),
                                  ),
                                ),
                              if (_msgCtrl.text.trim().isNotEmpty)
                                GestureDetector(
                                  onTap: _send,
                                  child: Container(
                                    width: 44, height: 44,
                                    decoration: const BoxDecoration(
                                      color: AppTheme.primaryColor,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                                  ),
                                ),
                            ],
                          ),
                  ],
                ),
                if (_showEmoji)
                  SizedBox(
                    height: 280,
                    child: emoji_picker.EmojiPicker(
                      onEmojiSelected: (category, emoji) => _onEmojiSelected(emoji),
                      config: emoji_picker.Config(
                        height: 280,
                        checkPlatformCompatibility: false,
                        emojiViewConfig: emoji_picker.EmojiViewConfig(
                          backgroundColor: Theme.of(context).cardColor,
                        ),
                        bottomActionBarConfig: const emoji_picker.BottomActionBarConfig(
                          showSearchViewButton: false,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageContent(dynamic m) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppTheme.radiusSm),
      child: GestureDetector(
        onTap: () {
          showDialog(
            context: context,
            builder: (dialogCtx) => Dialog(
              backgroundColor: Colors.transparent,
              child: Stack(
                children: [
                  InteractiveViewer(
                    child: CachedNetworkImage(
                      imageUrl: m.fileUrl!,
                      placeholder: (context, url) => const Center(child: CircularProgressIndicator()),
                      errorWidget: (context, url, error) => const Icon(Icons.error),
                    ),
                  ),
                  Positioned(
                    top: 10, right: 10,
                    child: CircleAvatar(
                      backgroundColor: Colors.black54,
                      child: IconButton(
                        icon: const Icon(Icons.close, color: Colors.white),
                        onPressed: () => Navigator.pop(dialogCtx),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
        child: CachedNetworkImage(
          imageUrl: m.fileUrl!,
          placeholder: (context, url) => Container(
            height: 200, width: 200,
            color: Colors.grey[200],
            child: const Center(child: CircularProgressIndicator()),
          ),
          errorWidget: (context, url, error) => const Icon(Icons.error),
          fit: BoxFit.cover,
        ),
      ),
    );
  }

  Widget _buildAudioContent(dynamic m, bool isMe) {
    final audioPlayer = _audioPlayers.putIfAbsent(m.id, () => AudioPlayer());
    return StatefulBuilder(
      builder: (ctx, setLocalState) {
        return GestureDetector(
          onTap: () async {
            if (audioPlayer.state == PlayerState.playing) {
              await audioPlayer.stop();
            } else {
              await audioPlayer.setSourceUrl(m.fileUrl!);
              await audioPlayer.resume();
              audioPlayer.onPlayerComplete.listen((_) => setLocalState(() {}));
            }
            setLocalState(() {});
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  audioPlayer.state == PlayerState.playing ? Icons.pause_rounded : Icons.play_arrow_rounded,
                  color: isMe ? Colors.white : AppTheme.primaryColor,
                  size: 24,
                ),
                const SizedBox(width: 8),
                Text(
                  context.l10n.t('Messages.voiceMessage'),
                  style: TextStyle(
                    color: isMe ? Colors.white : Theme.of(context).colorScheme.onSurface,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ── Typing dots animation ──────────────────────────────────────
class _TypingDot extends StatefulWidget {
  final Duration delay;
  const _TypingDot({required this.delay});

  @override
  State<_TypingDot> createState() => _TypingDotState();
}

class _TypingDotState extends State<_TypingDot> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _anim = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
    Future.delayed(widget.delay, () => _ctrl.repeat(reverse: true));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (ctx, child) => Opacity(
        opacity: _anim.value,
        child: Container(
          width: 7, height: 7,
          decoration: BoxDecoration(
            color: AppTheme.primaryColor,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}