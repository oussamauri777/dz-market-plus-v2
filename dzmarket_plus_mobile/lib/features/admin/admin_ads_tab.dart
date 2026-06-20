import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/services/api_service.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/confirmation_dialog.dart';

class AdminAdsTab extends StatefulWidget {
  const AdminAdsTab({super.key});
  @override
  State<AdminAdsTab> createState() => _AdminAdsTabState();
}

class _AdminAdsTabState extends State<AdminAdsTab> {
  List<dynamic> _ads = [];
  bool _loading = true;
  bool _loadingMore = false;
  String? _error;
  int _page = 1;
  bool _hasMore = true;
  final _searchCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  String _search = '';
  String _statusFilter = '';

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
    _loadAds();
  }

  @override
  void dispose() {
    _scrollCtrl.removeListener(_onScroll);
    _scrollCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 200 && _hasMore && !_loading && !_loadingMore) {
      _page++;
      _loadAds(append: true);
    }
  }

  Future<void> _loadAds({bool append = false}) async {
    if (append) { setState(() => _loadingMore = true); } else { setState(() { _loading = true; _error = null; }); }
    try {
      final data = await ApiService.getAdminAds(page: _page, search: _search, status: _statusFilter);
      final ads = data['ads'] ?? data['data'] ?? [];
      final total = data['pagination']?['total'] ?? 0;
      if (mounted) {
        setState(() {
          if (append) { _ads.addAll(List.from(ads)); } else { _ads = List.from(ads); }
          _hasMore = _ads.length < total;
          _loading = false;
          _loadingMore = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; _loadingMore = false; });
    }
  }

  Future<void> _toggleStatus(String adId, String currentStatus) async {
    final newStatus = currentStatus == 'active' ? 'inactive' : 'active';
    try {
      await ApiService.updateAdStatus(adId, newStatus);
      _loadAds();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    }
  }

  Future<void> _deleteAd(String adId, String title) async {
    ConfirmationDialog.show(
      context,
      title: 'Supprimer $title ?',
      message: 'Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      isDestructive: true,
      onConfirm: () async {
        try {
          await ApiService.deleteAd(adId);
          _loadAds();
          if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Annonce supprimée')));
        } catch (e) {
          if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
        }
      },
    );
  }

  void _onSearch(String v) { _search = v; _page = 1; _loadAds(); }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
          child: TextField(
            controller: _searchCtrl,
            decoration: InputDecoration(
              hintText: 'Rechercher par titre...',
              prefixIcon: const Icon(Icons.search_rounded),
              suffixIcon: _searchCtrl.text.isNotEmpty
                  ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchCtrl.clear(); _onSearch(''); })
                  : null,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16),
            ),
            onChanged: _onSearch,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: Row(
            children: [
              _FilterChip('Toutes', _statusFilter == '', () => setState(() { _statusFilter = ''; _page = 1; _loadAds(); })),
              const SizedBox(width: 8),
              _FilterChip('Actives', _statusFilter == 'active', () => setState(() { _statusFilter = 'active'; _page = 1; _loadAds(); })),
              const SizedBox(width: 8),
              _FilterChip('Inactives', _statusFilter == 'inactive', () => setState(() { _statusFilter = 'inactive'; _page = 1; _loadAds(); })),
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
        buttonLabel: 'Réessayer', onButtonTap: () => _loadAds(),
      );
    }
    if (_ads.isEmpty) {
      return const EmptyState(icon: Icons.inventory_2_outlined, title: 'Aucune annonce');
    }

    return RefreshIndicator(
      onRefresh: () async { _page = 1; await _loadAds(); },
      child: ListView.builder(
        controller: _scrollCtrl,
        itemCount: _ads.length + (_hasMore ? 1 : 0),
        itemBuilder: (ctx, i) {
          if (i == _ads.length) {
            return const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator(strokeWidth: 2)));
          }
          return _AdTile(
            ad: _ads[i],
            onToggleStatus: () => _toggleStatus(_ads[i]['_id'] ?? _ads[i]['id'], _ads[i]['status'] ?? ''),
            onDelete: () => _deleteAd(_ads[i]['_id'] ?? _ads[i]['id'], _ads[i]['title'] ?? ''),
          );
        },
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _FilterChip(this.label, this.selected, this.onTap);

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

class _AdTile extends StatelessWidget {
  final Map<String, dynamic> ad;
  final VoidCallback onToggleStatus;
  final VoidCallback onDelete;

  const _AdTile({required this.ad, required this.onToggleStatus, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    final title = ad['title'] ?? 'Sans titre';
    final price = ad['price'] ?? 0;
    final status = ad['status'] ?? 'active';
    final category = ad['category'] ?? '';
    final sellerName = ad['user'] is Map ? ad['user']['name'] : ad['sellerName'] ?? 'Inconnu';
    final sellerEmail = ad['user'] is Map ? ad['user']['email'] : '';
    final createdAt = ad['createdAt'] != null ? DateTime.parse(ad['createdAt']).toLocal().toString().split(' ')[0] : '';
    final image = ad['images'] is List && ad['images'].isNotEmpty ? ad['images'][0] : null;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: 60, height: 60,
                color: Theme.of(context).scaffoldBackgroundColor,
                child: image != null
                    ? Image.network(image, fit: BoxFit.cover, errorBuilder: (_, __, ___) => _adFallback())
                    : _adFallback(),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface),
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Text('${price.toStringAsFixed(0)} DA',
                      style: TextStyle(fontWeight: FontWeight.w700, color: AppTheme.primaryColor, fontSize: 13)),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      if (category.isNotEmpty) Flexible(child: _Tag(category)),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: status == 'active' ? AppTheme.greenColor.withValues(alpha: 0.12) : AppTheme.redColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(status, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600,
                            color: status == 'active' ? AppTheme.greenColor : AppTheme.redColor)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text('$sellerName${sellerEmail.isNotEmpty ? ' • $sellerEmail' : ''}',
                      style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5))),
                  if (createdAt.isNotEmpty) Text(createdAt,
                      style: TextStyle(fontSize: 10, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.4))),
                ],
              ),
            ),
            Column(
              children: [
                IconButton(
                  icon: Icon(status == 'active' ? Icons.toggle_on_rounded : Icons.toggle_off_outlined,
                      color: status == 'active' ? AppTheme.greenColor : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.4)),
                  onPressed: onToggleStatus,
                  tooltip: status == 'active' ? 'Désactiver' : 'Activer',
                ),
                IconButton(
                  icon: Icon(Icons.delete_outline_rounded, color: AppTheme.redColor.withValues(alpha: 0.7), size: 20),
                  onPressed: onDelete,
                  tooltip: 'Supprimer',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _adFallback() {
    return const Icon(Icons.image_rounded, size: 28, color: AppTheme.primaryColor);
  }
}

class _Tag extends StatelessWidget {
  final String label;
  const _Tag(this.label);
  @override Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
    decoration: BoxDecoration(
      color: AppTheme.primaryColor.withValues(alpha: 0.08),
      borderRadius: BorderRadius.circular(4),
    ),
    child: Text(label, style: TextStyle(fontSize: 10, color: AppTheme.primaryColor.withValues(alpha: 0.8))),
  );
}
