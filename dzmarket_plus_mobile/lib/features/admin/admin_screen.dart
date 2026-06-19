import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/providers/auth_provider.dart';
import 'admin_dashboard_tab.dart';
import 'admin_users_tab.dart';
import 'admin_ads_tab.dart';
import 'admin_reports_tab.dart';
import 'admin_reviews_tab.dart';
import 'admin_messages_tab.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});
  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  int _selectedIndex = 0;

  static const _titles = [
    'Tableau de bord',
    'Utilisateurs',
    'Annonces',
    'Signalements',
    'Avis',
    'Messages',
  ];

  static const _icons = [
    Icons.dashboard_rounded,
    Icons.people_rounded,
    Icons.inventory_2_rounded,
    Icons.flag_rounded,
    Icons.star_rounded,
    Icons.chat_rounded,
  ];

  final _pages = const [
    AdminDashboardTab(),
    AdminUsersTab(),
    AdminAdsTab(),
    AdminReportsTab(),
    AdminReviewsTab(),
    AdminMessagesTab(),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_selectedIndex]),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      drawer: Drawer(
        child: Container(
          color: isDark ? const Color(0xFF1A1A2E) : Colors.white,
          child: Column(
            children: [
              DrawerHeader(
                decoration: const BoxDecoration(color: AppTheme.primaryColor),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    const Icon(Icons.admin_panel_settings_rounded, size: 48, color: Colors.white),
                    const SizedBox(height: 12),
                    Text(
                      context.l10n.t('Navigation.admin'),
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Administration',
                      style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.8)),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: _titles.length,
                  itemBuilder: (ctx, i) => ListTile(
                    leading: Icon(
                      _icons[i],
                      color: _selectedIndex == i ? AppTheme.primaryColor : null,
                    ),
                    title: Text(
                      _titles[i],
                      style: TextStyle(
                        fontWeight: _selectedIndex == i ? FontWeight.w700 : FontWeight.w400,
                        color: _selectedIndex == i ? AppTheme.primaryColor : null,
                      ),
                    ),
                    selected: _selectedIndex == i,
                    selectedTileColor: AppTheme.primaryColor.withValues(alpha: 0.08),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    onTap: () {
                      setState(() => _selectedIndex = i);
                      Navigator.pop(ctx);
                    },
                  ),
                ),
              ),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.arrow_back_rounded),
                title: Text(context.l10n.t('Common.back')),
                onTap: () => context.pop(),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
      body: _pages[_selectedIndex],
    );
  }
}
