import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/models/ad.dart';
import '../../core/services/api_service.dart';
import '../../shared/widgets/ad_card.dart';
import '../../shared/widgets/app_badge.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/review_card.dart';

class SellerProfileScreen extends StatefulWidget {
  final String userId;
  const SellerProfileScreen({super.key, required this.userId});

  @override
  State<SellerProfileScreen> createState() => _SellerProfileScreenState();
}

class _SellerProfileScreenState extends State<SellerProfileScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  late Future<Map<String, dynamic>> _profileFuture;
  late Future<List<Map<String, dynamic>>> _reviewsFuture;

  List<Ad> _sellerAds = [];
  int _sellerAdsPage = 1;
  bool _hasMoreSellerAds = true;
  bool _isLoadingSellerAds = false;
  bool _isLoadingMoreSellerAds = false;
  final _sellerAdsScrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _sellerAdsScrollCtrl.addListener(_onSellerAdsScroll);
    _loadData();
  }

  void _onSellerAdsScroll() {
    if (_sellerAdsScrollCtrl.position.pixels >=
            _sellerAdsScrollCtrl.position.maxScrollExtent - 400 &&
        !_isLoadingMoreSellerAds &&
        _hasMoreSellerAds) {
      _loadMoreSellerAds();
    }
  }

  void _loadData() {
    setState(() {
      _sellerAds = [];
      _sellerAdsPage = 1;
      _hasMoreSellerAds = true;
      _isLoadingSellerAds = true;
      _profileFuture = ApiService.getUserProfile(widget.userId);
      _reviewsFuture = ApiService.getUserReviews(widget.userId);
    });
    _fetchSellerAds();
  }

  Future<void> _fetchSellerAds() async {
    try {
      final ads = await ApiService.getAdsBySeller(widget.userId, page: _sellerAdsPage);
      if (!mounted) return;
      setState(() {
        _sellerAds.addAll(ads);
        _hasMoreSellerAds = ads.length >= 20;
        _isLoadingSellerAds = false;
        _isLoadingMoreSellerAds = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoadingSellerAds = false;
        _isLoadingMoreSellerAds = false;
      });
    }
  }

  Future<void> _loadMoreSellerAds() async {
    if (_isLoadingMoreSellerAds || !_hasMoreSellerAds) return;
    setState(() => _isLoadingMoreSellerAds = true);
    _sellerAdsPage++;
    await _fetchSellerAds();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _sellerAdsScrollCtrl.dispose();
    super.dispose();
  }

  void _showCallDialog(String? phone) {
    if (phone == null || phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.t('Profile.noPhone'))),
      );
      return;
    }

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppTheme.radius2xl)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(context.l10n.t('Ads.contact'),
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                decoration: BoxDecoration(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  border: Border.all(color: Theme.of(context).dividerColor),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.phone_rounded, color: AppTheme.primaryColor, size: 28),
                    const SizedBox(width: 12),
                    Text(phone,
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface)),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: context.l10n.t('Profile.copy'),
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: phone));
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(context.l10n.t('Profile.copied'))),
                        );
                        Navigator.pop(context);
                      },
                      variant: AppButtonVariant.outline,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AppButton(
                      label: context.l10n.t('Ads.call'),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('${context.l10n.t('Ads.call')} $phone...')),
                        );
                        Navigator.pop(context);
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  void _showAddReviewSheet(String sellerName, List<Ad> sellerAds) {
    final commentCtrl = TextEditingController();
    int selectedRating = 5;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppTheme.radius2xl)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(context.l10n.t('Profile.leaveReviewOn', params: [sellerName]),
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      return IconButton(
                        icon: Icon(
                          index < selectedRating ? Icons.star_rounded : Icons.star_border_rounded,
                          color: AppTheme.yellowColor,
                          size: 36,
                        ),
                        onPressed: () => setSheetState(() => selectedRating = index + 1),
                      );
                    }),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: commentCtrl,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: context.l10n.t('Profile.reviewPlaceholder'),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                      contentPadding: const EdgeInsets.all(16),
                    ),
                  ),
                  const SizedBox(height: 20),
                  AppButton(
                    label: context.l10n.t('Profile.submitReview'),
                    onPressed: () async {
                      final comment = commentCtrl.text.trim();
                      if (comment.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(context.l10n.t('Profile.reviewError'))),
                        );
                        return;
                      }
                      Navigator.pop(context);
                      showDialog(context: context, barrierDismissible: false, builder: (_) => const Center(child: CircularProgressIndicator()));

                      try {
                        final adId = sellerAds.isNotEmpty ? sellerAds.first.id : 'default';
                        await ApiService.submitReview(
                          targetUserId: widget.userId,
                          adId: adId,
                          rating: selectedRating,
                          comment: comment,
                        );
                        if (mounted) {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(context.l10n.t('Profile.reviewSubmitted'))),
                          );
                          _loadData();
                        }
                      } catch (e) {
                        if (mounted) {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${context.l10n.t('Common.error')}: $e')));
                        }
                      }
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _profileFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }
        if (snapshot.hasError || !snapshot.hasData) {
          return Scaffold(
            appBar: AppBar(leading: const BackButton()),
            body: Center(child: Text('${context.l10n.t('Common.error')}: ${snapshot.error}')),
          );
        }

        final profileData = snapshot.data!;
        final user = profileData['user'] ?? {};
        final stats = profileData['stats'] ?? {};
        final userName = user['name'] ?? context.l10n.t('Profile.unknownUser');
        final userImage = user['image'];
        final userEmail = user['email'] ?? '';
        final userWilaya = user['wilaya'] ?? context.l10n.t('Profile.notSpecified');
        final userBio = user['bio'] ?? '';
        final createdAtStr = user['createdAt'] != null
            ? DateTime.tryParse(user['createdAt'])?.year.toString() ?? '2024'
            : '2024';

        final avgRating = (stats['averageRating'] ?? 0.0).toDouble();
        final totalReviews = stats['totalReviews'] ?? 0;
        final totalAds = stats['totalAds'] ?? 0;

        return Scaffold(
          appBar: AppBar(
            backgroundColor: Theme.of(context).colorScheme.surface,
            elevation: 0,
            leading: IconButton(
              icon: Icon(Icons.arrow_back_rounded, color: Theme.of(context).colorScheme.onSurface),
              onPressed: () => context.pop(),
            ),
            title: Text(context.l10n.t('Ads.seller'),
              style: TextStyle(color: Theme.of(context).colorScheme.onSurface, fontWeight: FontWeight.bold)),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(1),
              child: Container(height: 1, color: Theme.of(context).dividerColor),
            ),
          ),
          body: NestedScrollView(
            headerSliverBuilder: (context, innerBoxIsScrolled) {
              return [
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      Stack(
                        children: [
                          Container(
                            height: 80,
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
                            margin: const EdgeInsets.only(top: 50),
                            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Center(
                                  child: Stack(
                                    children: [
                                      CircleAvatar(
                                        radius: 48,
                                        backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                                        backgroundImage: userImage != null ? CachedNetworkImageProvider(userImage) : null,
                                        child: userImage == null
                                            ? Text(
                                                userName.isNotEmpty ? userName[0].toUpperCase() : 'U',
                                                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                                              )
                                            : null,
                                      ),
                                      Positioned(
                                        bottom: 0, right: 0,
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: const BoxDecoration(color: AppTheme.greenColor, shape: BoxShape.circle),
                                          child: const Icon(Icons.check_rounded, size: 14, color: Colors.white),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Text(userName,
                                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onSurface)),
                                if (userEmail.isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Text(userEmail,
                                    style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                                ],
                                const SizedBox(height: 8),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.location_on_outlined, size: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                                    const SizedBox(width: 4),
                                    Text(userWilaya,
                                      style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                                    const SizedBox(width: 12),
                                    Icon(Icons.calendar_month_outlined, size: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                                    const SizedBox(width: 4),
                                    Text('${context.l10n.t('Profile.memberSince')} $createdAtStr',
                                      style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                                  ],
                                ),
                                if (userBio.isNotEmpty) ...[
                                  const SizedBox(height: 12),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 16),
                                    child: Text(userBio,
                                      style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface, height: 1.4),
                                      textAlign: TextAlign.center, maxLines: 3, overflow: TextOverflow.ellipsis),
                                  ),
                                ],
                                const SizedBox(height: 16),
                                Wrap(
                                  spacing: 8, runSpacing: 8, alignment: WrapAlignment.center,
                                  children: [
                                    AppBadge(label: context.l10n.t('Profile.sellerVerified'), variant: AppBadgeVariant.blue, icon: Icons.verified_user_outlined),
                                    if (avgRating >= 4.5)
                                      AppBadge(label: context.l10n.t('Profile.excellent'), variant: AppBadgeVariant.yellow, icon: Icons.star_rounded),
                                  ],
                                ),
                                const SizedBox(height: 20),
                                Container(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  decoration: BoxDecoration(
                                    color: Theme.of(context).scaffoldBackgroundColor,
                                    borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                                    border: Border.all(color: Theme.of(context).dividerColor),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                    children: [
                                      _StatItem('$totalAds', context.l10n.t('Profile.statsAds')),
                                      Container(width: 1, height: 32, color: Theme.of(context).dividerColor),
                                      _StatItem('$totalReviews', context.l10n.t('Profile.statsReviews')),
                                      Container(width: 1, height: 32, color: Theme.of(context).dividerColor),
                                      _StatItem(
                                        avgRating > 0 ? avgRating.toStringAsFixed(1) : '-',
                                        context.l10n.t('Profile.statsRating'),
                                        icon: avgRating > 0 ? Icons.star_rounded : null,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _SliverAppBarDelegate(
                    TabBar(
                      controller: _tabController,
                      labelColor: AppTheme.primaryColor,
                      unselectedLabelColor: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55),
                      indicatorColor: AppTheme.primaryColor,
                      indicatorWeight: 3,
                      labelStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      tabs: [
                        Tab(text: '${context.l10n.t('Profile.tabAds')} ($totalAds)'),
                        Tab(text: '${context.l10n.t('Profile.tabReviews')} ($totalReviews)'),
                      ],
                    ),
                  ),
                ),
              ];
            },
            body: TabBarView(
              controller: _tabController,
              children: [
                _buildAdsTab(),
                _buildReviewsTab(userName, avgRating, totalReviews, stats['ratingBreakdown'] ?? {}, _sellerAds),
              ],
            ),
          ),
          bottomNavigationBar: Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              border: Border(top: BorderSide(color: Theme.of(context).dividerColor)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: AppButton(
                  label: context.l10n.t('Ads.call'),
                    onPressed: () => _showCallDialog(user['phone']),
                    variant: AppButtonVariant.outline,
                    icon: Icons.phone_rounded,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: AppButton(
                    label: context.l10n.t('Ads.contact'),
                    onPressed: () => context.push('/messages?partner=$userName'),
                    icon: Icons.chat_bubble_rounded,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildAdsTab() {
    if (_isLoadingSellerAds && _sellerAds.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_sellerAds.isEmpty) {
      return Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.inventory_2_outlined, size: 64, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5)),
          const SizedBox(height: 12),
          Text(context.l10n.t('Profile.noAds'),
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
        ]),
      );
    }
    return RefreshIndicator(
      onRefresh: () async => _loadData(),
      child: GridView.builder(
        controller: _sellerAdsScrollCtrl,
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.72,
        ),
        itemCount: _sellerAds.length + (_isLoadingMoreSellerAds ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == _sellerAds.length) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
            );
          }
          return AdCard(ad: _sellerAds[index], showWilaya: true);
        },
      ),
    );
  }

  Widget _buildReviewsTab(String sellerName, double avgRating, int totalReviews, Map<String, dynamic> ratingBreakdown, List<Ad> sellerAds) {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _reviewsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('${context.l10n.t('Common.error')}: ${snapshot.error}'));
        }

        final reviews = snapshot.data ?? [];
        final ratingCounts = <int, int>{};
        for (int i = 1; i <= 5; i++) {
          ratingCounts[i] = (ratingBreakdown[i.toString()] ?? 0) as int;
        }

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            RatingBreakdown(
              averageRating: avgRating,
              ratingCounts: ratingCounts,
              totalReviews: totalReviews,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(context.l10n.t('Profile.buyerComments'),
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onSurface)),
                TextButton.icon(
                  onPressed: () => _showAddReviewSheet(sellerName, sellerAds),
                  icon: const Icon(Icons.rate_review_outlined, size: 18),
                  label: Text(context.l10n.t('Profile.leaveReview')),
                  style: TextButton.styleFrom(foregroundColor: AppTheme.primaryColor),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (reviews.isEmpty)
              Container(
                padding: const EdgeInsets.symmetric(vertical: 40),
                alignment: Alignment.center,
                child: Column(children: [
                  Icon(Icons.rate_review_outlined, size: 48, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.4)),
                  const SizedBox(height: 12),
                  Text(context.l10n.t('Profile.noReviews'), style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), fontSize: 14)),
                ]),
              )
            else
              ...reviews.map((review) {
                final buyer = review['buyer'] ?? {};
                final buyerName = buyer['name'] ?? context.l10n.t('Profile.buyer');
                final buyerImage = buyer['image'];
                final comment = review['comment'] ?? '';
                final rating = (review['rating'] ?? 5).toDouble();
                final ad = review['ad'] ?? {};
                final adTitle = ad['title'] ?? '';
                final dateStr = review['createdAt'] != null
                    ? '${DateTime.tryParse(review['createdAt'])?.day ?? ''}/${DateTime.tryParse(review['createdAt'])?.month ?? ''}/${DateTime.tryParse(review['createdAt'])?.year ?? ''}'
                    : '';
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ReviewCard(
                    userName: buyerName,
                    userImage: buyerImage,
                    rating: rating,
                    comment: comment,
                    date: dateStr,
                    adTitle: adTitle.isNotEmpty ? adTitle : null,
                  ),
                );
              }),
          ],
        );
      },
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  final IconData? icon;
  const _StatItem(this.value, this.label, {this.icon});

  @override
  Widget build(BuildContext context) => Column(children: [
    Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppTheme.primaryColor)),
        if (icon != null) ...[
          const SizedBox(width: 2),
          Icon(icon, size: 16, color: AppTheme.yellowColor),
        ],
      ],
    ),
    const SizedBox(height: 4),
    Text(label, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
  ]);
}

class _SliverAppBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar _tabBar;
  _SliverAppBarDelegate(this._tabBar);

  @override
  double get minExtent => _tabBar.preferredSize.height;
  @override
  double get maxExtent => _tabBar.preferredSize.height;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Theme.of(context).cardColor,
      child: Column(children: [
        const Divider(height: 1),
        _tabBar,
      ]),
    );
  }

  @override
  bool shouldRebuild(_SliverAppBarDelegate oldDelegate) => false;
}
