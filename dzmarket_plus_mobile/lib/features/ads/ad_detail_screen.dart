import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/models/ad.dart';
import '../../core/services/api_service.dart';
import '../../core/providers/chat_provider.dart';
import '../../shared/widgets/app_badge.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/review_card.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

String _conditionLabel(BuildContext context, String? condition) {
  if (condition == null) return context.l10n.t('Profile.notSpecified');
  switch (condition) {
    case 'new': return context.l10n.t('Conditions.new');
    case 'like-new': return context.l10n.t('Conditions.likeNew');
    case 'good': return context.l10n.t('Conditions.good');
    case 'fair': return context.l10n.t('Conditions.fair');
    case 'refurbished': return context.l10n.t('Conditions.refurbished');
    case 'for-parts': return context.l10n.t('Conditions.forParts');
    default: return condition;
  }
}

class AdDetailScreen extends StatefulWidget {
  final String adId;
  const AdDetailScreen({super.key, required this.adId});

  @override
  State<AdDetailScreen> createState() => _AdDetailScreenState();
}

class _AdDetailScreenState extends State<AdDetailScreen> {
  int _currentImage = 0;
  bool _isFav = false;
  late Future<Ad> _adFuture;

  @override
  void initState() {
    super.initState();
    _adFuture = ApiService.getAdById(widget.adId);
  }

  void _showCallBottomSheet(BuildContext context, String? phone, String sellerName) {
    final phoneNumber = phone ?? context.l10n.t('Ads.notProvided');
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppTheme.radius2xl)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                context.l10n.t('Ads.contactSeller', params: [sellerName]),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                decoration: BoxDecoration(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  border: Border.all(color: Theme.of(context).dividerColor),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.phone_rounded, color: AppTheme.primaryColor),
                    const SizedBox(width: 10),
                    Text(
                      phoneNumber,
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onSurface),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: context.l10n.t('Profile.copy'),
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: phoneNumber));
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(context.l10n.t('Profile.copied'))),
                        );
                        Navigator.pop(ctx);
                      },
                      variant: AppButtonVariant.outline,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AppButton(
                      label: context.l10n.t('Ads.call'),
                      onPressed: () async {
                        final cleanPhone = phoneNumber.replaceAll(RegExp(r'[^0-9+]'), '');
                        final url = Uri.parse('tel:$cleanPhone');
                        if (await canLaunchUrl(url)) {
                          await launchUrl(url);
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(context.l10n.t('Profile.callFailed'))),
                          );
                        }
                        Navigator.pop(ctx);
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

  void _showAddReviewDialog(String sellerId, String sellerName) {
    final commentCtrl = TextEditingController();
    int rating = 5;
    final outerContext = context;
    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusXl)),
              title: Text(context.l10n.t('Profile.leaveReviewOn', params: [sellerName])),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      return GestureDetector(
                        onTap: () => setState(() => rating = index + 1),
                        child: Icon(
                          index < rating ? Icons.star_rounded : Icons.star_border_rounded,
                          color: AppTheme.yellowColor,
                          size: 36,
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: commentCtrl,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: context.l10n.t('Profile.writeComment'),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
                      contentPadding: const EdgeInsets.all(12),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: Text(context.l10n.t('Common.cancel'), style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                ),
                AppButton(
                  label: context.l10n.t('Messages.send'),
                  onPressed: () async {
                    final comment = commentCtrl.text.trim();
                    if (comment.isEmpty) return;
                    Navigator.pop(ctx);
                    showDialog(
                      context: outerContext,
                      barrierDismissible: false,
                      builder: (_) => const Center(child: CircularProgressIndicator()),
                    );
                    try {
                      await ApiService.submitReview(
                        targetUserId: sellerId,
                        adId: widget.adId,
                        rating: rating,
                        comment: comment,
                      );
                      if (mounted) {
                        Navigator.pop(outerContext);
                        ScaffoldMessenger.of(outerContext).showSnackBar(
                          SnackBar(content: Text(context.l10n.t('Profile.reviewSubmitted'))),
                        );
                        _adFuture = ApiService.getAdById(widget.adId);
                        _adFuture.then((_) => setState(() {}));
                      }
                    } catch (e) {
                      if (mounted) {
                        Navigator.pop(outerContext);
                        ScaffoldMessenger.of(outerContext).showSnackBar(
                          SnackBar(content: Text('${context.l10n.t('Common.error')}: $e')),
                        );
                      }
                    }
                  },
                  variant: AppButtonVariant.primary,
                  fullWidth: false,
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _infoCard(Widget child) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        border: Border.all(color: Theme.of(context).dividerColor),
        boxShadow: AppTheme.shadowSm,
      ),
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Ad>(
      future: _adFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (snapshot.hasError || !snapshot.hasData) {
          return Scaffold(
            appBar: AppBar(leading: const BackButton()),
            body: Center(child: Text('${context.l10n.t('Common.error')}: ${snapshot.error}')),
          );
        }

        final ad = snapshot.data!;

        return FutureBuilder<Map<String, dynamic>>(
          future: ApiService.getUserProfile(ad.userId),
          builder: (context, sellerSnapshot) {
            final sellerProfile = sellerSnapshot.data;
            final sellerPhone = sellerProfile?['user']?['phone'];

            return Scaffold(
              body: CustomScrollView(
                slivers: [
                  SliverAppBar(
                    expandedHeight: 320,
                    pinned: true,
                    backgroundColor: Theme.of(context).colorScheme.surface,
                    leading: Padding(
                      padding: const EdgeInsets.all(8),
                      child: CircleAvatar(
                        backgroundColor: Colors.black54,
                        child: IconButton(
                          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
                          onPressed: () => Navigator.of(context).pop(),
                        ),
                      ),
                    ),
                    actions: [
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: CircleAvatar(
                          backgroundColor: Colors.black54,
                          child: IconButton(
                            icon: Icon(
                              _isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                              color: _isFav ? AppTheme.redColor : Colors.white,
                            ),
                            onPressed: () => setState(() => _isFav = !_isFav),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: CircleAvatar(
                          backgroundColor: Colors.black54,
                          child: IconButton(
                            icon: const Icon(Icons.share_outlined, color: Colors.white),
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: 'https://dzmarketplus.com/ads/${ad.id}'));
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(context.l10n.t('Ads.linkCopied'))),
                              );
                            },
                          ),
                        ),
                      ),
                    ],
                    flexibleSpace: FlexibleSpaceBar(
                      background: Stack(
                        children: [
                          PageView.builder(
                            itemCount: ad.images.length,
                            onPageChanged: (i) => setState(() => _currentImage = i),
                            itemBuilder: (ctx, i) => CachedNetworkImage(
                              imageUrl: ad.images[i],
                              fit: BoxFit.cover,
                              placeholder: (ctx, url) => Container(color: Colors.grey[900]),
                              errorWidget: (ctx, url, err) => Container(
                                color: Colors.grey[900],
                                child: const Icon(Icons.image_outlined, color: Colors.white, size: 64),
                              ),
                            ),
                          ),
                          if (ad.images.length > 1)
                            Positioned(
                              bottom: 16,
                              left: 0,
                              right: 0,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: List.generate(
                                  ad.images.length,
                                  (i) => AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    margin: const EdgeInsets.symmetric(horizontal: 3),
                                    width: _currentImage == i ? 20 : 8,
                                    height: 8,
                                    decoration: BoxDecoration(
                                      color: _currentImage == i ? Colors.white : Colors.white54,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),

                  // Thumbnail strip
                  if (ad.images.length > 1)
                    SliverToBoxAdapter(
                      child: Container(
                        color: Theme.of(context).cardColor,
                        height: 64,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          itemCount: ad.images.length,
                          itemBuilder: (ctx, i) => GestureDetector(
                            onTap: () => setState(() => _currentImage = i),
                            child: Container(
                              width: 48,
                              margin: const EdgeInsets.only(right: 8),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                                border: Border.all(
                                  color: _currentImage == i ? AppTheme.primaryColor : Theme.of(context).dividerColor,
                                  width: _currentImage == i ? 2 : 1,
                                ),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(AppTheme.radiusSm - 1),
                                child: CachedNetworkImage(
                                  imageUrl: ad.images[i],
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                  SliverToBoxAdapter(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 16),
                        // Main details card
                        _infoCard(
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  AppBadge(
                                    label: ad.subcategory ?? ad.category,
                                    variant: AppBadgeVariant.primary,
                                  ),
                                  const Spacer(),
                                  Icon(Icons.remove_red_eye_outlined, size: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                                  const SizedBox(width: 4),
                                  Text(
                                    context.l10n.t('Ads.viewCount', params: [ad.viewCount.toString()]),
                                    style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                ad.title,
                                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.baseline,
                                textBaseline: TextBaseline.alphabetic,
                                children: [
                                  Text(
                                    ad.price == 0 ? context.l10n.t('Ads.negotiablePrice') : ad.formattedPrice,
                                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppTheme.primaryColor),
                                  ),
                                  if (ad.isNegotiable) ...[
                                    const SizedBox(width: 8),
                                    AppBadge(label: context.l10n.t('Ads.negotiable'), variant: AppBadgeVariant.green, fontSize: 10),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 14),
                              const Divider(),
                              const SizedBox(height: 10),
                              _DetailRow(Icons.location_on_outlined, ad.wilaya),
                              const SizedBox(height: 8),
                              _DetailRow(
                                Icons.shield_outlined,
                                '${context.l10n.t('Profile.conditionLabel')} : ${_conditionLabel(context, ad.condition)}',
                              ),
                              const SizedBox(height: 8),
                              _DetailRow(Icons.access_time_rounded, '${context.l10n.t('Ads.published')} ${timeago.format(ad.createdAt, locale: context.l10n.locale.languageCode)}'),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Description card
                        _infoCard(
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                                Text(context.l10n.t('Ads.description'), style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
                              const SizedBox(height: 12),
                              Text(
                                ad.description,
                                style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface, height: 1.6),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Location card
                        if (ad.location != null)
                          _infoCard(
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(context.l10n.t('Ads.location'), style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    const Icon(Icons.map_outlined, color: AppTheme.primaryColor),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        '${ad.location?['commune'] ?? context.l10n.t('Ads.commune')}, ${ad.location?['wilaya'] ?? ad.wilaya}',
                                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                                      ),
                                    ),
                                  ],
                                ),
                                if (ad.location?['address'] != null) ...[
                                  const SizedBox(height: 8),
                                  Text(
                                    ad.location?['address'],
                                    style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                                  ),
                                ],
                                const SizedBox(height: 14),
                                GestureDetector(
                                  onTap: () async {
                                    final lat = ad.location?['latitude'] ?? 36.75;
                                    final lng = ad.location?['longitude'] ?? 3.05;
                                    final url = Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lng');
                                    if (await canLaunchUrl(url)) {
                                      await launchUrl(url, mode: LaunchMode.externalApplication);
                                    }
                                  },
                                  child: Container(
                                    height: 160,
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).scaffoldBackgroundColor,
                                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                                      border: Border.all(color: Theme.of(context).dividerColor),
                                    ),
                                    child: Stack(
                                      children: [
                                        Positioned.fill(
                                          child: ClipRRect(
                                            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                                            child: AbsorbPointer(
                                              child: FlutterMap(
                                                options: MapOptions(
                                                  initialCenter: LatLng(
                                                    ad.location?['latitude'] ?? 36.75,
                                                    ad.location?['longitude'] ?? 3.05,
                                                  ),
                                                  initialZoom: 13.0,
                                                ),
                                                children: [
                                                  TileLayer(
                                                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                                    userAgentPackageName: 'com.oussamauri777.dzmarket_plus_mobile',
                                                  ),
                                                  MarkerLayer(
                                                    markers: [
                                                      Marker(
                                                        point: LatLng(
                                                          ad.location?['latitude'] ?? 36.75,
                                                          ad.location?['longitude'] ?? 3.05,
                                                        ),
                                                        width: 40,
                                                        height: 40,
                                                        child: const Icon(Icons.location_pin, color: Colors.red, size: 40),
                                                      ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                        ),
                                        Positioned(
                                          bottom: 8,
                                          right: 8,
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                            decoration: BoxDecoration(
                                              color: Theme.of(context).cardColor,
                                              borderRadius: BorderRadius.circular(AppTheme.radiusFull),
                                              boxShadow: AppTheme.shadowSm,
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(Icons.map_rounded, color: AppTheme.primaryColor, size: 14),
                                                SizedBox(width: 4),
                                                Text(context.l10n.t('Ads.googleMaps'),
                                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onSurface)),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        const SizedBox(height: 16),

                        // Seller card
                        _infoCard(
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(context.l10n.t('Ads.seller'), style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  GestureDetector(
                                    onTap: () => context.push('/user/${ad.userId}'),
                                    child: CircleAvatar(
                                      radius: 24,
                                      backgroundImage: ad.userImage != null ? CachedNetworkImageProvider(ad.userImage!) : null,
                                      backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                                      child: ad.userImage == null
                                          ? Text(
                                              ad.userName.isNotEmpty ? ad.userName[0].toUpperCase() : 'U',
                                              style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w700),
                                            )
                                          : null,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Flexible(
                                              child: GestureDetector(
                                                onTap: () => context.push('/user/${ad.userId}'),
                                                child: Text(
                                                  ad.userName,
                                                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            AppBadge(label: context.l10n.t('Ads.verified'), variant: AppBadgeVariant.green, fontSize: 9),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        GestureDetector(
                                          onTap: () => context.push('/user/${ad.userId}'),
                                          child: Text(context.l10n.t('Profile.viewProfile'),
                                            style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 13)),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Safety tips card
                        _infoCard(
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppTheme.orangeLightColor,
                              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                              border: Border.all(color: AppTheme.orangeColor.withValues(alpha: 0.2)),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.shield_outlined, color: AppTheme.orangeColor, size: 24),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(context.l10n.t('Ads.safetyTips'),
                                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.orangeColor)),
                                      const SizedBox(height: 4),
                                      Text(
                                        context.l10n.t('Ads.safetyTipsText'),
                                        style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface, height: 1.4),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Reviews section
                        FutureBuilder<Map<String, dynamic>>(
                          future: ApiService.getAdReviewsWithStats(ad.id),
                          builder: (context, snapshot) {
                            final data = snapshot.data;
                            final reviews = (data?['reviews'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
                            final stats = data?['stats'] as Map<String, dynamic>?;
                            final avgRating = (stats?['averageRating'] ?? 0).toDouble();
                            final totalRev = stats?['totalReviews'] ?? 0;
                            return _infoCard(
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(context.l10n.t('Ads.reviews'),
                                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      TextButton(
                                        onPressed: () => _showAddReviewDialog(ad.userId, ad.title),
                                        child: Text(context.l10n.t('Ads.writeReview'),
                                          style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                                      ),
                                    ],
                                  ),
                                  if (totalRev > 0) ...[
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        ...List.generate(5, (i) => Icon(
                                          i < avgRating.round() ? Icons.star_rounded : Icons.star_border_rounded,
                                          color: AppTheme.yellowColor, size: 20,
                                        )),
                                        const SizedBox(width: 8),
                                        Text(avgRating.toStringAsFixed(1), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                        const SizedBox(width: 4),
                                        Text('($totalRev)', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                                      ],
                                    ),
                                  ],
                                  const SizedBox(height: 12),
                                  if (reviews.isEmpty)
                                    Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 20),
                                      child: Center(
                                        child: Text(context.l10n.t('Profile.noReviewsDetail'),
                                          style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                                      ),
                                    )
                                  else ...[
                                    ...reviews.take(3).map((review) => Padding(
                                      padding: const EdgeInsets.only(bottom: 12),
                                      child: ReviewCard(
                                        userName: review['buyer']?['name'] ?? context.l10n.t('Profile.unknownUser'),
                                        userImage: review['buyer']?['image'],
                                        rating: (review['rating'] ?? 5).toDouble(),
                                        comment: review['comment'] ?? '',
                                        date: review['createdAt'] != null ? timeago.format(DateTime.parse(review['createdAt']), locale: context.l10n.locale.languageCode) : '',
                                        onTap: () => context.push('/user/${review['buyer']?['_id'] ?? review['buyer']}'),
                                      ),
                                    )),
                                  ],
                                ],
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 120),
                      ],
                    ),
                  ),
                ],
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
                        onPressed: () => _showCallBottomSheet(context, sellerPhone, ad.userName),
                        variant: AppButtonVariant.outline,
                        icon: Icons.phone_outlined,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: AppButton(
                        label: context.l10n.t('Ads.contact'),
                        onPressed: () async {
                          final loadingCtx = context;
                          showDialog(
                            context: loadingCtx,
                            barrierDismissible: false,
                            builder: (ctx) => const Center(child: CircularProgressIndicator()),
                          );
                          try {
                            final chatProvider = Provider.of<ChatProvider>(context, listen: false);
                            final conversationId = await chatProvider.getOrCreateConversation(ad.id, ad.userId);
                            if (context.mounted) {
                              try { Navigator.pop(context); } catch (_) {}
                              context.go('/messages?partner=${Uri.encodeComponent(ad.userName)}&conversationId=$conversationId');
                            }
                          } catch (e) {
                            if (context.mounted) {
                              final err = e.toString().toLowerCase();
                              final isAuthErr = err.contains('authenticated') || err.contains('authentifié') || err.contains('401') || err.contains('authent');
                              try { Navigator.pop(context); } catch (_) {}
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(isAuthErr
                                  ? context.l10n.t('Profile.loginRequired')
                                  : '${context.l10n.t('Common.error')}: $e')),
                              );
                              if (isAuthErr) context.push('/login');
                            }
                          }
                        },
                        icon: Icons.chat_bubble_outline_rounded,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _DetailRow(this.icon, this.text);
  @override
  Widget build(BuildContext context) => Row(
        children: [
          Icon(icon, size: 16, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      );
}
