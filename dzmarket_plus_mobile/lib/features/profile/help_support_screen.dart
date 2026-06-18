import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        leading: IconButton(icon: Icon(Icons.arrow_back_rounded, color: Theme.of(context).colorScheme.onSurface), onPressed: () => Navigator.pop(context)),
        title: Text(context.l10n.t('Profile.help'), style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
      ),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        _buildSection(context, Icons.question_answer_outlined, context.l10n.t('Help.faq'), context.l10n.t('Help.faqDesc'), () {}),
        const SizedBox(height: 12),
        _buildSection(context, Icons.mail_outline_rounded, context.l10n.t('Help.contactEmail'), 'support@dzmarketplus.com', () {
          launchUrl(Uri.parse('mailto:support@dzmarketplus.com'));
        }),
        const SizedBox(height: 12),
        _buildSection(context, Icons.shield_outlined, context.l10n.t('Help.safetyTips'), context.l10n.t('Help.safetyTipsDesc'), () {}),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Icon(Icons.access_time_rounded, size: 18, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
              const SizedBox(width: 8),
              Text(context.l10n.t('Help.responseTime'), style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Theme.of(context).colorScheme.onSurface)),
            ]),
            const SizedBox(height: 6),
            Text(context.l10n.t('Help.responseTimeDesc'),
              style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), height: 1.5)),
          ]),
        ),
      ]),
    );
  }

  Widget _buildSection(BuildContext context, IconData icon, String title, String subtitle, VoidCallback onTap) {
    return Card(
      color: Theme.of(context).cardColor,
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Theme.of(context).dividerColor)),
      child: ListTile(
        leading: Container(
          width: 40, height: 40,
          decoration: BoxDecoration(color: AppTheme.primaryColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: AppTheme.primaryColor, size: 22),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
        subtitle: Padding(padding: const EdgeInsets.only(top: 4), child: Text(subtitle, style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)))),
        trailing: Icon(Icons.chevron_right_rounded, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), size: 20),
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
    );
  }
}
