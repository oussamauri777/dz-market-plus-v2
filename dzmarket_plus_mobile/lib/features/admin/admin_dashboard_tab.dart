import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/services/api_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/empty_state.dart';

class AdminDashboardTab extends StatefulWidget {
  const AdminDashboardTab({super.key});
  @override
  State<AdminDashboardTab> createState() => _AdminDashboardTabState();
}

class _AdminDashboardTabState extends State<AdminDashboardTab> {
  Map<String, dynamic>? _overview;
  Map<String, dynamic>? _charts;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() { _loading = true; _error = null; });
    try {
      final results = await Future.wait([
        ApiService.getAdminOverview(),
        ApiService.getAdminCharts(days: 30),
      ]);
      if (mounted) setState(() { _overview = results[0]; _charts = results[1]; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return RefreshIndicator(
        onRefresh: _loadData,
        child: ListView(
          children: [
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.6,
              child: EmptyState(
                icon: Icons.error_outline_rounded,
                title: 'Erreur',
                subtitle: _error,
                buttonLabel: 'Réessayer',
                onButtonTap: _loadData,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionTitle('Vue d\'ensemble'),
          const SizedBox(height: 12),
          _buildOverviewGrid(),
          const SizedBox(height: 24),
          if (_charts != null) ...[
            if (_charts!['growthData'] != null) ...[
              _buildSectionTitle('Croissance (30 jours)'),
              const SizedBox(height: 12),
              _buildGrowthSummary(),
              const SizedBox(height: 24),
            ],
            _buildSectionTitle('Répartition'),
            const SizedBox(height: 12),
            _buildDistributionCards(),
            const SizedBox(height: 24),
          ],
          _buildSectionTitle('Engagement'),
          const SizedBox(height: 12),
          _buildEngagementRow(),
          const SizedBox(height: 24),
          _buildSectionTitle('Financier'),
          const SizedBox(height: 12),
          _buildFinancialRow(),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: Theme.of(context).colorScheme.onSurface,
      ),
    );
  }

  Widget _buildOverviewGrid() {
    final o = (_overview?['stats'] ?? _overview) as Map<String, dynamic>? ?? {};
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        _StatCard('Utilisateurs', '${o['totalUsers'] ?? 0}', Icons.people_rounded, AppTheme.primaryColor,
            '${o['newUsersThisMonth'] ?? 0} ce mois'),
        _StatCard('Annonces', '${o['totalAds'] ?? 0}', Icons.inventory_2_rounded, AppTheme.blueColor,
            '${o['newAdsThisMonth'] ?? 0} ce mois'),
        _StatCard('Actives', '${o['activeAds'] ?? 0}', Icons.check_circle_rounded, AppTheme.greenColor,
            '${o['soldAds'] ?? 0} vendues'),
        _StatCard('Utilisateurs actifs', '${o['activeUsers'] ?? 0}', Icons.person_pin_rounded, AppTheme.orangeColor, null),
      ],
    );
  }

  Widget _buildGrowthSummary() {
    final data = _charts?['growthData'] as List? ?? [];
    if (data.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Text('Aucune donnée de croissance disponible',
              style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
        ),
      );
    }
    final latest = data.last;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Dernier jour: ${latest['date'] ?? ''}',
                style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface)),
            const SizedBox(height: 8),
            Row(
              children: [
                _GrowthItem('Utilisateurs', '${latest['users'] ?? 0}', Icons.people_rounded, AppTheme.primaryColor),
                const SizedBox(width: 24),
                _GrowthItem('Annonces', '${latest['ads'] ?? 0}', Icons.inventory_2_rounded, AppTheme.blueColor),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDistributionCards() {
    return Column(
      children: [
        if (_charts?['categoryData'] != null) _buildDistribCard(
          'Catégories',
          List<Map<String, dynamic>>.from(_charts!['categoryData'] ?? []),
          Icons.category_rounded,
        ),
        const SizedBox(height: 12),
        if (_charts?['wilayaData'] != null) _buildDistribCard(
          'Wilayas (Top 10)',
          List<Map<String, dynamic>>.from(_charts!['wilayaData'] ?? []),
          Icons.location_on_rounded,
        ),
        const SizedBox(height: 12),
        if (_charts?['statusData'] != null) _buildDistribCard(
          'Statuts',
          List<Map<String, dynamic>>.from(_charts!['statusData'] ?? []),
          Icons.circle_rounded,
        ),
      ],
    );
  }

  Widget _buildDistribCard(String title, List<Map<String, dynamic>> items, IconData icon) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 18, color: AppTheme.primaryColor),
                const SizedBox(width: 8),
                Text(title, style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
              ],
            ),
            const SizedBox(height: 12),
            ...items.take(5).map((item) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                children: [
                  Expanded(
                    child: Text(item['name'] ?? item['_id'] ?? '',
                        style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7))),
                  ),
                  Text('${item['value'] ?? item['count'] ?? 0}',
                      style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface)),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildEngagementRow() {
    final o = (_overview?['stats'] ?? _overview) as Map<String, dynamic>? ?? {};
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        _MiniStat(Icons.visibility_rounded, 'Vues', '${o['totalViews'] ?? 0}'),
        _MiniStat(Icons.favorite_rounded, 'Favoris', '${o['totalFavorites'] ?? 0}'),
        _MiniStat(Icons.star_rounded, 'Avis', '${o['totalReviews'] ?? 0}'),
        _MiniStat(Icons.chat_rounded, 'Conversations', '${o['totalConversations'] ?? 0}'),
      ],
    );
  }

  Widget _buildFinancialRow() {
    final o = (_overview?['stats'] ?? _overview) as Map<String, dynamic>? ?? {};
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        _MiniStat(Icons.monetization_on_rounded, 'Prix moyen', '${o['averagePrice'] ?? 0} DA'),
        _MiniStat(Icons.trending_up_rounded, 'Croissance utilisateurs', '${o['usersGrowthPercent'] ?? 0}%'),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final String? subtitle;
  final IconData icon;
  final Color color;
  const _StatCard(this.label, this.value, this.icon, this.color, this.subtitle);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return SizedBox(
      width: (MediaQuery.of(context).size.width - 44) / 2,
      child: Card(
        color: isDark ? const Color(0xFF1E1E3A) : null,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(height: 12),
              Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface)),
              const SizedBox(height: 2),
              Text(label, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
              if (subtitle != null) ...[
                const SizedBox(height: 4),
                Text(subtitle!, style: TextStyle(fontSize: 11, color: color)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final bool wide;
  const _MiniStat(this.icon, this.label, this.value, {this.wide = false});

  @override
  Widget build(BuildContext context) {
    final w = wide
        ? MediaQuery.of(context).size.width - 32
        : (MediaQuery.of(context).size.width - 44) / 2;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return SizedBox(
      width: w,
      child: Card(
        color: isDark ? const Color(0xFF1E1E3A) : null,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 18, color: AppTheme.primaryColor),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
                  Text(label, style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _GrowthItem extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color color;
  const _GrowthItem(this.label, this.value, this.icon, this.color);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
            Text(label, style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
          ],
        ),
      ],
    );
  }
}
