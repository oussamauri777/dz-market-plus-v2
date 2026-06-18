import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        leading: IconButton(icon: Icon(Icons.arrow_back_rounded, color: Theme.of(context).colorScheme.onSurface), onPressed: () => Navigator.pop(context)),
        title: Text(context.l10n.t('Profile.about'), style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SizedBox(height: 20),
          Center(child: Container(
            width: 90, height: 90,
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(22),
            ),
            child: const Icon(Icons.shopping_bag_rounded, size: 44, color: AppTheme.primaryColor),
          )),
          const SizedBox(height: 20),
          Center(child: Text(context.l10n.t('appName'),
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface))),
          const SizedBox(height: 4),
          Center(child: Text('v1.0.0',
            style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)))),
          const SizedBox(height: 24),
          Text(context.l10n.t('About.description'),
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7), height: 1.6)),
          const SizedBox(height: 32),
          _buildLinkTile(context, Icons.privacy_tip_outlined, context.l10n.t('About.privacyPolicy'), () {
            launchUrl(Uri.parse('https://dz-market-plus-v2.vercel.app/fr/privacy'));
          }),
          const Divider(),
          _buildLinkTile(context, Icons.description_outlined, context.l10n.t('About.termsOfService'), () {
            launchUrl(Uri.parse('https://dz-market-plus-v2.vercel.app/fr/terms'));
          }),
          const Divider(),
          _buildLinkTile(context, Icons.code_rounded, context.l10n.t('About.developer'), () {}),
          const SizedBox(height: 32),
          Center(child: Text(context.l10n.t('About.rights'),
            style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.4))))]),
    );
  }

  Widget _buildLinkTile(BuildContext context, IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7), size: 22),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15)),
      trailing: Icon(Icons.chevron_right_rounded, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), size: 20),
      onTap: onTap,
    );
  }
}
