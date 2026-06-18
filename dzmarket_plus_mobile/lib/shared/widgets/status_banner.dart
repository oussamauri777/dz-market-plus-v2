import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

enum BannerType { error, success, info, warning }

class StatusBanner extends StatelessWidget {
  final String message;
  final BannerType type;

  const StatusBanner({
    super.key,
    required this.message,
    this.type = BannerType.error,
  });

  @override
  Widget build(BuildContext context) {
    final colors = _colors;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: colors.bg,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(color: colors.border, width: 0.5),
      ),
      child: Row(
        children: [
          Icon(colors.icon, size: 20, color: colors.fg),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: colors.fg,
              ),
            ),
          ),
        ],
      ),
    );
  }

  ({Color bg, Color fg, Color border, IconData icon}) get _colors {
    switch (type) {
      case BannerType.error:
        return (
          bg: AppTheme.redLightColor,
          fg: AppTheme.redColor,
          border: AppTheme.redColor.withValues(alpha: 0.3),
          icon: Icons.error_outline,
        );
      case BannerType.success:
        return (
          bg: AppTheme.greenLightColor,
          fg: const Color(0xFF166534),
          border: AppTheme.greenColor.withValues(alpha: 0.3),
          icon: Icons.check_circle_outline,
        );
      case BannerType.info:
        return (
          bg: AppTheme.blueLightColor,
          fg: AppTheme.blueColor,
          border: AppTheme.blueColor.withValues(alpha: 0.3),
          icon: Icons.info_outline,
        );
      case BannerType.warning:
        return (
          bg: AppTheme.orangeLightColor,
          fg: AppTheme.orangeColor,
          border: AppTheme.orangeColor.withValues(alpha: 0.3),
          icon: Icons.warning_amber_rounded,
        );
    }
  }
}
