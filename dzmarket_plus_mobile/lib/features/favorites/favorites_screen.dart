import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/models/ad.dart';
import '../../core/providers/ad_provider.dart';
import '../../shared/widgets/ad_card.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  @override
  Widget build(BuildContext context) {
    final adProvider = Provider.of<AdProvider>(context);
    final favorites = adProvider.favoritedAds;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        title: Text(context.l10n.t('Favorites.title'), style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
        actions: [
          if (favorites.isNotEmpty)
            TextButton(
              onPressed: () => _showDeleteAllDialog(context, adProvider),
              child: Text(context.l10n.t('Favorites.clearAll'), style: const TextStyle(color: Colors.red, fontSize: 13)),
            ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: Theme.of(context).dividerColor),
        ),
      ),
      body: favorites.isEmpty ? _buildEmpty() : RefreshIndicator(
        onRefresh: () => adProvider.syncFavoritesFromApi(),
        child: _buildGrid(favorites, adProvider),
      ),
    );
  }

  void _showDeleteAllDialog(BuildContext context, AdProvider adProvider) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(context.l10n.t('Favorites.clearAll')),
        content: Text(context.l10n.t('Favorites.irreversible')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text(context.l10n.t('Common.cancel'))),
          TextButton(
            onPressed: () {
              adProvider.clearFavorites();
              Navigator.pop(ctx);
            },
            child: Text(context.l10n.t('Common.confirm'), style: const TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Widget _buildGrid(List<Ad> favorites, AdProvider adProvider) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.65,
      ),
      itemCount: favorites.length,
      itemBuilder: (ctx, i) {
        final ad = favorites[i];
        return Stack(children: [
          AdCard(ad: ad),
          Positioned(
            top: 8, right: 8,
            child: GestureDetector(
              onTap: () => adProvider.toggleFavorite(ad),
              child: Container(
                width: 30, height: 30,
                decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4)],
                ),
                child: const Icon(Icons.favorite_rounded, size: 16, color: Colors.red),
              ),
            ),
          ),
        ]);
      },
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          width: 100, height: 100,
          decoration: BoxDecoration(
            color: AppTheme.primaryColor.withValues(alpha: 0.08),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.favorite_border_rounded, size: 48, color: AppTheme.primaryColor),
        ),
        const SizedBox(height: 24),
        Text(context.l10n.t('Favorites.empty'), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Text(
          context.l10n.t('Favorites.emptyDesc'),
          textAlign: TextAlign.center,
          style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), height: 1.5),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: () => context.go('/search'),
          child: Text(context.l10n.t('HomePage.searchButton'), style: const TextStyle(fontWeight: FontWeight.w700)),
        ),
      ]),
    );
  }
}
