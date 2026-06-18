import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/ad_provider.dart';
import '../../core/models/user.dart';
import '../../core/services/api_service.dart';
import '../../core/localization/locale_provider.dart';
import '../../shared/widgets/ad_card.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_badge.dart';
import '../../shared/widgets/shimmer_grid.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _myAdsScrollCtrl = ScrollController();
  bool _myAdsInitialized = false;
  int _reviewCount = 0;
  bool _reviewCountLoaded = false;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    _myAdsScrollCtrl.addListener(_onMyAdsScroll);
  }

  Future<void> _loadReviewCount() async {
    final user = context.read<AuthProvider>().currentUser;
    if (user == null) return;
    try {
      final result = await ApiService.getReviewsWithPagination(user.id, limit: 1);
      if (mounted) setState(() { _reviewCount = result['total'] as int; _reviewCountLoaded = true; });
    } catch (_) {
      if (mounted) setState(() => _reviewCountLoaded = true);
    }
  }

  void _onMyAdsScroll() {
    final provider = context.read<AdProvider>();
    if (_myAdsScrollCtrl.position.pixels >= _myAdsScrollCtrl.position.maxScrollExtent - 400
        && !provider.isLoadingMoreMyAds && provider.hasMoreMyAds) {
      final user = context.read<AuthProvider>().currentUser;
      if (user != null) provider.loadMoreMyAds(user.id);
    }
  }

  @override
  void dispose() {
    _myAdsScrollCtrl.removeListener(_onMyAdsScroll);
    _myAdsScrollCtrl.dispose();
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (ctx, auth, _) {
        if (!auth.isAuthenticated) return _buildGuestView();
        return _buildProfileView(auth.currentUser!);
      },
    );
  }

  Widget _buildGuestView() {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Container(
                width: 110, height: 110,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.primaryColor.withValues(alpha: 0.15), AppTheme.primaryColor.withValues(alpha: 0.05)],
                  ),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.person_outline_rounded, size: 56, color: AppTheme.primaryColor),
              ),
              const SizedBox(height: 28),
              Text(context.l10n.t('Navigation.profile'),
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface)),
              const SizedBox(height: 10),
              Text(
                context.l10n.t('Profile.guestView'),
                textAlign: TextAlign.center,
                style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), height: 1.6, fontSize: 14),
              ),
              const SizedBox(height: 36),
              AppButton(label: context.l10n.t('Navigation.login'), onPressed: () => context.push('/login')),
              const SizedBox(height: 12),
              AppButton(label: context.l10n.t('Auth.createAccount'), onPressed: () => context.push('/register'), variant: AppButtonVariant.outline),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileView(UserModel user) {
    if (!_reviewCountLoaded) _loadReviewCount();
    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (ctx, _) => [
          SliverToBoxAdapter(child: _buildProfileHeader(user)),
          SliverToBoxAdapter(child: _buildStatsRow()),
          SliverPersistentHeader(
            pinned: true,
            delegate: _TabBarDelegate(
              TabBar(
                controller: _tabs,
                labelColor: AppTheme.primaryColor,
                unselectedLabelColor: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55),
                indicatorColor: AppTheme.primaryColor,
                indicatorWeight: 3,
                labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w400, fontSize: 14),
                tabs: [Tab(text: context.l10n.t('Profile.myAds')), Tab(text: context.l10n.t('Profile.settings'))],
              ),
            ),
          ),
        ],
        body: TabBarView(controller: _tabs, children: [
          _buildMyAdsTab(user),
          _buildSettingsTab(user),
        ]),
      ),
    );
  }

  Widget _buildProfileHeader(UserModel user) {
    return Stack(
      children: [
        Container(
          height: 120,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [AppTheme.primaryColor, AppTheme.primaryColor],
            ),
          ),
        ),
        Container(
          color: Theme.of(context).cardColor,
          margin: const EdgeInsets.only(top: 80),
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: Column(children: [
            Stack(children: [
              Container(
                width: 96, height: 96,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Theme.of(context).colorScheme.surface, width: 4),
                  boxShadow: AppTheme.shadowMd,
                ),
                child: ClipOval(
                  child: user.image != null && user.image!.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: user.image!,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(color: Theme.of(context).scaffoldBackgroundColor),
                          errorWidget: (_, __, ___) => _AvatarFallback(user.name),
                        )
                      : _AvatarFallback(user.name),
                ),
              ),
              Positioned(
                bottom: 0, right: 0,
                child: Container(
                  width: 28, height: 28,
                  decoration: const BoxDecoration(color: AppTheme.primaryColor, shape: BoxShape.circle),
                  child: const Icon(Icons.camera_alt_rounded, size: 15, color: Colors.white),
                ),
              ),
            ]),
            const SizedBox(height: 14),
            Text(user.name,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
            const SizedBox(height: 4),
            Text(user.email,
              style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
            if (user.wilaya != null && user.wilaya!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.location_on_outlined, size: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                const SizedBox(width: 4),
                Text(user.wilaya!, style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), fontSize: 13)),
              ]),
            ],
            const SizedBox(height: 8),
            AppBadge(label: context.l10n.t('Profile.verified'), variant: AppBadgeVariant.green, icon: Icons.verified_rounded),
          ]),
        ),
      ],
    );
  }

  Widget _buildStatsRow() {
    return Consumer<AdProvider>(
      builder: (ctx, provider, _) {
        final userAds = provider.myAds;
        final totalViews = userAds.fold<int>(0, (sum, ad) => sum + ad.viewCount);
        return Container(
          color: Theme.of(context).cardColor,
          padding: const EdgeInsets.symmetric(vertical: 16),
          margin: const EdgeInsets.only(top: 1),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
            _StatItem('${userAds.length}', context.l10n.t('Profile.ads')),
            _VertDivider(),
            _StatItem('$totalViews', context.l10n.t('Profile.views')),
            _VertDivider(),
            _StatItem('$_reviewCount', context.l10n.t('Profile.reviews')),
          ]),
        );
      },
    );
  }

  Widget _buildMyAdsTab(UserModel user) {
    return Consumer<AdProvider>(
      builder: (ctx, provider, _) {
        if (!_myAdsInitialized && provider.myAds.isEmpty && !provider.isLoadingMyAds) {
          _myAdsInitialized = true;
          WidgetsBinding.instance.addPostFrameCallback((_) {
            provider.fetchMyAds(user.id);
          });
        }

        if (provider.isLoadingMyAds && provider.myAds.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Column(children: [
              Expanded(child: ShimmerGridBox(itemCount: 4)),
            ]),
          );
        }

        final myAds = provider.myAds;

        if (myAds.isEmpty) {
          return SingleChildScrollView(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Container(
                    width: 80, height: 80,
                    decoration: BoxDecoration(
                      color: Theme.of(context).scaffoldBackgroundColor,
                      borderRadius: BorderRadius.circular(AppTheme.radiusXl),
                    ),
                    child: Icon(Icons.inventory_2_outlined, size: 40, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                  ),
                  const SizedBox(height: 16),
                  Text(context.l10n.t('Profile.noAds'),
                    style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Text(context.l10n.t('Profile.noAdsDesc'),
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), fontSize: 13)),
                  const SizedBox(height: 20),
                  AppButton(
                    label: context.l10n.t('Profile.publishAd'),
                    onPressed: () => context.push('/create-ad'),
                    icon: Icons.add_rounded,
                  ),
                ]),
              ),
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            _myAdsInitialized = false;
            await provider.fetchMyAds(user.id);
          },
          child: GridView.builder(
            controller: _myAdsScrollCtrl,
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.72,
            ),
            itemCount: myAds.length + (provider.isLoadingMoreMyAds ? 1 : 0),
            itemBuilder: (ctx, i) {
              if (i == myAds.length) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                );
              }
              return AdCard(ad: myAds[i]);
            },
          ),
        );
      },
    );
  }

  Widget _buildSettingsTab(UserModel user) {
    return ListView(padding: const EdgeInsets.all(16), children: [
      _SettingsSection(context.l10n.t('Profile.sectionAccount'), [
        _SettingsItem(Icons.person_outline_rounded, context.l10n.t('Profile.editProfile'), () => context.push('/edit-profile')),
        _SettingsItem(Icons.lock_outline_rounded, context.l10n.t('Profile.changePassword'), () => context.push('/change-password')),
        _SettingsItem(Icons.phone_outlined, context.l10n.t('Profile.phone'), () => context.push('/phone-number')),
      ]),
      const SizedBox(height: 16),
      _SettingsSection(context.l10n.t('Profile.sectionPreferences'), [
        _SettingsItem(Icons.notifications_outlined, context.l10n.t('Profile.notifications'), () => context.push('/notifications-settings')),
        _SettingsItem(Icons.language_rounded, context.l10n.t('Profile.language'), () => _showLanguagePicker()),
      ]),
      const SizedBox(height: 16),
      _SettingsSection(context.l10n.t('Profile.sectionHelp'), [
        _SettingsItem(Icons.help_outline_rounded, context.l10n.t('Profile.help'), () => context.push('/help-support')),
        _SettingsItem(Icons.info_outline_rounded, context.l10n.t('Profile.about'), () => context.push('/about')),
      ]),
      const SizedBox(height: 24),
      AppButton(
        label: context.l10n.t('Navigation.logout'),
        onPressed: () async {
          final auth = context.read<AuthProvider>();
          await auth.logout();
        },
        variant: AppButtonVariant.danger,
        icon: Icons.logout_rounded,
      ),
      const SizedBox(height: 40),
    ]);
  }

  void _showLanguagePicker() {
    final localeProvider = context.read<LocaleProvider>();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(context.l10n.t('Profile.languagePicker'), textAlign: TextAlign.center),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Container(
                width: 40, height: 40,
                decoration: BoxDecoration(
                  color: localeProvider.locale.languageCode == 'fr'
                      ? AppTheme.primaryColor.withValues(alpha: 0.1)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(child: Text('🇫🇷', style: TextStyle(fontSize: 22))),
              ),
              title: Text(context.l10n.t('Profile.french'), style: const TextStyle(fontWeight: FontWeight.w600)),
              trailing: localeProvider.locale.languageCode == 'fr'
                  ? const Icon(Icons.check, color: AppTheme.primaryColor)
                  : null,
              onTap: () { localeProvider.setLocale(const Locale('fr')); Navigator.pop(ctx); },
            ),
            const Divider(),
            ListTile(
              leading: Container(
                width: 40, height: 40,
                decoration: BoxDecoration(
                  color: localeProvider.locale.languageCode == 'ar'
                      ? AppTheme.primaryColor.withValues(alpha: 0.1)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(child: Text('🇩🇿', style: TextStyle(fontSize: 22))),
              ),
              title: Text(context.l10n.t('Profile.arabic'), style: const TextStyle(fontWeight: FontWeight.w600)),
              trailing: localeProvider.locale.languageCode == 'ar'
                  ? const Icon(Icons.check, color: AppTheme.primaryColor)
                  : null,
              onTap: () { localeProvider.setLocale(const Locale('ar')); Navigator.pop(ctx); },
            ),
          ],
        ),
      ),
    );
  }
}

class _AvatarFallback extends StatelessWidget {
  final String name;
  const _AvatarFallback(this.name);
  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppTheme.primaryColor.withValues(alpha: 0.15),
      child: Center(
        child: Text(
          name.isNotEmpty ? name[0].toUpperCase() : '?',
          style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: AppTheme.primaryColor),
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value, label;
  const _StatItem(this.value, this.label);
  @override
  Widget build(BuildContext context) => Column(children: [
    Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.primaryColor)),
    const SizedBox(height: 2),
    Text(label, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
  ]);
}

class _VertDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(width: 1, height: 40, color: Theme.of(context).dividerColor);
}

class _SettingsSection extends StatelessWidget {
  final String title;
  final List<Widget> items;
  const _SettingsSection(this.title, this.items);
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(title,
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), letterSpacing: 0.8)),
      ),
      Container(
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(color: Theme.of(context).dividerColor),
        ),
        child: Column(children: [
          for (int i = 0; i < items.length; i++) ...[
            items[i],
            if (i < items.length - 1) const Divider(height: 1, indent: 52),
          ],
        ]),
      ),
    ],
  );
}

class _SettingsItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _SettingsItem(this.icon, this.label, this.onTap);
  @override
  Widget build(BuildContext context) => ListTile(
    leading: Container(
      width: 36, height: 36,
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(icon, color: Theme.of(context).colorScheme.onSurface, size: 20),
    ),
    title: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
    trailing: Icon(Icons.chevron_right_rounded, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), size: 20),
    onTap: onTap,
    dense: true,
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
  );
}

class _TabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar _tabBar;
  const _TabBarDelegate(this._tabBar);
  @override double get minExtent => _tabBar.preferredSize.height;
  @override double get maxExtent => _tabBar.preferredSize.height;
  @override Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Theme.of(context).cardColor,
      child: _tabBar,
    );
  }
  @override bool shouldRebuild(_) => false;
}
