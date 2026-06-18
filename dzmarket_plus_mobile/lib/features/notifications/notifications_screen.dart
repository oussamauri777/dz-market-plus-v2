import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/providers/notification_provider.dart';
import '../../core/router/app_router.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationProvider>().fetchNotifications(refresh: true);
    });
    _scrollCtrl.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollCtrl.removeListener(_onScroll);
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _onScroll() {
    final provider = context.read<NotificationProvider>();
    if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 300
        && !provider.isLoading && provider.hasMore) {
      provider.fetchNotifications();
    }
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'new_message':
        return Icons.chat_rounded;
      case 'ad_update':
      case 'ad_approved':
        return Icons.trending_up_rounded;
      case 'ad_sold':
        return Icons.sell_rounded;
      case 'review_received':
        return Icons.star_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  Color _colorForType(String type) {
    switch (type) {
      case 'new_message':
        return AppTheme.accentColor;
      case 'ad_update':
      case 'ad_approved':
        return AppTheme.greenColor;
      case 'ad_sold':
        return AppTheme.redColor;
      case 'review_received':
        return const Color(0xFFF59E0B);
      default:
        return AppTheme.textMutedColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        title: Text(context.l10n.t('Profile.notifications'), style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
        actions: [
          Consumer<NotificationProvider>(
            builder: (ctx, np, _) {
              if (np.unreadCount == 0) return const SizedBox.shrink();
              return IconButton(
                icon: Icon(Icons.done_all_rounded, color: AppTheme.primaryColor),
                onPressed: () => np.markAllAsRead(),
                tooltip: context.l10n.t('Notifications.markAllRead'),
              );
            },
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: Theme.of(context).dividerColor),
        ),
      ),
      body: Consumer<NotificationProvider>(
        builder: (ctx, np, _) {
          if (np.isLoading && np.notifications.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (np.notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.notifications_off_outlined, size: 48,
                      color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                  const SizedBox(height: 12),
                  Text(context.l10n.t('Notifications.empty'),
                      style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => np.fetchNotifications(refresh: true),
            child: ListView.separated(
              controller: _scrollCtrl,
              padding: EdgeInsets.zero,
              itemCount: np.notifications.length + (np.isLoading ? 1 : 0),
              separatorBuilder: (_, __) => Divider(height: 1, color: Theme.of(context).dividerColor),
              itemBuilder: (ctx, i) {
                if (i >= np.notifications.length) {
                  return const Padding(
                    padding: EdgeInsets.all(16),
                    child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                  );
                }

                final n = np.notifications[i];
                final icon = _iconForType(n.type);
                final color = _colorForType(n.type);

                return ListTile(
                  leading: Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon, color: color, size: 20),
                  ),
                  title: Text(n.title, style: TextStyle(
                    fontWeight: n.read ? FontWeight.normal : FontWeight.w600,
                    fontSize: 14,
                    color: Theme.of(context).colorScheme.onSurface,
                  )),
                  subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const SizedBox(height: 2),
                    Text(n.body, style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55),
                    ), maxLines: 2, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 4),
                    Text(timeago.format(n.createdAt, locale: context.l10n.locale.languageCode),
                        style: TextStyle(fontSize: 11,
                            color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                  ]),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  onTap: () {
                    if (!n.read) {
                      np.markAsRead([n.id]);
                    }
                    if (n.type == 'new_message' && n.data != null) {
                      final convId = n.data!['conversationId'] as String?;
                      final partnerName = n.title;
                      if (convId != null) {
                        navigateToConversation(convId, partner: partnerName);
                      }
                    }
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}
