import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/services/api_service.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/confirmation_dialog.dart';

class AdminReviewsTab extends StatefulWidget {
  const AdminReviewsTab({super.key});
  @override
  State<AdminReviewsTab> createState() => _AdminReviewsTabState();
}

class _AdminReviewsTabState extends State<AdminReviewsTab> {
  List<dynamic> _reviews = [];
  bool _loading = true;
  String? _error;
  int _page = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews({bool append = false}) async {
    if (!append) setState(() { _loading = true; _error = null; });
    try {
      final data = await ApiService.getAdminReviews(page: _page, limit: 10);
      final reviews = data['reviews'] ?? data['data'] ?? [];
      final total = data['pagination']?['total'] ?? 0;
      if (mounted) {
        setState(() {
          if (append) { _reviews.addAll(List.from(reviews)); } else { _reviews = List.from(reviews); }
          _hasMore = _reviews.length < total;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _deleteReview(String reviewId) async {
    ConfirmationDialog.show(
      context,
      title: 'Supprimer cet avis ?',
      message: 'Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      isDestructive: true,
      onConfirm: () async {
        try {
          await ApiService.deleteAdminReview(reviewId);
          _loadReviews();
          if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Avis supprimé')));
        } catch (e) {
          if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return EmptyState(
        icon: Icons.error_outline_rounded, title: 'Erreur', subtitle: _error,
        buttonLabel: 'Réessayer', onButtonTap: () => _loadReviews(),
      );
    }
    if (_reviews.isEmpty) {
      return const EmptyState(icon: Icons.star_outline_rounded, title: 'Aucun avis');
    }

    return RefreshIndicator(
      onRefresh: () async { _page = 1; await _loadReviews(); },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _reviews.length + (_hasMore ? 1 : 0),
        itemBuilder: (ctx, i) {
          if (i == _reviews.length) {
            return const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator(strokeWidth: 2)));
          }
          final r = _reviews[i];
          final buyerName = r['buyer'] is Map ? r['buyer']['name'] : r['buyerName'] ?? 'Inconnu';
          final sellerName = r['seller'] is Map ? r['seller']['name'] : r['sellerName'] ?? 'Inconnu';
          final adTitle = r['ad'] is Map ? r['ad']['title'] : r['adTitle'] ?? '';
          final rating = r['rating'] ?? 0;
          final comment = r['comment'] ?? '';
          final createdAt = r['createdAt'] != null ? DateTime.parse(r['createdAt']).toLocal().toString().split(' ')[0] : '';

          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('$buyerName → $sellerName',
                                style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface)),
                            if (adTitle.isNotEmpty)
                              Text(adTitle,
                                  style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                          ],
                        ),
                      ),
                      if (createdAt.isNotEmpty)
                        Text(createdAt,
                            style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.4))),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: List.generate(5, (i) => Icon(
                      i < rating ? Icons.star_rounded : Icons.star_border_rounded,
                      size: 18, color: AppTheme.yellowColor,
                    )),
                  ),
                  if (comment.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(comment,
                        style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.75))),
                  ],
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerRight,
                    child: IconButton(
                      icon: Icon(Icons.delete_outline_rounded, color: AppTheme.redColor.withValues(alpha: 0.7), size: 20),
                      onPressed: () => _deleteReview(r['_id'] ?? r['id']),
                      tooltip: 'Supprimer',
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
