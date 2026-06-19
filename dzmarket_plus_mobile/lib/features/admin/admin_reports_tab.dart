import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/services/api_service.dart';
import '../../shared/widgets/empty_state.dart';

class AdminReportsTab extends StatefulWidget {
  const AdminReportsTab({super.key});
  @override
  State<AdminReportsTab> createState() => _AdminReportsTabState();
}

class _AdminReportsTabState extends State<AdminReportsTab> {
  List<dynamic> _reports = [];
  bool _loading = true;
  String? _error;
  String _statusFilter = 'pending';

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  Future<void> _loadReports() async {
    setState(() { _loading = true; _error = null; });
    try {
      final data = await ApiService.getAdminReports(status: _statusFilter);
      final reports = data['reports'] ?? data['data'] ?? [];
      if (mounted) setState(() { _reports = List.from(reports); _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _updateStatus(String reportId, String status) async {
    try {
      await ApiService.updateReportStatus(reportId, status);
      _loadReports();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Signalement ${status == 'resolved' ? 'résolu' : 'ignoré'}')),
        );
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              _StatusChip('En attente', _statusFilter == 'pending', () => setState(() { _statusFilter = 'pending'; _loadReports(); })),
              const SizedBox(width: 8),
              _StatusChip('Résolus', _statusFilter == 'resolved', () => setState(() { _statusFilter = 'resolved'; _loadReports(); })),
              const SizedBox(width: 8),
              _StatusChip('Ignorés', _statusFilter == 'dismissed', () => setState(() { _statusFilter = 'dismissed'; _loadReports(); })),
            ],
          ),
        ),
        Expanded(child: _buildBody()),
      ],
    );
  }

  Widget _buildBody() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return EmptyState(
        icon: Icons.error_outline_rounded, title: 'Erreur', subtitle: _error,
        buttonLabel: 'Réessayer', onButtonTap: _loadReports,
      );
    }
    if (_reports.isEmpty) {
      return const EmptyState(
        icon: Icons.flag_rounded,
        title: 'Aucun signalement',
        subtitle: 'Aucun signalement à afficher pour ce filtre.',
      );
    }

    return RefreshIndicator(
      onRefresh: _loadReports,
      child: ListView.builder(
        itemCount: _reports.length,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemBuilder: (ctx, i) {
          final r = _reports[i];
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _statusColor(r['status'] ?? 'pending').withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(r['status'] ?? 'pending',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: _statusColor(r['status'] ?? 'pending'))),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(r['reason'] ?? 'Autre',
                            style: TextStyle(fontSize: 11, color: AppTheme.primaryColor)),
                      ),
                      const Spacer(),
                      if (r['createdAt'] != null)
                        Text(
                          DateTime.parse(r['createdAt']).toLocal().toString().split(' ')[0],
                          style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.4)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  if (r['description'] != null && r['description'].toString().isNotEmpty) ...[
                    Text(r['description'], style: TextStyle(
                      fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.75),
                    )),
                    const SizedBox(height: 8),
                  ],
                  Row(
                    children: [
                      Icon(Icons.person_outline_rounded, size: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5)),
                      const SizedBox(width: 4),
                      Text(r['reporter'] is Map ? r['reporter']['name'] ?? '' : '',
                          style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5))),
                      if (r['targetType'] != null) ...[
                        const SizedBox(width: 12),
                        Icon(Icons.flag_rounded, size: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5)),
                        const SizedBox(width: 4),
                        Text(r['targetType'], style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5))),
                      ],
                    ],
                  ),
                  if (r['status'] == 'pending') ...[
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _updateStatus(r['_id'] ?? r['id'], 'resolved'),
                            icon: const Icon(Icons.check_rounded, size: 16, color: AppTheme.greenColor),
                            label: const Text('Résoudre', style: TextStyle(color: AppTheme.greenColor)),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: AppTheme.greenColor.withValues(alpha: 0.5)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _updateStatus(r['_id'] ?? r['id'], 'dismissed'),
                            icon: const Icon(Icons.close_rounded, size: 16, color: AppTheme.redColor),
                            label: const Text('Ignorer', style: TextStyle(color: AppTheme.redColor)),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: AppTheme.redColor.withValues(alpha: 0.5)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'resolved': return AppTheme.greenColor;
      case 'dismissed': return AppTheme.redColor;
      default: return AppTheme.orangeColor;
    }
  }
}

class _StatusChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _StatusChip(this.label, this.selected, this.onTap);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppTheme.primaryColor : Theme.of(context).scaffoldBackgroundColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: selected ? AppTheme.primaryColor : Theme.of(context).dividerColor),
        ),
        child: Text(label, style: TextStyle(
          fontSize: 13, fontWeight: FontWeight.w600,
          color: selected ? Colors.white : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
        )),
      ),
    );
  }
}
