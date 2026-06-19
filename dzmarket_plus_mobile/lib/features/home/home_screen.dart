import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/ad.dart';
import '../../core/providers/ad_provider.dart';
import '../../core/providers/notification_provider.dart';
import '../../core/localization/app_localizations.dart';
import '../../shared/widgets/ad_card.dart';
import '../../shared/widgets/app_section_header.dart';
import '../../shared/widgets/app_chip.dart';
import '../../shared/widgets/shimmer_grid.dart';
import '../../core/data/algeria_locations.dart';

const _categories = [
  _Cat('Voitures', 'Véhicules', 'Voitures', Icons.directions_car_rounded, Color(0xFFDBEAFE), Color(0xFF2563EB)),
  _Cat('Immobilier', 'Immobilier', '', Icons.home_rounded, Color(0xFFD1FAE5), Color(0xFF059669)),
  _Cat('Téléphones', 'Informatique & Multimédia', 'Téléphones', Icons.smartphone_rounded, Color(0xFFEDE9FE), Color(0xFF7C3AED)),
  _Cat('Multimédia', 'Informatique & Multimédia', '', Icons.monitor_rounded, Color(0xFFFEE2E2), Color(0xFFDC2626)),
  _Cat('Mode', 'Mode & Beauté', '', Icons.checkroom_rounded, Color(0xFFFCE7F3), Color(0xFFDB2777)),
  _Cat('Emploi', 'Services & Emploi', '', Icons.work_rounded, Color(0xFFFFEDD5), Color(0xFFEA580C)),
  _Cat('Services', 'Services & Emploi', '', Icons.build_rounded, Color(0xFFFEF9C3), Color(0xFFCA8A04)),
  _Cat('Animaux', 'Animaux', '', Icons.pets_rounded, Color(0xFFCCFBF1), Color(0xFF0D9488)),
  _Cat('Loisirs', 'Loisirs & Divertissement', '', Icons.sports_soccer_rounded, Color(0xFFE0E7FF), Color(0xFF4338CA)),
  _Cat('Autres', 'Autres', '', Icons.more_horiz_rounded, Color(0xFFF3F4F6), Color(0xFF6B7280)),
];

final _mockAds = [
  Ad(id: '1', title: 'iPhone 14 Pro 128GB - Noir', price: 180000, wilaya: 'Alger',
     category: 'Informatique & Multimédia', images: ['https://picsum.photos/seed/ph1/400/300'],
     description: 'Excellent état.', userId: 'u1', userName: 'Mohamed A.',
     createdAt: DateTime.now().subtract(const Duration(hours: 3)), isNegotiable: true),
  Ad(id: '2', title: 'Appartement F3 Hauts d\'Alger', price: 25000000, wilaya: 'Alger',
     category: 'Immobilier', images: ['https://picsum.photos/seed/apt1/400/300'],
     description: '75m².', userId: 'u2', userName: 'Fatima B.',
     createdAt: DateTime.now().subtract(const Duration(days: 1))),
  Ad(id: '3', title: 'Toyota Corolla 2020', price: 3800000, wilaya: 'Oran',
     category: 'Véhicules', images: ['https://picsum.photos/seed/car1/400/300'],
     description: '85 000 km.', userId: 'u3', userName: 'Karim D.',
     createdAt: DateTime.now().subtract(const Duration(hours: 8)), isNegotiable: true),
  Ad(id: '4', title: 'Canapé d\'angle en cuir', price: 65000, wilaya: 'Constantine',
     category: 'Maison & Jardin', images: ['https://picsum.photos/seed/sofa1/400/300'],
     description: 'Très bon état.', userId: 'u4', userName: 'Amina K.',
     createdAt: DateTime.now().subtract(const Duration(days: 2))),
];

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _searchCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  String _wilaya = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdProvider>().fetchRecentAds();
      context.read<NotificationProvider>().fetchUnreadCount();
    });
    _scrollCtrl.addListener(_onScroll);
  }

  void _onScroll() {
    final provider = context.read<AdProvider>();
    if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 400
        && !provider.isLoadingMore && provider.hasMore) {
      provider.loadMoreAds();
    }
  }

  @override
  void dispose() {
    _scrollCtrl.removeListener(_onScroll);
    _scrollCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _search() {
    final q = Uri.encodeComponent(_searchCtrl.text.trim());
    final w = Uri.encodeComponent(_wilaya);
    context.go('/search?query=$q&wilaya=$w');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () => context.read<AdProvider>().fetchRecentAds(),
        child: CustomScrollView(
          controller: _scrollCtrl,
          slivers: [
            SliverAppBar(
              floating: true,
              snap: true,
              elevation: 0,
              backgroundColor: Theme.of(context).colorScheme.surface,
              title: _buildLogo(),
              actions: [
                Consumer<NotificationProvider>(
                  builder: (ctx, np, _) {
                    return Stack(
                      children: [
                        IconButton(
                          icon: Icon(Icons.notifications_outlined, color: Theme.of(context).colorScheme.onSurface),
                          onPressed: () => context.push('/notifications'),
                        ),
                        if (np.unreadCount > 0)
                          Positioned(
                            right: 8,
                            top: 8,
                            child: Container(
                              width: 16,
                              height: 16,
                              decoration: const BoxDecoration(
                                color: AppTheme.redColor,
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                  child: Text(
                                    np.unreadCount > 9 ? '9+' : '${np.unreadCount}',
                                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                              ),
                            ),
                          ),
                      ],
                    );
                  },
                ),
              ],
            ),
            SliverToBoxAdapter(child: _buildHero()),
            SliverToBoxAdapter(child: AppSectionHeader(title: context.l10n.t('HomePage.categories'), actionLabel: context.l10n.t('HomePage.viewAll'), actionIcon: Icons.arrow_forward_ios, onActionTap: () => context.go('/search'))),
            SliverToBoxAdapter(child: _buildCategories()),
            SliverToBoxAdapter(child: AppSectionHeader(title: context.l10n.t('HomePage.trending'), actionLabel: context.l10n.t('HomePage.viewAll'), actionIcon: Icons.arrow_forward_ios, onActionTap: () => context.go('/search'))),
            SliverToBoxAdapter(child: _buildTrendingAds()),
            SliverToBoxAdapter(child: AppSectionHeader(title: context.l10n.t('HomePage.recommended'), actionLabel: context.l10n.t('HomePage.viewAll'), actionIcon: Icons.arrow_forward_ios, onActionTap: () => context.go('/search'))),
            _buildRecommendedGrid(),
            _buildLoadingMoreIndicator(),
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: AppTheme.yellowColor,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Center(
            child: Text('D', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF1A1A1A))),
          ),
        ),
        const SizedBox(width: 8),
        Text('DZ ', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface)),
        Text('Market', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface)),
        const Text('+', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.yellowColor)),
      ],
    );
  }

  Widget _buildHero() {
    final wilayas = algerianWilayas.map((w) => w.name).toList();
    const chips = ['Voitures', 'Immobilier', 'Téléphones', 'Meubles'];

    final surface = Theme.of(context).colorScheme.surface;
    return Container(
      decoration: BoxDecoration(gradient: LinearGradient(
        begin: Alignment.topCenter, end: Alignment.bottomCenter,
        colors: [const Color(0xFFEFF6FF), surface],
      )),
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 16),
      child: Column(children: [
        Text(context.l10n.t('HomePage.heroTitle'),
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface, height: 1.25)),
        const SizedBox(height: 8),
        Text(context.l10n.t('HomePage.heroSubtitle'),
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
        const SizedBox(height: 20),
        Container(
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(AppTheme.radiusXl),
            border: Border.all(color: Theme.of(context).dividerColor),
            boxShadow: [BoxShadow(color: Colors.blue.withValues(alpha: 0.08), blurRadius: 20, offset: const Offset(0, 6))],
          ),
          padding: const EdgeInsets.all(12),
          child: Column(children: [
            Row(children: [
              Icon(Icons.search_rounded, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), size: 22),
              const SizedBox(width: 10),
              Expanded(child: TextField(
                controller: _searchCtrl,
                  decoration: InputDecoration(
                    hintText: context.l10n.t('HomePage.searchPlaceholder'),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    hintStyle: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), fontSize: 15),
                  ),
                style: const TextStyle(fontSize: 15),
                onSubmitted: (_) => _search(),
              )),
            ]),
            Divider(height: 16, color: Theme.of(context).dividerColor),
            Row(children: [
              Icon(Icons.location_on_outlined, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), size: 20),
              const SizedBox(width: 10),
              Expanded(child: DropdownButtonHideUnderline(child: DropdownButton<String>(
                value: _wilaya.isEmpty ? null : _wilaya,
                hint: Text(context.l10n.t('Ads.allAlgeria'), style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), fontSize: 14)),
                isExpanded: true, isDense: true,
                style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface),
                items: [
                  DropdownMenuItem(value: '', child: Text(context.l10n.t('Ads.allAlgeria'))),
                  ...wilayas.map((w) => DropdownMenuItem(value: w, child: Text(w))),
                ],
                onChanged: (v) => setState(() => _wilaya = v ?? ''),
              ))),
            ]),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _search,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.yellowColor,
                  foregroundColor: const Color(0xFF1A1A1A),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                  elevation: 0,
                ),
                child: Text(context.l10n.t('HomePage.searchButton'), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
              ),
            ),
          ]),
        ),
        const SizedBox(height: 14),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(children: chips.map((c) => Padding(
            padding: const EdgeInsets.only(right: 8),
            child: AppChip(
              label: c,
              onTap: () => context.go('/search?category=${Uri.encodeComponent(c)}'),
            ),
          )).toList()),
        ),
      ]),
    );
  }

  Widget _buildCategories() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: _categories.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 5,
          crossAxisSpacing: 8,
          mainAxisSpacing: 12,
          childAspectRatio: 0.65,
        ),
        itemBuilder: (ctx, i) {
          final cat = _categories[i];
          return GestureDetector(
            onTap: () {
              var uri = '/search?category=${Uri.encodeComponent(cat.dbCategory)}';
              if (cat.subcategory.isNotEmpty) {
                uri += '&subcategory=${Uri.encodeComponent(cat.subcategory)}';
              }
              context.go(uri);
            },
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: cat.bg,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                child: Icon(cat.icon, color: cat.fg, size: 22),
              ),
              const SizedBox(height: 6),
              Text(cat.name,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: Theme.of(context).colorScheme.onSurface),
                maxLines: 2, overflow: TextOverflow.ellipsis),
            ]),
          );
        },
      ),
    );
  }

  Widget _buildTrendingAds() {
    return SizedBox(height: 260, child: Consumer<AdProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }
        final ads = provider.recentAds.isNotEmpty ? provider.recentAds : _mockAds;
        return ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          scrollDirection: Axis.horizontal,
          itemCount: ads.length,
          itemBuilder: (ctx, i) => SizedBox(
            width: 190,
            child: Padding(
              padding: const EdgeInsets.only(right: 12),
              child: AdCard(ad: ads[i]),
            ),
          ),
        );
      },
    ));
  }

  Widget _buildRecommendedGrid() {
    return Consumer<AdProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading && provider.recentAds.isEmpty) {
          return ShimmerGrid(itemCount: 4);
        }
        if (provider.error != null && provider.recentAds.isEmpty) {
          return SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(children: [
                Icon(Icons.wifi_off_rounded, size: 48, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                const SizedBox(height: 12),
                Text('${context.l10n.t('Common.error')}: ${provider.error}',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => context.read<AdProvider>().fetchRecentAds(),
                  child: Text(context.l10n.t('Common.retry')),
                ),
              ]),
            ),
          );
        }
        final ads = provider.recentAds.reversed.toList();
        final displayAds = ads.isNotEmpty ? ads : _mockAds;
        if (displayAds.isEmpty) {
          return SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Center(child: Text(context.l10n.t('Profile.noAds'),
                style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
              ),
            ),
          );
        }
        return SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          sliver: SliverGrid(
            delegate: SliverChildBuilderDelegate(
              (ctx, i) => AdCard(ad: displayAds[i]),
              childCount: displayAds.length,
            ),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.72,
            ),
          ),
        );
      },
    );
  }

  Widget _buildLoadingMoreIndicator() {
    return Consumer<AdProvider>(
      builder: (context, provider, child) {
        if (!provider.isLoadingMore) return const SliverToBoxAdapter(child: SizedBox.shrink());
        return const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
          ),
        );
      },
    );
  }
}

class _Cat {
  final String name; final String dbCategory; final String subcategory; final IconData icon; final Color bg; final Color fg;
  const _Cat(this.name, this.dbCategory, this.subcategory, this.icon, this.bg, this.fg);
}
