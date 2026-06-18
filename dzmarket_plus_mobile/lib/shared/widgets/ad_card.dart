import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/models/ad.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/providers/ad_provider.dart';

class AdCard extends StatefulWidget {
  final Ad ad;
  final bool showWilaya;

  const AdCard({super.key, required this.ad, this.showWilaya = true});

  @override
  State<AdCard> createState() => _AdCardState();
}

class _AdCardState extends State<AdCard> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
      lowerBound: 0.0,
      upperBound: 0.03,
    );
    _scale = Tween<double>(begin: 1.0, end: 0.97).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ad = widget.ad;
    return GestureDetector(
      onTapDown: (_) => _ctrl.forward(),
      onTapUp: (_) {
        _ctrl.reverse();
        context.push('/ads/${ad.id}');
      },
      onTapCancel: () => _ctrl.reverse(),
      child: AnimatedBuilder(
        animation: _scale,
        builder: (ctx, child) => Transform.scale(scale: _scale.value, child: child),
        child: Container(
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Theme.of(context).dividerColor),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Image ──────────────────────────────────────────────
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    child: AspectRatio(
                      aspectRatio: 1.3,
                      child: ad.images.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: ad.images.first,
                              fit: BoxFit.cover,
                              placeholder: (ctx, url) {
                                final isDark = Theme.of(context).brightness == Brightness.dark;
                                return Shimmer.fromColors(
                                  baseColor: isDark ? Colors.grey[800]! : const Color(0xFFE5E7EB),
                                  highlightColor: isDark ? Colors.grey[700]! : const Color(0xFFF9FAFB),
                                  child: Container(color: Theme.of(context).cardColor),
                                );
                              },
                              errorWidget: (ctx, url, err) => _ImagePlaceholder(),
                            )
                          : _ImagePlaceholder(),
                    ),
                  ),
                  // Favourite button
                  Positioned(
                    top: 8, right: 8,
                    child: Consumer<AdProvider>(
                      builder: (ctx, provider, _) {
                        final isFav = provider.isFavorite(ad.id);
                        return GestureDetector(
                          onTap: () => provider.toggleFavorite(ad),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: isFav
                                  ? Colors.red.withValues(alpha: 0.12)
                                  : Theme.of(context).cardColor.withValues(alpha: 0.9),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.1),
                                  blurRadius: 6,
                                ),
                              ],
                            ),
                            child: Icon(
                              isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                              size: 17,
                              color: isFav ? Colors.red : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  // "Négociable" top-left badge
                  if (ad.isNegotiable)
                    Positioned(
                      top: 8, left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          context.l10n.t('Ads.negotiable'),
                          style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                ],
              ),
              // ── Content ────────────────────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      ad.title,
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: Theme.of(context).colorScheme.onSurface,
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      ad.price == 0 ? context.l10n.t('Ads.negotiablePrice') : ad.formattedPrice,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                    if (widget.showWilaya) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.location_on_outlined, size: 10, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                          const SizedBox(width: 2),
                          Flexible(
                            child: Text(
                              ad.wilaya,
                              style: TextStyle(fontSize: 9, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ImagePlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFF3F4F6),
      child: const Center(
        child: Icon(Icons.image_outlined, size: 36, color: Color(0xFFD1D5DB)),
      ),
    );
  }
}

/// Shimmer skeleton shown while ads are loading
class AdCardSkeleton extends StatelessWidget {
  const AdCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor: isDark ? Colors.grey[800]! : const Color(0xFFE5E7EB),
      highlightColor: isDark ? Colors.grey[700]! : const Color(0xFFF9FAFB),
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Theme.of(context).dividerColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: AspectRatio(
                aspectRatio: 1.1,
                child: Container(color: isDark ? Colors.grey[850] : Colors.white),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(height: 12, width: double.infinity, color: isDark ? Colors.grey[850] : Colors.white, margin: const EdgeInsets.only(bottom: 4)),
                  Container(height: 12, width: 120, color: isDark ? Colors.grey[850] : Colors.white, margin: const EdgeInsets.only(bottom: 8)),
                  Container(height: 14, width: 90, color: isDark ? Colors.grey[850] : Colors.white),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
