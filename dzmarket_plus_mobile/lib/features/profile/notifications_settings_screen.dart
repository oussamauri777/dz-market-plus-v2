import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';

class NotificationsSettingsScreen extends StatelessWidget {
  const NotificationsSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        leading: IconButton(icon: Icon(Icons.arrow_back_rounded, color: Theme.of(context).colorScheme.onSurface), onPressed: () => Navigator.pop(context)),
        title: Text(context.l10n.t('Profile.notifications'), style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
      ),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        SwitchListTile(
          value: true,
          onChanged: (_) {},
          title: Text(context.l10n.t('NotificationsSettings.pushMessages'), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
          subtitle: Text(context.l10n.t('NotificationsSettings.pushMessagesDesc'), style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
          activeColor: AppTheme.primaryColor,
        ),
        const Divider(),
        SwitchListTile(
          value: true,
          onChanged: (_) {},
          title: Text(context.l10n.t('NotificationsSettings.pushAds'), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
          subtitle: Text(context.l10n.t('NotificationsSettings.pushAdsDesc'), style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
          activeColor: AppTheme.primaryColor,
        ),
        const Divider(),
        SwitchListTile(
          value: true,
          onChanged: (_) {},
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
