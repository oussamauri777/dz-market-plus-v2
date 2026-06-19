import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/services/api_service.dart';

class NotificationsSettingsScreen extends StatefulWidget {
  const NotificationsSettingsScreen({super.key});
  @override
  State<NotificationsSettingsScreen> createState() => _NotificationsSettingsScreenState();
}

class _NotificationsSettingsScreenState extends State<NotificationsSettingsScreen> {
  bool _pushMessages = true;
  bool _pushAds = true;
  bool _emailNotifs = true;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadPrefs();
  }

  Future<void> _loadPrefs() async {
    try {
      final prefs = await ApiService.getNotificationPreferences();
      if (mounted) setState(() {
        _pushMessages = prefs['pushMessages'] ?? true;
        _pushAds = prefs['pushAds'] ?? true;
        _emailNotifs = prefs['emailNotifications'] ?? true;
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _updatePrefs() async {
    try {
      await ApiService.updateNotificationPreferences(
        pushMessages: _pushMessages,
        pushAds: _pushAds,
        emailNotifications: _emailNotifs,
      );
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        leading: IconButton(icon: Icon(Icons.arrow_back_rounded, color: Theme.of(context).colorScheme.onSurface), onPressed: () => Navigator.pop(context)),
        title: Text(context.l10n.t('Profile.notifications'), style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView(padding: const EdgeInsets.all(20), children: [
          SwitchListTile(
            value: _pushMessages,
            onChanged: (v) { setState(() => _pushMessages = v); _updatePrefs(); },
            title: Text(context.l10n.t('NotificationsSettings.pushMessages'), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
            subtitle: Text(context.l10n.t('NotificationsSettings.pushMessagesDesc'), style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
            activeColor: AppTheme.primaryColor,
          ),
          const Divider(),
          SwitchListTile(
            value: _pushAds,
            onChanged: (v) { setState(() => _pushAds = v); _updatePrefs(); },
            title: Text(context.l10n.t('NotificationsSettings.pushAds'), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
            subtitle: Text(context.l10n.t('NotificationsSettings.pushAdsDesc'), style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
            activeColor: AppTheme.primaryColor,
          ),
          const Divider(),
          SwitchListTile(
            value: _emailNotifs,
            onChanged: (v) { setState(() => _emailNotifs = v); _updatePrefs(); },
            title: Text(context.l10n.t('NotificationsSettings.emailNotifs'), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
            subtitle: Text(context.l10n.t('NotificationsSettings.emailNotifsDesc'), style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
            activeColor: AppTheme.primaryColor,
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Icon(Icons.info_outline, size: 20, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
              const SizedBox(width: 12),
              Expanded(child: Text(context.l10n.t('NotificationsSettings.manageInOS'),
                style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), height: 1.5))),
            ]),
          ),
        ]),
    );
  }
}
