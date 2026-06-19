import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/services/api_service.dart';
import '../../shared/widgets/empty_state.dart';

class AdminMessagesTab extends StatefulWidget {
  const AdminMessagesTab({super.key});
  @override
  State<AdminMessagesTab> createState() => _AdminMessagesTabState();
}

class _AdminMessagesTabState extends State<AdminMessagesTab> {
  List<dynamic> _conversations = [];
  bool _loading = true;
  String? _error;
  int _page = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadConversations();
  }

  Future<void> _loadConversations({bool append = false}) async {
    if (!append) setState(() { _loading = true; _error = null; });
    try {
      final data = await ApiService.getAdminMessages(page: _page, limit: 10);
      final conversations = data['conversations'] ?? data['data'] ?? [];
      final total = data['pagination']?['total'] ?? 0;
      if (mounted) {
        setState(() {
          if (append) { _conversations.addAll(List.from(conversations)); } else { _conversations = List.from(conversations); }
          _hasMore = _conversations.length < total;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return EmptyState(
        icon: Icons.error_outline_rounded, title: 'Erreur', subtitle: _error,
        buttonLabel: 'Réessayer', onButtonTap: () => _loadConversations(),
      );
    }
    if (_conversations.isEmpty) {
      return const EmptyState(icon: Icons.chat_outlined, title: 'Aucune conversation');
    }

    return RefreshIndicator(
      onRefresh: () async { _page = 1; await _loadConversations(); },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _conversations.length + (_hasMore ? 1 : 0),
        itemBuilder: (ctx, i) {
          if (i == _conversations.length) {
            return const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator(strokeWidth: 2)));
          }
          final c = _conversations[i];
          final participants = c['participants'] as List? ?? [];
          final participantNames = participants.map((p) => p is Map ? p['name'] ?? '' : '').where((n) => n.isNotEmpty).join(', ');
          final participantImages = participants.whereType<Map>().map((p) => p['image']).cast<String?>().toList();
          final adTitle = c['ad'] is Map ? c['ad']['title'] : c['adTitle'] ?? '';
          final lastActive = c['updatedAt'] ?? c['lastMessageAt'];
          final lastActiveStr = lastActive != null ? DateTime.parse(lastActive).toLocal().toString().split(' ')[0] : '';

          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Stack(
                    children: [
                      CircleAvatar(
                        radius: 22,
                        backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.12),
                        backgroundImage: participantImages.isNotEmpty && participantImages[0] != null
                            ? CachedNetworkImageProvider(participantImages[0]!)
                            : null,
                        child: participantImages.isEmpty || participantImages[0] == null
                            ? const Icon(Icons.person_rounded, color: AppTheme.primaryColor)
                            : null,
                      ),
                      if (participants.length > 1 && participantImages.length > 1 && participantImages[1] != null)
                        Positioned(
                          right: -4, bottom: -4,
                          child: CircleAvatar(
                            radius: 12,
                            backgroundColor: Theme.of(context).cardColor,
                            backgroundImage: CachedNetworkImageProvider(participantImages[1]!),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(participantNames.isNotEmpty ? participantNames : 'Participants',
                            style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface)),
                        if (adTitle.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(adTitle,
                              style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                        ],
                        if (lastActiveStr.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text('Dernière activité: $lastActiveStr',
                              style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.4))),
                        ],
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right_rounded, color: AppTheme.primaryColor),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
